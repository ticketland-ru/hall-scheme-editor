/*
 * Copyright (c) 2019 ООО «МДТЗК» (ticketland.ru)
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense copies of the Software,  and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import {Seat} from "../../src/ts/components/hall_objects/Seat";
import {EventBus} from "../../src/ts/events/logical/EventBus";
import {ErrorHandler} from "../../src/ts/events/logical/ErrorHandler";

const assert = require('chai').assert;
const components = require('../../src/ts/components/hall_objects/Seat');

describe("Seat", () => {
    let seat;

    // место создается перед КАЖДЫМ тестом
    beforeEach(() => {
        seat = new components.Seat(11, 10,  0, 12);
        seat._row='1';
        seat.seatIndex = '2a';
        seat.sectionName = 'test';
        EventBus.addListener(new ErrorHandler());
    });

    it("Проброс аргументов конструктора", () => {
        assert.equal(seat.sectionId,0);
        assert.equal(seat.top, 10);
        assert.equal(seat.left, 11);
    });

    it("Место корректно инициализируется", () => {
        assert.isTrue(seat.lockScalingX);
        assert.isTrue(seat.lockScalingY);
        assert.isFalse(seat.hasControls);
        assert.equal(seat.width, 16);
        assert.equal(seat.height, 16);
    });

    it("метод toString генерирует корректную строку", () => {
        assert.equal(seat.toString(),"Seat idSection: 0, x=11, y=10");
    });

    it("метод isOverlaying возвращает true, если ему передать объект ближе чем 20 px",()=>{
        const seat1 = new components.Seat(11, 15, 0, 0);

        assert.isTrue(seat.isOverlaying(seat1.left,seat1.top));
    });

    it("метод isOverlaying возвращает false, если ему передать объект далее чем 20 px по вертикали или горизонтали",()=>{
        const seat1 = new components.Seat(11, 55, 0, 0);

        assert.isFalse(seat.isOverlaying(seat1.left,seat1.top));
    });

    it("метод isOverlaying возвращает false, если место скрыто",()=>{
        seat.visible = false;

        const seat1 = new components.Seat(11, 15, 0, 0);

        assert.isFalse(seat.isOverlaying(seat1.left,seat1.top));
    });

    it("Метод savedTransformMatrix инициализирует матрицу преобразования",()=>{
        assert.isDefined(seat.savedTransformMatrix);
    });

    it("Метод calcAndSaveTransformMatrix вычисляет матрицу преобразования из координат и записывает её в поле объекта",()=>{
        let mtx = seat.calcAndSaveTransformMatrix();
        seat.top = 20;
        seat.left = 20;
        assert.equal(mtx, seat.savedTransformMatrix);
        let mtx2 = seat.calcAndSaveTransformMatrix();
        assert.notEqual(mtx, mtx2);
        seat.angle = 45;
        assert.approximately(seat.calcAndSaveTransformMatrix()[0],0.707106781,0.000001);
    });

    it("Метод toJSON возвращает объект согласно вики https://gitlab.ticketland.ru/info/info/wikis/web-schema",()=>{
        assert.deepEqual(seat.toJSON(), {type:"seat",x:11,y:10,attrs:{sectionId:0,section:'test',row:'1',seat:'2a'},objectId:12});
    });

    it("Метод parse корректно инициализирует место",()=>{
        let parsedSeat = Seat.parse(seat.toJSON());
        assert.equal(parsedSeat.type,'seat');
        assert.equal(parsedSeat.left,seat.left);
        assert.equal(parsedSeat.top,seat.top);
        assert.equal(parsedSeat.sectionId,seat.sectionId);
        assert.equal(parsedSeat._seatIndex,seat._seatIndex);
        assert.equal(parsedSeat._row,seat._row);
        assert.equal(parsedSeat.sectionName, seat.sectionName);
    });

    it("Метод parse выдаёт ошибку, если не заполнены поля с координатами",()=>{
        try {
            Seat.parse({
                type:'seat',
                x: null,
                y: 2
            });
            assert.isTrue(false);
        } catch (e) {
            assert.match(e.message, /^Missing seat coords:/)
        }
        try {
            Seat.parse({
                type:'seat',
                x: 5,
                y: null,
            });
            assert.isTrue(false);
        } catch (e) {
            assert.match(e.message, /^Missing seat coords:/)
        }
    });

    it("Метод parse выдаёт ошибку, если в полях с координатамиобнаружены не числа",()=>{
        try {
            Seat.parse({
                type:'seat',
                x: 'abc',
                y: 2,
            });
            assert.isTrue(false);
        } catch (e) {
            assert.match(e.message, /^Seat coords must be numbers:/)
        }
        try {
            Seat.parse({
                type:'seat',
                x: function () {
                    console.log("555");
                },
                y: 2,
            });
            assert.isTrue(false);
        } catch (e) {
            assert.match(e.message, /^Seat coords must be numbers:/)
        }
        try {
            Seat.parse({
                type:'seat',
                x: 1,
                y: 'test',
            });
            assert.isTrue(false);
        } catch (e) {
            assert.match(e.message, /^Seat coords must be numbers:/)
        }
    });

    it("При установке флага fromSeatlessSection место скрывается",()=>{
        seat.fromSeatlessSection = true;

        assert.isFalse(seat.visible);
    });

    it("При снятии флага fromSeatlessSection место перестаёт быть скрытым",()=>{
        seat.visible = false;

        seat.fromSeatlessSection = false;

        assert.isTrue(seat.visible);
    });

    it("При попытке загрузить строку 'true' в качестве fromSeatlessSection она конвертится",()=>{
        seat.fromSeatlessSection = "true";

        assert.strictEqual(seat.fromSeatlessSection, true)
    });

    it("При попытке загрузить строку 'false' в качестве fromSeatlessSection она конвертится",()=>{
        seat.fromSeatlessSection = "false";

        assert.strictEqual(seat.fromSeatlessSection, false)
    });

    it("При попытке загрузить некорректное значение в качестве fromSeatlessSection кидается ошибка",()=>{
        try {
            seat.fromSeatlessSection = 'asdf';
            assert.fail('Не выброшена ошибка');
        }catch(e){
            assert.match(e.message,/Incorrect fromSeatlessSection value: /);
        }

    });

    it("При попытке загрузить строку в качестве sectionId она конвертится",()=>{
        const seat = new Seat(0,0,"15");

        assert.strictEqual(seat.sectionId, 15);
    });

    it("При попытке загрузить некорректное значение в качестве sectionId выбрасывается ошибка",()=>{
        try {
            const seat = new Seat(0, 0, "asdfg");
            assert.fail('Не выброшена ошибка');
        }catch(e){
            assert.match(e.message,/Incorrect sectionId/);
        }

    });

});
