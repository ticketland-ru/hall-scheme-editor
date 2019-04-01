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

/**
 * Простенький кольцевой буфер
 */
export class UndoAndRedoPerformer {
    private readonly BUFFER_SIZE = 10;
    private haveElements: boolean = false;
    private storage: Array<any> = [];
    private pointer: number = 0;
    private possibleUndoLength: number = 0;
    private possibleRedoLength: number = 0;

    private push(data: any): void{
        this.incrementPointer();
        this.possibleRedoLength = 0;
        this.storage[this.pointer]=data;
    }

    private goBack(): any{
        this.decrementPointer();
        return this.storage[this.pointer];
    }

    private goFurther(): any{
        this.incrementPointer();
        return this.storage[this.pointer];
    }

    private incrementPointer():void{
        this.pointer = ++this.pointer%this.BUFFER_SIZE;
        //first insertion initialisation
        if(this.haveElements) {
            this.possibleUndoLength = (++this.possibleUndoLength > this.BUFFER_SIZE - 1) ? this.BUFFER_SIZE - 1 : this.possibleUndoLength;
        } else{
            this.haveElements = true;
        }
        this.possibleRedoLength = --this.possibleRedoLength<0 ? 0 : this.possibleRedoLength;
    }

    private decrementPointer(): void{
        this.pointer = --this.pointer<0?this.BUFFER_SIZE-1:this.pointer;
        this.possibleUndoLength = --this.possibleUndoLength<0 ? 0 : this.possibleUndoLength;
        this.possibleRedoLength = (++this.possibleRedoLength > this.BUFFER_SIZE-1)? this.BUFFER_SIZE-1: this.possibleRedoLength;
    }

    private undo(): void{
        if (this.possibleUndoLength!=0) {
            EventBus.pushMessage(TlandEvents.CANVAS_RESTORE_REQUEST, this.goBack());
        } else {
            EventBus.pushMessage(TlandEvents.ERROR, 'No more undo possible');
        }
    }

    private redo(): void{
        if (this.possibleRedoLength!=0) {
            EventBus.pushMessage(TlandEvents.CANVAS_RESTORE_REQUEST, this.goFurther());
        } else {
            EventBus.pushMessage(TlandEvents.ERROR, 'No more redo possible');
        }
    }

    handleEvent(event: TlandEvents, data: string):void{
        switch (event) {
            case TlandEvents.UNDO: return this.undo();
            case TlandEvents.REDO: return this.redo();
            case TlandEvents.CHANGED: return this.push(data);
            case TlandEvents.CANVAS_LOAD_REQUEST: return this.clear();
        }
    }

    private clear() {
        this.haveElements = false;
        this.possibleUndoLength = 0;
        this.possibleRedoLength = 0;
    }
}
