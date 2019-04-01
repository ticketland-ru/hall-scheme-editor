/*
 * Copyright (c) 2019 ООО «МДТЗК» (ticketland.ru)
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense copies of the Software,  and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import {UndoAndRedoPerformer} from "../../src/ts/components/helpers/UndoAndRedoPerformer";
import {EventBus} from "../../src/ts/events/logical/EventBus";
import {TlandEvents} from "../../src/ts/events/logical/TlandEvents";

const assert = require('chai').assert;

describe('UndoAndRedoPerformer',()=>{
    let undoPerformer;
    let bufferSize;

    beforeEach(()=>{
        undoPerformer = new UndoAndRedoPerformer();
        EventBus.clearState();
        bufferSize = undoPerformer.BUFFER_SIZE;
    });

    it('При получении сообщения CHANGED data сохраняется в массив',()=>{
        undoPerformer.handleEvent(TlandEvents.CHANGED, 'test');
        assert.equal(undoPerformer.storage[1],'test');
    });

    it('Буфер перезаписывается при записи в уже полный буфер',()=>{
        for(let i = 0; i<bufferSize+2; i++){
            undoPerformer.handleEvent(TlandEvents.CHANGED, 'test'+i);
        }
        assert.equal(undoPerformer.storage[2],'test'+(bufferSize+1));
    });

    it('При получении сообщения UNDO в EventBus летит сообщение с содержимым предыдущего состояния',()=>{
        for(let i = 0; i<bufferSize; i++){
            undoPerformer.handleEvent(TlandEvents.CHANGED, 'test'+i);
        }
        for(let i=bufferSize-2; i>=0; i--){
            undoPerformer.handleEvent(TlandEvents.UNDO, null);
            assert.equal(EventBus.lastState,TlandEvents.CANVAS_RESTORE_REQUEST);
            assert.equal(EventBus.lastData, 'test'+i, ('Error iteration ' + (9-i)));
        }
    });

    it('Нельзя отменить действие сразу после инициализации',()=>{
        try {
            undoPerformer.handleEvent(TlandEvents.UNDO);
        } catch (e){}

        assert.equal(EventBus.lastState, TlandEvents.ERROR);
    });

    it('Нельзя повторить больше действий, чем отменено',()=>{
        undoPerformer.handleEvent(TlandEvents.CHANGED, 'test');
        undoPerformer.handleEvent(TlandEvents.CHANGED, 'test1');
        undoPerformer.handleEvent(TlandEvents.UNDO);
        undoPerformer.handleEvent(TlandEvents.REDO);
        try {
            undoPerformer.handleEvent(TlandEvents.REDO);
        } catch (e){}

        assert.equal(EventBus.lastState, TlandEvents.ERROR);
    });

    it('При получении сообщения UNDO больше раз, чем существует предыдущих состояний, возникнет ошибка',()=>{
        undoPerformer.handleEvent(TlandEvents.CHANGED, 'test');
        undoPerformer.handleEvent(TlandEvents.CHANGED, 'test1');
        undoPerformer.handleEvent(TlandEvents.UNDO, null);
        try {
            undoPerformer.handleEvent(TlandEvents.UNDO, null);
        } catch (e){}

        assert.equal(EventBus.lastState, TlandEvents.ERROR);
        assert.equal(EventBus.lastData, 'No more undo possible');
    });

    it('При получении сообщения UNDO более BUFFER_SIZE-1 раз возникнет ошибка',()=>{
        for(let i = 0; i<bufferSize+2; i++){
            undoPerformer.handleEvent(TlandEvents.CHANGED, 'test'+i);
        }
        for(let i=bufferSize-1; i>0; i--){
            undoPerformer.handleEvent(TlandEvents.UNDO, null);
            assert.notEqual(EventBus.lastState,TlandEvents.ERROR);
        }
        try {
            undoPerformer.handleEvent(TlandEvents.UNDO, null);
        } catch (e){}
        assert.equal(EventBus.lastState, TlandEvents.ERROR);
        assert.equal(EventBus.lastData, 'No more undo possible');
    });

    it('При получении сообщения REDO EventBus отправляется последнее отменённое состояние',()=>{
        for(let i = 0; i<bufferSize; i++){
            undoPerformer.handleEvent(TlandEvents.CHANGED, 'test'+i);
        }
        for(let i=0; i<bufferSize-1; i++){
            undoPerformer.handleEvent(TlandEvents.UNDO, null);
        }
        for(let i=1; i<bufferSize; i++){
            undoPerformer.handleEvent(TlandEvents.REDO, null);
            assert.equal(EventBus.lastState,TlandEvents.CANVAS_RESTORE_REQUEST);
            assert.equal(EventBus.lastData, 'test'+i);
        }
    });

    it('При получении сообщения REDO возникает ошибка, если пытаться восстановить несуществующее состояние',()=>{
        try {
            undoPerformer.handleEvent(TlandEvents.REDO, null);
        } catch (e) {}

        assert.equal(EventBus.lastState, TlandEvents.ERROR);
        assert.equal(EventBus.lastData, 'No more redo possible');
    });

    it('После получения сообщения CHANGED блокируется возможность повтора действия',()=>{
        undoPerformer.handleEvent(TlandEvents.CHANGED, 'test');
        undoPerformer.handleEvent(TlandEvents.CHANGED, 'test1');
        undoPerformer.handleEvent(TlandEvents.CHANGED, 'test2');
        undoPerformer.handleEvent(TlandEvents.UNDO);
        undoPerformer.handleEvent(TlandEvents.UNDO);
        undoPerformer.handleEvent(TlandEvents.CHANGED, 'test2');

        try {
            undoPerformer.handleEvent(TlandEvents.REDO);
        } catch (e){}

        assert.equal(EventBus.lastState, TlandEvents.ERROR);
        assert.equal(EventBus.lastData, 'No more redo possible');
    });

    it('После получения сообщения CANVAS_LOAD_REQUEST блокируется возможность отмены',()=>{
        undoPerformer.handleEvent(TlandEvents.CHANGED, 'test');
        undoPerformer.handleEvent(TlandEvents.CHANGED, 'test1');
        undoPerformer.handleEvent(TlandEvents.CHANGED, 'test2');

        undoPerformer.handleEvent(TlandEvents.CANVAS_LOAD_REQUEST);
        try {
            undoPerformer.handleEvent(TlandEvents.UNDO);
        } catch (e){}

        assert.equal(EventBus.lastState, TlandEvents.ERROR);
        assert.equal(EventBus.lastData, 'No more undo possible');
    });

    it('После получения сообщения CANVAS_LOAD_REQUEST блокируется возможность повтора',()=>{
        undoPerformer.handleEvent(TlandEvents.CHANGED, 'test');
        undoPerformer.handleEvent(TlandEvents.CHANGED, 'test1');
        undoPerformer.handleEvent(TlandEvents.CHANGED, 'test2');
        undoPerformer.handleEvent(TlandEvents.UNDO);

        undoPerformer.handleEvent(TlandEvents.CANVAS_LOAD_REQUEST);
        try {
            undoPerformer.handleEvent(TlandEvents.REDO);
        } catch (e){}

        assert.equal(EventBus.lastState, TlandEvents.ERROR);
        assert.equal(EventBus.lastData, 'No more redo possible');
    });

});
