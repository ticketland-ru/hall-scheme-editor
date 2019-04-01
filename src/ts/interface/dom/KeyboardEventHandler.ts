/*
 * Copyright (c) 2019 ООО «МДТЗК» (ticketland.ru)
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense copies of the Software,  and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import {EventBus} from "../../events/logical/EventBus";
import {TlandEvents} from "../../events/logical/TlandEvents";

export class KeyboardEventHandler{

    constructor() {
        let inputs = document.getElementsByClassName('stop_kb_propagation');
        this.initStopInputsKeyboardPropagation(inputs);
        document.onkeydown = (e) => {
            //при фокусе в поля ввода пропускаем событие
            if(e.target instanceof HTMLInputElement){
                return;
            }
            switch (e.code){
                case 'Escape': return EventBus.pushMessage(TlandEvents.REQUEST_SELECT_MODE);
                case 'Delete': case 'Backspace': return EventBus.pushMessage(TlandEvents.REQUEST_REMOVE_SELECTED,`{"keyCode":"${e.code}"}`);
                case 'ArrowRight': case 'ArrowLeft': case 'ArrowDown': case 'ArrowUp': return this.handleObjectTransform(e);
                case 'KeyZ': return this.handleUndoRedo(e);
                case 'KeyC': return this.handleCopy(e);
                case 'KeyV': return this.handlePaste(e);
            }
        };
    }

    private initStopInputsKeyboardPropagation(inputs: HTMLCollectionOf<Element>) {
        let len = inputs.length;
        let stopper = (e: KeyboardEvent)=>{
            if(!e.altKey && !e.ctrlKey && !e.metaKey ){
                e.stopPropagation();
            }
        };
        while(len--){
            let elem = <HTMLElement>inputs.item(len);
            elem.onkeydown = elem.onkeypress = elem.onkeyup = stopper;
        }
    }

    private handleObjectTransform(e: KeyboardEvent): void {
        let result = {shiftX:0,shiftY:0}, shiftMultiplier = 8;
        if(e.metaKey || e.ctrlKey || e.altKey){
            return;
        }
        switch(e.code){
            case 'ArrowRight': result.shiftX=1;break;
            case 'ArrowLeft': result.shiftX=-1;break;
            case 'ArrowDown': result.shiftY=1;break;
            case 'ArrowUp': result.shiftY=-1;break;
            default: throw new class implements Error {
                message: string = 'Bad keyboard event handling';
                name: string;

            }
        }
        if(e.shiftKey){
            result.shiftX*=shiftMultiplier;
            result.shiftY*=shiftMultiplier;
        }
        e.preventDefault();
        EventBus.pushMessage(TlandEvents.UPDATE_SELECTED, JSON.stringify(result));
    }

    private handleUndoRedo(e: KeyboardEvent): void {
        if(!e.ctrlKey && !e.metaKey){
            return;
        }
        if(e.shiftKey){
            EventBus.pushMessage(TlandEvents.REDO);
        } else {
            EventBus.pushMessage(TlandEvents.UNDO);
        }
    }

    private handleCopy(e: KeyboardEvent): void {
        if(e.metaKey || e.ctrlKey){
            EventBus.pushMessage(TlandEvents.COPY);
            e.preventDefault();
        }
    }

    private handlePaste(e: KeyboardEvent): void {
        if(e.metaKey || e.ctrlKey){
            EventBus.pushMessage(TlandEvents.PASTE);
            e.preventDefault();
        }
    }
}
