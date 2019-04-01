/*
 * Copyright (c) 2019 ООО «МДТЗК» (ticketland.ru)
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense copies of the Software,  and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import {Seat} from "../../src/ts/components/hall_objects/Seat";
import {TicketlandCanvas} from "../../src/ts/components/TicketlandCanvas";
import {Parser} from "../../src/ts/components/helpers/Parser";
import {ErrorHandler} from "../../src/ts/events/logical/ErrorHandler";
import {EventBus} from "../../src/ts/events/logical/EventBus";
import {Section} from "../../src/ts/components/hall_objects/Section";
import {ControlPoint} from "../../src/ts/components/hall_objects/ControlPoint";
import {StairwayStraight} from "../../src/ts/components/hall_objects/svg_objects/StairwayStraight";
import {StairwayCurved} from "../../src/ts/components/hall_objects/svg_objects/StairwayCurved";
import {PillarCircle} from "../../src/ts/components/hall_objects/svg_objects/PillarCircle";
import {Stage} from "../../src/ts/components/hall_objects/svg_objects/Stage";
import {Exit} from "../../src/ts/components/hall_objects/svg_objects/Exit";
import {PillarRectangle} from "../../src/ts/components/hall_objects/svg_objects/PillarRectangle";
import {Couch} from "../../src/ts/components/hall_objects/svg_objects/Couch";
import {CouchCurved} from "../../src/ts/components/hall_objects/svg_objects/CouchCurved";
import {TableRectangle} from "../../src/ts/components/hall_objects/svg_objects/TableRectangle";
import {Arena} from "../../src/ts/components/hall_objects/svg_objects/Arena";
import {ArtistsPassage} from "../../src/ts/components/hall_objects/svg_objects/ArtistsPassage";
import {TlandText} from "../../src/ts/components/hall_objects/TlandText";

const assert = require('chai').assert;

describe("Parser", ()=>{

    before(()=>{
        let eh = new ErrorHandler();
        EventBus.addListener(eh);
    });

    it("Метод parseResponse возвращает массив объектов из строки JSON",()=>{
        let seat = new Seat(1,2,3,4);
        let seat2 = new Seat(25,26,27,89);
        let sect = new Section();
        sect.controls = [{x:5,y:6},{x:5,y:6},{x:5,y:6}];
        let canvas = new TicketlandCanvas();
        canvas.addAll([seat,seat2,sect]);
        let jsonString = canvas.exportContentsToJsonString();
        let parsedObjects = Parser.parseResponse(JSON.parse(jsonString));
        assert.typeOf(parsedObjects,'array');
        assert.equal(parsedObjects[0].type,'section');
        assert.equal(parsedObjects[1].type,'seat');
        assert.equal(parsedObjects[2].type,'seat');
        assert.isUndefined(parsedObjects[3]);
    });

    it("Метод parseResponse выбрасывает ошибку, если приехала не схема",()=>{
        try {
            Parser.parseResponse({
                type:'some_type_that_will_not_exist',
                x: 2
            });
            assert.isTrue(false);
        } catch (e) {
            assert.match(e.message, /^Server response is not a schema:/)
        }
        try {
            Parser.parseResponse({
                x: 2
            });
            assert.isTrue(false);
        } catch (e) {
            assert.match(e.message, /^Server response is not a schema:/)
        }
    });

    it("Метод parseObject корректно инициализирует место",()=>{
        let seat = new Seat(1,2,3,4);
        let parsedSeat = Parser.parseObject(seat.toJSON());
        assert.equal(parsedSeat.type,'seat');
    });

    it("Метод parseObject корректно инициализирует секцию",()=>{
        let sect = new Section();
        sect.fill='#bbbbbb';
        sect.sectionName = 'test';
        sect.freeSeating = true;
        sect.addControlPoint(new ControlPoint(5,5));
        sect.addControlPoint(new ControlPoint(6,5));
        sect.addControlPoint(new ControlPoint(6,6));
        let parsedSect = Parser.parseObject(sect.toJSON());
        assert.equal(parsedSect.type,'section');
    });

    it("Метод parseObject корректно инициализирует контрольную точку",()=>{
        let cpoint = new ControlPoint(10,12);
        let parsedCpoint = Parser.parseObject(cpoint.toJSON());
        assert.equal(parsedCpoint.type,'control_point');
    });

    it("Метод parseObject корректно инициализирует прямую лестницу",()=>{
        let stair = new StairwayStraight(10, 11, 13, 12, 14, 16, true);
        let parsed = Parser.parseObject(stair.toJSON(),true);
        assert.equal(parsed.type,'straight_stairway');
    });

    it("Метод parseObject корректно инициализирует кривую лестницу",()=>{
        let stair = new StairwayCurved(10,11,12,13,14,16,true);
        let parsed = Parser.parseObject(stair.toJSON(),true);
        assert.equal(parsed.type,'stairway_curved');
    });

    it("Метод parseObject корректно инициализирует прямой диван",()=>{
        let couch = new Couch(10, 11, 14, undefined, true);
        let parsed = Parser.parseObject(couch.toJSON(),true);
        assert.equal(parsed.type,'couch');
    });

    it("Метод parseObject корректно инициализирует скруглённый диван",()=>{
        let couch = new CouchCurved(10, 11, 14, undefined, true);
        let parsed = Parser.parseObject(couch.toJSON(),true);
        assert.equal(parsed.type,'couch_curved');
    });

    it("Метод parseObject корректно инициализирует круглую колонну",()=>{
        let pillar = new PillarCircle(10,11,12,13,14,16,true);
        let parsed = Parser.parseObject(pillar.toJSON(),true);
        assert.equal(parsed.type,'pillar_circle');
    });

    it("Метод parseObject корректно инициализирует прямоугольную колонну",()=>{
        let pillar = new PillarRectangle(10,11,12,13,14,16,true);
        let parsed = Parser.parseObject(pillar.toJSON(),true);
        assert.equal(parsed.type,'pillar_rectangle');
    });

    it("Метод parseObject корректно инициализирует прямоугольный стол",()=>{
        let table = new TableRectangle(10,11,12,13,14,16,true);
        let parsed = Parser.parseObject(table.toJSON(),true);
        assert.equal(parsed.type,'table_rectangle');
    });

    it("Метод parseObject корректно инициализирует сцену",()=>{
        let stage = new Stage(10,11,12,13,14,16,true);
        let parsed = Parser.parseObject(stage.toJSON(),true);
        assert.equal(parsed.type,'stage');
    });

    it("Метод parseObject корректно инициализирует арену",()=>{
        let arena = new Arena(10, 11, 12, 13, 14, undefined, true);
        let parsed = Parser.parseObject(arena.toJSON(),true);
        assert.equal(parsed.type,'arena');
    });

    it("Метод parseObject корректно инициализирует выход",()=>{
        let exit = new Exit(10,11,12,13,14,16,true);
        let parsed = Parser.parseObject(exit.toJSON(),true);
        assert.equal(parsed.type,'exit');
    });

    it("Метод parseObject корректно инициализирует выход артистов",()=>{
        let passage = new ArtistsPassage(10,11,12,13,14,16,true);
        let parsed = Parser.parseObject(passage.toJSON(),true);
        assert.equal(parsed.type,'artists_passage');
    });

    it("Метод parseObject инициализирует текстовый объект",()=>{
        let text = new TlandText('test',1,1);
        let parsed = Parser.parseObject(JSON.parse(JSON.stringify(text)));
        assert.equal(parsed.type, 'text');
    });

    it("Метод parseObject инициализирует тестовый объект",()=>{
        let test = new Object({type:'test'});
        let parsed = Parser.parseObject(JSON.parse(JSON.stringify(test)));
        assert.equal(parsed.type, 'test');
    });

    it("Метод parseObject выставляет флаг hidden в true",()=>{
        let test = {type:'test',hidden:true};
        let parsed = Parser.parseObject(JSON.parse(JSON.stringify(test)));
        assert.isTrue(parsed.hidden);
    });

    it("Метод parseObject выставляет флаг hidden в false",()=>{
        let test = {type:'test'};
        let parsed = Parser.parseObject(JSON.parse(JSON.stringify(test)));
        assert.isFalse(parsed.hidden);
    });

    it("Метод parseObject выбрасывает ошибку, если приехал неизвестный объект",()=>{
        try {
            Parser.parseObject({
                type:'some_type_that_will_not_exist',
                x: 2
            });
            assert.isTrue(false);
        } catch (e) {
            assert.match(e.message, /^Unknown object:/)
        }
        try {
            Parser.parseObject({
                x: 2
            });
            assert.isTrue(false);
        } catch (e) {
            assert.match(e.message, /^Unknown object:/)
        }
    });
});
