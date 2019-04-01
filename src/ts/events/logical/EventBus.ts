/*
 * Copyright (c) 2019 ООО «МДТЗК» (ticketland.ru)
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense copies of the Software,  and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import {TlandEvents} from "./TlandEvents";
import {loggingEnabled} from "../../configs/config";
import {ErrorHandler} from "./ErrorHandler";
import {Observer} from "./Observer";

/**
 * Класс отвечает за коммуникацию логических действий между компонентами.
 * Работает в режиме "тупого" хаба, отправляя каждую команду каждому подписчику.
 * Каждому подписчику задачи ставятся асинхронно
 * Метод handleEvent возвращает управление, когда все подписчики выполнили задачу
 */
export class EventBus{
    private static instance: EventBus;
    private static listeners: Array<any> = [];
    private static lastState: TlandEvents = TlandEvents.INITIALIZED;
    private static lastData: string = null;
    private static errorHandler = new ErrorHandler();

    private constructor(){
    }

    static addListener(object: Observer): void{
        EventBus.listeners.push(object);
    }

    static pushMessage(event :TlandEvents, data: string = null): void{
        if(loggingEnabled) {
            let ts = new Date();
            console.log(ts.toUTCString()+'.'+(Date.now()%1000)+" Pushed " + event + ", " + data);
        }
        EventBus.lastState = event;
        EventBus.lastData = data;
        let len = EventBus.listeners.length;
        //выбрасывает ошибку, прерывает действие
        this.errorHandler.handleEvent(event,data);
        let promises: Array<Promise<any>> = [];
        for(let i=0; i<len;i++) {
            promises.push(this.promisify(this.listeners[i], event, data));
        }
        Promise.all(promises).catch((e: Error)=>{throw e});
    }

    static promisify(object: Observer, event: TlandEvents, data: string){
        return new Promise<any>((resolve: any, reject: any)=>{
            try{
                object.handleEvent(event, data);
                resolve();
            } catch (e) {
                reject(e);
            }
        });
    }

    static getState(): string{
        return EventBus.lastState.toString();
    }

    private static clearState(){
        EventBus.listeners = [];
        EventBus.lastData = undefined;
        EventBus.lastState = undefined;
    }
}
