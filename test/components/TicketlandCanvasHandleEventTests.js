/*
 * Copyright (c) 2019 ООО «МДТЗК» (ticketland.ru)
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense copies of the Software,  and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import {EventBus} from "../../src/ts/events/logical/EventBus";
import {Seat} from "../../src/ts/components/hall_objects/Seat";
import {TlandEvents} from "../../src/ts/events/logical/TlandEvents";
import {Section} from "../../src/ts/components/hall_objects/Section";
import {ControlPoint} from "../../src/ts/components/hall_objects/ControlPoint";
import {TestObject} from "../../src/ts/components/hall_objects/TestObject";

const assert = require('chai').assert;
const canv = require('../../src/ts/components/TicketlandCanvas');

describe("Ticketland Canvas Events Handling", () => {
    let canvas;

    beforeEach(() => {
        canvas = new canv.TicketlandCanvas('canvas');
        canvas.setWidth(1000);
        canvas.setHeight(1000);
        EventBus.clearState();
    });

    it('Сообщение UPDATE_SELECTED вызывает метод updateSelected',()=>{
        canvas.selectedSection = new Section();

        canvas.handleEvent(TlandEvents.UPDATE_SELECTED, '{"name":"test"}');

        assert.equal(canvas.selectedSection.sectionName,'test');
    });

    it('Сообщение REQUEST_ADD_OBJECT включает режим adding и сохраняет данные о том, какой объект надо добавить',()=>{
        canvas.handleEvent(TlandEvents.REQUEST_ADD_OBJECT,'test');

        assert.isTrue(canvas.adding);
        assert.equal(canvas.data_to_add, 'test');
    });

    it('Сообщение REQUEST_SELECT_MODE выключает режим добавления',()=>{
        canvas.adding = true;

        canvas.handleEvent(TlandEvents.REQUEST_SELECT_MODE,null);

        assert.isFalse(canvas.adding);
    });

    it('Сообщение ZOOM_IN приближает канву',()=>{
        canvas.handleEvent(TlandEvents.ZOOM_IN, null);

        assert.equal(canvas.getZoom(),1.25);

    });

    it('Сообщение ZOOM_OUT отдаляет канву',()=>{
        canvas.handleEvent(TlandEvents.ZOOM_OUT);

        assert.equal(canvas.getZoom(),0.75);
    });

    it('Сообщение REQUEST_ADD_SECTION добавляет секцию и активирует режим добавления контрольной точки', ()=>{
        canvas.selectedSection = null;

        canvas.handleEvent(TlandEvents.REQUEST_ADD_SECTION);

        assert.exists(canvas.selectedSection);
        assert.equal(EventBus.lastState,TlandEvents.REQUEST_ADD_OBJECT);
        assert.equal(EventBus.lastData, '{"type":"control_point"}')
    });

    it('Сообщение CANVAS_LOAD_REQUEST загужает объекты на канву',()=>{
        canvas.handleEvent(TlandEvents.CANVAS_LOAD_REQUEST,'{"type":"schema","offsetX":4,"offsetY":4,"width":24,"height":24,"objects":[{"type":"seat","x":10,"y":11,"attrs":{"sectionId":0}},{"type":"seat","x":13,"y":14,"attrs":{"sectionId":0}}]}');

        assert.equal(canvas.getObjects().length,2);
        assert.equal(EventBus.lastState,TlandEvents.CHANGED);
    });

    it('Сообщение CANVAS_UPDATE_REQUEST приводит канву в соотвествие с JSON-версией',()=>{
        canvas.handleEvent(TlandEvents.CANVAS_RESTORE_REQUEST,'{"type":"schema","offsetX":4,"offsetY":4,"width":24,"height":24,"objects":[{"type":"seat","x":10,"y":11,"attrs":{"sectionId":0}},{"type":"seat","x":13,"y":14,"attrs":{"sectionId":0}}]}');

        assert.equal(canvas.getObjects().length,2);
    });

    it('Cooбщение UPDATE_SELECTED двигает выделенный объект на канве',()=>{
        let obj = new TestObject();
        obj.left = 11;
        obj.top = 10;
        canvas.addAll([obj]);
        canvas.setActiveObject(obj);

        canvas.handleEvent(TlandEvents.UPDATE_SELECTED,'{"shiftX":5,"shiftY":-4}');

        assert.equal(obj.left,16);
        assert.equal(obj.top,6);
        assert.equal(EventBus.lastState,TlandEvents.CHANGED);
    });

    it('Сообщение COPY провоцирует канву на отправку выделенного объекта в формате JSON в буфер обмена',()=>{
        let seat = new Seat(10,11,12,13);
        canvas.setActiveObject(seat);

        canvas.handleEvent(TlandEvents.COPY);

        assert.equal(EventBus.lastState,TlandEvents.REQUEST_WRITE_CLIPBOARD);
    });

    it('Сообщение ADD_FROM_CLIPBOARD провоцирует канву на вставку одиночного объекта',()=>{
        canvas.handleEvent(TlandEvents.ADD_FROM_CLIPBOARD, JSON.stringify(new ControlPoint(10,11)));

        assert.equal(canvas._objects[0].type, 'control_point');
        assert.equal(EventBus.lastState,TlandEvents.CHANGED);
    });

    it('Сообщение ADD_FROM_CLIPBOARD провоцирует канву на вставку группы объектов',()=>{
        canvas.handleEvent(TlandEvents.ADD_FROM_CLIPBOARD, '{"type":"selection","objects":[{"type":"test"},{"type":"test"}]}');

        assert.equal(canvas._objects.length, 2);
        assert.equal(EventBus.lastState,TlandEvents.CHANGED);
    });

    it('Сообщение ADD_FROM_CLIPBOARD завершается ошибкой, если приехали некорректные данные',()=>{
        try {
            canvas.handleEvent(TlandEvents.ADD_FROM_CLIPBOARD, '{}');
        } catch(e){}

        assert.equal(EventBus.lastState,TlandEvents.ERROR);
        assert.equal(EventBus.lastData,'Incorrect data to paste');
    });

    it('Сообщение REQUEST_REMOVE_SELECTED прововоцирует канву на удаление выделенного объекта',()=>{
        let obj = new TestObject();
        canvas.addAll([obj]);
        canvas.setActiveObject(obj);

        canvas.handleEvent(TlandEvents.REQUEST_REMOVE_SELECTED);

        assert.isEmpty(canvas.getObjects());
        assert.equal(EventBus.lastState,TlandEvents.CHANGED);
    });

    it('Сообщение REQUESTED_SAVE провоцирует канву на отправку схемы сообщением SAVE_DATA',()=>{
        canvas.handleEvent(TlandEvents.REQUESTED_SAVE);

        let parsed = JSON.parse(EventBus.lastData);
        assert.equal(EventBus.lastState, TlandEvents.SAVE_DATA);
        assert.equal(parsed.type, 'schema');
    });

});
