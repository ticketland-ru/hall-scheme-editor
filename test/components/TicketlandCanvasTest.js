/*
 * Copyright (c) 2019 ООО «МДТЗК» (ticketland.ru)
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense copies of the Software,  and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import {TicketlandCanvas} from "../../src/ts/components/TicketlandCanvas";
import {ControlPoint} from "../../src/ts/components/hall_objects/ControlPoint";
import {Section} from "../../src/ts/components/hall_objects/Section";
import {Seat} from "../../src/ts/components/hall_objects/Seat";
import {StageCenter} from "../../src/ts/components/hall_objects/svg_objects/StageCenter";
import {Stage} from "../../src/ts/components/hall_objects/svg_objects/Stage";
import {TlandEvents} from "../../src/ts/events/logical/TlandEvents";
import {EventBus} from "../../src/ts/events/logical/EventBus";
import {StairwayStraight} from "../../src/ts/components/hall_objects/svg_objects/StairwayStraight";
import {ErrorHandler} from "../../src/ts/events/logical/ErrorHandler";
import {TestObject} from "../../src/ts/components/hall_objects/TestObject";
import {TlandText} from "../../src/ts/components/hall_objects/TlandText";
import {fabric} from "fabric";
import {TlandSelection} from "../../src/ts/components/hall_objects/TlandSelection";
import {isTlandObject} from "../../src/ts/components/hall_objects/TlandObject";

const assert = require('chai').assert;
const comp = require('../../src/ts/components/hall_objects/Seat');
const canv = require('../../src/ts/components/TicketlandCanvas');

function prepareSeatlessSchema(canvas) {
    const seat = new comp.Seat(5.35, 7.85, 10, 0);
    const seat1 = new comp.Seat(10, 10, 9, 0);
    const seat2 = new comp.Seat(15, 15, 9, 0);
    const sect = new Section();
    sect.controls = [new ControlPoint(0, 0), new ControlPoint(0, 0), new ControlPoint(0, 0)];
    sect._sectionId = 10;
    sect.freeSeating = false;
    const sect1 = new Section();
    sect1.controls = [new ControlPoint(0, 0), new ControlPoint(0, 0), new ControlPoint(0, 0)];
    sect1._sectionId = 9;
    sect1.freeSeating = true;
    canvas.addAll([seat, seat1, seat2, sect, sect1]);
    const schema = canvas.exportContentsToJsonString();
    return schema;
}

describe("Ticketland Canvas", () => {
    let canvas;

    beforeEach(() => {
        canvas = new canv.TicketlandCanvas('canvas');
        canvas.setWidth(1000);
        canvas.setHeight(1000);
        canvas.recalcViewport();
        EventBus.clearState();
    });

    it("Сетка имеет шаг в 4 пикселя", () => {
        assert.equal(canvas.gridStep, 4);
    });

    it("Метод addAll добавляет объект на канву", () => {
        const seat = new comp.Seat(5.35, 7.85, 10, 0);
        canvas.addAll([seat]);
        assert.equal(canvas.getObjects()[0], seat);
    });

    it("места удаляются методом removeAll при передаче массива объектов мест", () => {
        const seat = new comp.Seat(5.35, 7.85, 10, 0);
        const seat1 = new comp.Seat(10, 10, 10, 0);
        canvas.addAll(seat, seat1);
        canvas.removeAll([seat, seat1]);
        assert.equal(canvas.getObjects()[0], undefined);
    });

    it("метод removeSelected удаляет все объекты, кроме мест, из выделения и не удаляет не выделенные", () => {
        const seat = new comp.Seat(5.35, 7.85, 10, 0);
        const obj = new TestObject();

        canvas.addAll([seat, obj]);
        canvas.discardActiveObject();
        let select = new TlandSelection([seat, obj], {
            canvas: canvas,
        });
        canvas.setActiveObject(select);
        canvas.removeSelected();

        assert.equal(canvas.getObjects()[0].type, seat.type);
        assert.notExists(canvas.getObjects()[1]);
    });

    it("метод removeSelected удаляет одиночный объект (кроме места) и не удаляет остальные", () => {
        const seat = new comp.Seat(5.35, 7.85, 10, 0);
        const cpoint = new ControlPoint(15,15);
        const sect = new Section();
        sect.addControlPoint(cpoint);
        const seat2 = new comp.Seat(25, 25, 25, 0);
        canvas.addAll([seat, sect, seat2]);
        canvas.discardActiveObject();
        canvas.setActiveObject(seat);
        canvas.removeSelected();
        canvas.setActiveObject(seat2);
        canvas.removeSelected();
        assert.equal(canvas.getObjects()[0].type, sect.type, '1');
        assert.equal(canvas.getObjects()[1].type, seat.type, '2');
        assert.equal(canvas.getObjects()[2].type, seat2.type, '3');
        assert.notExists(canvas.getObjects()[3], '4');
        canvas.selectedSection = sect;
        canvas.discardActiveObject();
        canvas.removeSelected();
        assert.equal(canvas.getObjects()[0].type, seat.type, '5');
        assert.equal(canvas.getObjects()[1].type, seat2.type, '6');
        assert.notExists(canvas.getObjects()[2], '7');
    });

    it("метод handleSelection не меняет свойства одиночного выделенного объекта",()=>{
        const object = new Section();
        object.top = 0;
        object.left = 0;
        object.lockScalingX = false;
        object.lockScalingY = false;
        canvas.addAll([object]);
        canvas.setActiveObject(object);
        canvas.handleSelection();
        assert.isFalse(object.lockScalingX);
        assert.isFalse(object.lockScalingY);
    });

    it("метод handleSelection блокирует возможность изменения размера активного выделения",()=>{
        const seat = new comp.Seat(5.35, 7.85, 10, 0);
        const seat1 = new comp.Seat(10, 10, 10, 0);
        const seat2 = new comp.Seat(25, 25, 25, 0);
        canvas.addAll([seat, seat1, seat2]);
        canvas.discardActiveObject();
        const select = new TlandSelection([seat, seat1, seat2], {
            canvas: canvas,
        });
        canvas.setActiveObject(select);
        canvas.handleSelection();
        assert.isTrue(select.lockScalingX);
        assert.isTrue(select.lockScalingY);
    });

    it("метод isPlaceBusy возвращает true для места, рядом с которым (в радиусе 20px) расположено место", () => {
        const seat = new comp.Seat(4, 8, 10, 0);
        const seat1 = new comp.Seat(12, 8, 11, 0);
        canvas.addAll([seat]);
        const isBusy = canvas.isPlaceBusy(seat1);
        assert.isTrue(isBusy);
    });

    it("метод isPlaceBusy возвращает false при проверке пересечения места с самим собой", () => {
        const seat = new comp.Seat(4, 8, 10, 0);
        canvas.addAll([seat]);
        const isBusy = canvas.isPlaceBusy(seat);
        assert.isFalse(isBusy);
    });

    it("метод isPlaceBusy возвращает false для места, рядом с которым (в радиусе 20px) НЕ расположено место", () => {
        const seat = new comp.Seat(4, 8, 10, 0);
        canvas.addAll([seat]);
        let seat2 = new Seat(64,64,0,0);
        const isBusy = canvas.isPlaceBusy(seat2);
        assert.isFalse(isBusy);
    });

    it("метод isPlaceBusy возвращает false, если в качестве аргумента приехало не место",()=>{
        const seat = new comp.Seat(4, 8, 10, 0);
        canvas.addAll([seat]);
        let obj = new TestObject({left:4,top:8});
        assert.isFalse(canvas.isPlaceBusy(obj));
    });

    it("метод isOutOfArea возвращает false для объектов внутри канваса",()=>{
        const seat = new comp.Seat(4, 8, 10, 0);
        assert.isFalse(canvas.isOutOfArea(seat));
    });

    it("метод isOutOfArea возвращает true для объектов вне канваса",()=>{
        const seat = new comp.Seat(4, -8, 10, 0);
        const seat1 = new comp.Seat(-4, 8, 10, 0);
        const seat2 = new comp.Seat(1004, 8, 10, 0);
        const seat3 = new comp.Seat(4, 1008, 10, 0);
        assert.isTrue(canvas.isOutOfArea(seat.calcAndSaveTransformMatrix()));
        assert.isTrue(canvas.isOutOfArea(seat1.calcAndSaveTransformMatrix()));
        assert.isTrue(canvas.isOutOfArea(seat2.calcAndSaveTransformMatrix()));
        assert.isTrue(canvas.isOutOfArea(seat3.calcAndSaveTransformMatrix()));
    });

    it("метод getTransformMatrix возвращает сохранённую матрицу преобразования для места",()=>{
        const seat = new comp.Seat(4, 8, 10, 0);
        let mtx = TicketlandCanvas.getTransformMatrix(seat);
        seat.top = 20;
        seat.left = 20;
        assert.equal(mtx, TicketlandCanvas.getTransformMatrix(seat));
    });

    it("метод getTransformMatrix возвращает вновь вычисленную матрицу преобразования для любого объекта, кроме места",()=>{
        const rect = new fabric.Rect({
            top: 10,
            left: 10
        });
        let mtx = TicketlandCanvas.getTransformMatrix(rect);
        rect.top = 20;
        assert.notEqual(mtx, TicketlandCanvas.getTransformMatrix(rect));
    });

    it("Метод getWidthHeightOffset возврщает отступ, ширину и высоту по крайним координатам",()=>{
       const seat = new Seat(12,16,13,14);
       const seat1 = new Seat(52,60,53,54);
       const seat2 = new Seat(24,24,25,26);
       canvas.addAll([seat,seat1,seat2]);
       let dims = TicketlandCanvas.getOffsetWidthHeight(canvas.getObjects());
       assert.equal(dims.offsetX, 4);
       assert.equal(dims.offsetY, 8);
       assert.equal(dims.width,56);
       assert.equal(dims.height, 60);
    });

    it("Метод eligiblePosition возвращает false, если объект лежит вне области канваса",()=>{
        let obj = new TestObject();
        obj.left = -2;
        obj.top = 10;
        assert.isFalse(canvas.eligiblePosition(obj));
    });

    it("Метод eligiblePosition возвращает true, если объект лежит внутри области канваса",()=>{
        let obj = new TestObject({left:2,top:2});
        assert.isTrue(canvas.eligiblePosition(obj));
    });

    it("Метод eligiblePosition возвращает false, если место накладывается на другое место",()=>{
       let seat = new Seat(12,16,0,0);
       let seat2 = new Seat(16,16,5,5);
       canvas.addAll([seat]);
       assert.isFalse(canvas.eligiblePosition(seat2));
    });

    it("Метод eligiblePosition возвращает true, если все объекты выделения лежат внутри рабочей области",()=>{
        let obj = new TestObject({left:10,top:10});
        let obj2 = new TestObject({left:15,top:15});
        let selection = new TlandSelection();
        selection.addWithUpdate(obj).addWithUpdate(obj2);
        assert.isTrue(canvas.eligiblePosition(selection));
    });

    it("Метод eligiblePosition возвращает false, если хотя бы один объект выделения вышел за рабочую областб",()=>{
        let obj = new TestObject({left:10,top:10});
        let obj2 = new TestObject({left:15,top:15});
        let selection = new TlandSelection();
        selection.addWithUpdate(obj).addWithUpdate(obj2);
        selection.moveOnCanvas(0,0,0);
        selection.setCoords();
        assert.isFalse(canvas.eligiblePosition(selection))
    });

    it("Метод eligiblePosition возвращает false, если центр сцены выходит за её границы",()=>{
        let stage = new Stage(30,16.4,undefined,undefined,15,16,true);
        stage.setCoords();
        stage.stageCenter.left=15;
        stage.stageCenter.top=21;
        assert.isFalse(canvas.eligiblePosition(stage.stageCenter));
    });

    it("Если выделен один объект, метод updateSelected обновляет его поля",()=>{
        let obj = new TestObject();
        canvas.setActiveObject(obj);

        canvas.updateSelected('{"hidden":"true"}');

        assert.isTrue(obj.hidden);
    });

    it("Если ничего не выделено, метод updateSelected обновляет выделенную секцию",()=>{
        let sect = new Section();
        canvas.selectedSection = sect;
        canvas.discardActiveObject();

        canvas.updateSelected('{"fill":"#ffffff","name":"test","freeSeating":true}');

        assert.equal(sect.polygon.fill,'#ffffff');
        assert.isTrue(sect.freeSeating);
        assert.equal(sect.sectionName,'test');
    });

    it("Если ничего не выделено и приехали некорректные данные, метод updateSelected выбрасывает ошибку",()=>{
        canvas.selectedSection = new Section();
        canvas.discardActiveObject();

        try {
            canvas.updateSelected('{}');
            assert.fail('No error generated');
        } catch (e){
            assert.match(e.message, /Section data update: illegal argument in JSON.+/);
        }
        assert.equal(EventBus.lastState, TlandEvents.ERROR);
    });


    it('Метод updateSelected выдаёт ошибку в случае, если для выделенного объекта придут пустые даныне',()=>{
        let obj = new TestObject();
        canvas.setActiveObject(obj);

        try {
            canvas.updateSelected('{}');
            assert.fail();
        } catch (e){

            assert.match(e.message,/Incorrect update command:.+/);
        }
    });

    it('Метод updateSelected выдаёт ошибку в случае, если для выделенного объекта придут некорректные даныне',()=>{
        let obj = new TestObject();
        canvas.setActiveObject(obj);

        try {
            canvas.updateSelected('{"x":"a"}');
            assert.fail();
        } catch (e){
            assert.match(e.message,/Incorrect update command:.+/);
        }
    });

    it('Метод addObjectFromPointer ничего не делает в режиме выделения', ()=>{
        canvas.handleEvent(TlandEvents.REQUEST_SELECT_MODE);
        let Ievent = {e:{target:canvas}};

        canvas.addObjectFromPointer(Ievent);

        assert.equal(canvas.getObjects().length,0);
    });

    it('Метод addObjectFromPointer добавляет объект в режиме добавления и выключает режим',()=>{
        canvas.handleEvent(TlandEvents.REQUEST_ADD_OBJECT,'{"type":"section"}');
        let Ievent = {e:{target:canvas}};

        canvas.addObjectFromPointer(Ievent);

        assert.equal(canvas.getObjects().length,1);
        assert.equal(canvas.getObjects()[0].type,'section');
        assert.equal(EventBus.lastState,TlandEvents.REQUEST_SELECT_MODE);
        assert.isFalse(canvas.adding);
    });

    it('Метод addObjectFromPointer добавляет контрольную точку и не выключает режим добавления',()=>{
        canvas.selectedSection = new Section();
        canvas.handleEvent(TlandEvents.REQUEST_ADD_OBJECT,'{"type":"control_point"}');
        let Ievent = {e:{target:canvas}};

        canvas.addObjectFromPointer(Ievent);

        assert.equal(canvas.getObjects().length,1);
        assert.equal(canvas.getObjects()[0].type,'control_point');
        assert.isTrue(canvas.adding);
    });

    it('Метод zoomIn приближает канву',()=>{
        canvas.zoomIn();
        assert.equal(canvas.getZoom(),1.25);

        canvas.zoomIn();
        assert.equal(canvas.getZoom(),1.5);

    });

    it('Метод zoomIn не приближает канву ближе максимального зума',()=>{
        canvas.setZoom(Math.max(...canvas.zoomFactors));
        canvas.zoomIn();
        assert.equal(canvas.getZoom(),Math.max(...canvas.zoomFactors));
    });

    it('Метод zoomOut отдаляет канву',()=>{
        canvas.zoomOut();

        assert.equal(canvas.getZoom(),0.75);

        canvas.zoomOut();

        assert.equal(canvas.getZoom(),0.6);
    });

    it('Метод zoomOut не отдаляет канву дальше минимального зума',()=>{
        canvas.setZoom(Math.min(...canvas.zoomFactors));
        canvas.zoomOut();
        assert.equal(canvas.getZoom(),Math.min(...canvas.zoomFactors));
    });

    it("При выделении объекта отправляется сообщение SELECTED",()=>{
        canvas.setActiveObject(new TestObject());

        assert.equal(EventBus.lastState, TlandEvents.SELECTED);
        assert.equal(JSON.parse(EventBus.lastData).type, 'test');
    });

    it("При снятии выделения отправляется сообщение SELECTED",()=>{
        canvas.setActiveObject(new TestObject());
        EventBus.clearState();

        canvas.discardActiveObject();

        assert.equal(EventBus.lastState, TlandEvents.SELECTED);
    });

    it("Метод getSelectionJson возвращает JSON одиночного объекта",()=>{
       let stair = new StairwayStraight(10,11,12,13,14,16,true);
       canvas.setActiveObject(stair);

       let json = canvas.getSelectionJson();

       assert.equal(JSON.parse(json).type,'straight_stairway');
    });

    it("Метод getSelectionJson возвращает JSON, в котором указано количество выделенных объектов",()=>{
        let stair = new StairwayStraight(10,11,12,13,14,16,true);
        let stair1 = new StairwayStraight(10,11,12,13,14,16,true);
        let select = new TlandSelection();
        select.addWithUpdate(stair).addWithUpdate(stair1);

        canvas.setActiveObject(select);

        let dataObject = JSON.parse(canvas.getSelectionJson());
        assert.equal(dataObject.type,'selection');
        assert.equal(dataObject.objectCount,2);
    });

    it("Метод getSelectionJson возвращает JSON, в котором указано hidden:true, если все объекты выделения hidden",()=>{
        let stair = new StairwayStraight(10,11,12,13,14,16,true);
        let stair1 = new StairwayStraight(10,11,12,13,14,16,true);
        stair.hidden = true;
        stair1.hidden = true;
        let select = new TlandSelection();
        select.addWithUpdate(stair).addWithUpdate(stair1);

        canvas.setActiveObject(select);

        let dataObject = JSON.parse(canvas.getSelectionJson());
        assert.equal(dataObject.type,'selection');
        assert.isTrue(dataObject.hidden);
    });

    it("Метод getSelectionJson возвращает JSON, в котором указано hidden:false, если не все объекты выделения hidden",()=>{
        let stair = new StairwayStraight(10,11,12,13,14,16,true);
        let stair1 = new StairwayStraight(10,11,12,13,14,16,true);
        stair1.hidden = true;
        canvas.addAll([stair,stair1]);
        let select = new TlandSelection();
        select.addWithUpdate(stair).addWithUpdate(stair1);

        canvas.setActiveObject(select);

        let dataObject = JSON.parse(canvas.getSelectionJson());
        assert.equal(dataObject.type,'selection');
        assert.isFalse(dataObject.hidden);
    });

    it("Метод getSelectionJson возвращает JSON с типом 'empty' и списком секций",()=>{
        let section = new Section();
        section.controls = [{x:5,y:6},{x:7,y:8},{x:9,y:10}];
        let obj = new TestObject();
        canvas.addAll([obj,section]);
        canvas.setActiveObject(obj);

        canvas.discardActiveObject();

        let dataObject = JSON.parse(canvas.getSelectionJson());
        assert.equal(dataObject.type,'empty');
        assert.equal(dataObject.sections[0].type,'section');
    });

    it('Метод loadFromJsonString кладёт в канву объекты без привязки к сетке',()=>{
        let data = '{"type":"schema","offsetX":4,"offsetY":4,"width":24,"height":24,"objects":[{"type":"seat","x":10,"y":11,"attrs":{"sectionId":0}},{"type":"seat","x":13,"y":14,"attrs":{"sectionId":0}}]}';

        canvas.loadFromJsonString(data);

        assert.equal(canvas.getObjects()[0].left,10);
        assert.equal(canvas.getObjects()[0].top,11);
        assert.equal(canvas.getObjects()[1].left,13);
        assert.equal(canvas.getObjects()[1].top,14);
    });

    it('Метод add добавляет сектор в самый низ канвы',()=>{
        let obj = new TestObject();
        let obj1 = new TestObject();
        let sect = new Section();

        canvas.add(obj);
        canvas.add(obj1);
        canvas.add(sect);

        assert.equal(canvas.getObjects()[0].type, 'section')
    });

    it('Метод add добавляет место в самый верх канвы',()=>{
        let obj = new TestObject();
        let seat = new Seat(10,11,12,13);
        let obj1 = new TestObject();

        canvas.add(obj);
        canvas.add(obj1);
        canvas.add(seat);

        assert.equal(canvas.getObjects()[canvas.getObjects().length-1].type, 'seat');
    });

    it('Метод add добавляет визуальный объект между сектором и местом',()=>{
        let seat = new Seat(10,11,12,13);
        let sect = new Section();
        let stair = new StairwayStraight(10, 11, 12, 13, 14, 16, true);
        canvas.add(seat);
        canvas.add(sect);

        canvas.add(stair);

        assert.equal(canvas.getObjects()[1].type, 'straight_stairway');
    });

    it('Метод add добавляет неизвестный объект между сектором и визуальным элементом',()=>{
        let sect = new Section();
        let stair = new StairwayStraight(10, 11, 12, 13, 14, 16, true);
        let obj = new TestObject();
        canvas.add(sect);
        canvas.add(stair);

        canvas.add(obj);

        assert.equal(canvas.getObjects()[1].type, 'test');
    });

    it('Метод getIndexToInsert возвращает адрес конца массива для места',()=>{
        let obj = new TestObject();
        let obj1 = new TestObject();
        let seat = new Seat(10,11,12,13);
        canvas.add(obj);
        canvas.add(obj1);

        let index = canvas.getIndexToInsert(seat);

        assert.equal(index,2);
    });

    it('Метод getIndexToInsert возвращает адрес сразу после последней секции для секции',()=>{
        let obj = new Section();
        let obj1 = new TestObject();
        let sect = new Section();
        canvas.add(obj);
        canvas.add(obj1);

        let index = canvas.getIndexToInsert(sect);

        assert.equal(index,1);
    });

    it('Метод getIndexToInsert возвращает адрес первого встреченного места для визуального элемента',()=>{
        let obj = new TestObject();
        let obj1 = new TestObject();
        let seat = new Seat(10,11,12,13);
        let stair = new StairwayStraight(10, 11, 12, 13, 14, 16, true);
        canvas.add(obj);
        canvas.add(obj1);
        canvas.add(seat);

        let index = canvas.getIndexToInsert(stair);

        assert.equal(index,2);
    });

    it('Метод getIndexToInsert возвращает адрес первого визуального элемента или места для произвольного элемента',()=>{
        let obj = new TestObject();
        let obj1 = new TestObject();
        let seat = new Seat(10,11,12,13);
        let stair = new StairwayStraight(10, 11, 12, 13, 14, 16, true);
        canvas.add(obj);
        canvas.add(obj1);
        canvas.add(stair);
        canvas.add(seat);

        let index = canvas.getIndexToInsert(new TestObject());

        assert.equal(index,2);
    });

    it('Метод copySelected отправляет в шину сообщение REQUEST_WRITE_CLIPBOARD с JSON объектов из выделения',()=>{
        let stair = new StairwayStraight(10,11,12,13,14,16,true);
        let stair1 = new StairwayStraight(10,11,12,13,14,16,true);
        let select = new TlandSelection();
        select.addWithUpdate(stair).addWithUpdate(stair1);
        canvas.setActiveObject(select);

        canvas.copySelected();

        assert.equal(EventBus.lastState, TlandEvents.REQUEST_WRITE_CLIPBOARD);
        assert.equal(EventBus.lastData, canvas.getSelectionJson())
    });

    it('Метод copySelected не отправляет сообщений в случае пустого выделения',()=>{
        canvas.copySelected();

        assert.notExists(EventBus.lastState);
        assert.notExists(EventBus.lastData);
    });

    it('Метод paste вставляет одиночный объект в центр канвы',()=>{
        let point = new ControlPoint(10,11);

        canvas.paste(point.toJSON());

        assert.equal(canvas.getObjects()[0].type,'control_point');
        assert.equal(canvas.getObjects()[0].left, 500);
        assert.equal(canvas.getObjects()[0].top, 500);
    });

    it('Метод paste не вставляет место на канву',()=>{
        let seat = new Seat(10,11,12,13);

        canvas.paste(seat.toJSON());

        assert.equal(canvas.getObjects().length, 0);
    });

    it('Метод pasteGroup вставляет все объекты из объекта на канву',()=>{
        let dataObject = {type:"selection",objects:[{type:"test"},{type:"test"}]};

        canvas.pasteGroup(dataObject);

        assert.equal(canvas.getObjects().length, 2);
    });

    it('Метод pasteGroup пропускает места при вставке объектов',()=>{
        let dataObject = {type:"selection",objects:[{type:"seat"},{type:"test"}]};

        canvas.pasteGroup(dataObject);

        assert.equal(canvas.getObjects()[0].type, 'test');
        assert.notExists(canvas.getObjects()[1]);
    });

    it('Метод pasteGroup выделяет все вставленные объекты',()=>{
        let dataObj = {type:"selection",objects:[{type:"test"},{type:"test"}]};

        canvas.pasteGroup(dataObj);

        assert.exists(canvas.getActiveObject());
        assert.equal(canvas.getActiveObject().getObjects().length, 2);
    });

    it('Метод pasteGroup отправляет выделение в центр канвы',()=>{
        let dataObj = {type:"selection",objects:[{type:"test"},{type:"test"}]};

        canvas.pasteGroup(dataObj);

        let selection = canvas.getActiveObject();
        assert.closeTo(selection.left,500,1);
        assert.closeTo(selection.top,500,1);
        assert.equal(selection.originX, 'center');
    });

    it('При добавлении объекта на канву ему присваивается id',()=>{
        let obj = new TestObject();

        canvas.add(obj);

        assert.equal(obj.objectId,1);
    });

    it('При повторном добавлении удалённого объекта его id не изменяется',()=>{
        let obj = new TestObject();
        obj.objectId = 5;

        canvas.add(obj);
        canvas.remove(obj);
        canvas.add(obj);

        assert.equal(obj.objectId,5);
    });

    it('После очистки канвы можно заново зарегистрировать прошлый элемент, не изменив его id',()=>{
        let obj = new TestObject();
        obj.objectId = 5;

        canvas.add(obj);
        canvas.clear();
        canvas.add(obj);

        assert.equal(obj.objectId,5);
    });

    it('При удалении секции она удаляется из массива canvas.sections',()=>{
        let sect = new Section();
        canvas.addAll([sect]);

        canvas.removeAll([sect]);

        assert.isEmpty(canvas.sections);
    });

    it('Метод getSeatsBySectionId возвращает массив мест с заданыным sectionId',()=>{
        const seat = new comp.Seat(5.35, 7.85, 10, 0);
        const seat1 = new comp.Seat(10, 10, 9, 0);
        const seat2 = new comp.Seat(15, 15, 9, 0);
        const notSeat = new TestObject({sectionId:9});
        canvas.addAll([seat, seat1, seat2, notSeat]);

        const seats = canvas.getSeatsBySectionId(9);

        assert.equal(seats.length, 2);
        assert.isTrue(seats.every(obj => obj.type === seat.type && obj.sectionId === 9))
    });

    it("При загрузке схемы на места из сектора со свободной рассадкой ставится флаг fromSeatlessSection",()=>{
        const schema = prepareSeatlessSchema(canvas);

        canvas.handleEvent(TlandEvents.CANVAS_LOAD_REQUEST, schema);

        assert.isTrue(canvas.getSeatsBySectionId(9).every(seat => seat.fromSeatlessSection));
    });

    it("При загрузке схемы на места из сектора не со свободной рассадкой флаг fromSeatlessSection устанавливается в false",()=>{
        const schema = prepareSeatlessSchema(canvas);

        canvas.handleEvent(TlandEvents.CANVAS_LOAD_REQUEST, schema);

        assert.isFalse(canvas.getSeatsBySectionId(10).every(seat => seat.fromSeatlessSection));
    });

    it("При добавлении секции она попадает в sections",()=>{
        const sect = new Section();
        canvas.addAll([sect]);

        assert.equal(canvas.sections.length, 1);
    });
});
