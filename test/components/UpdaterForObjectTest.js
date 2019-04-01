/*
 * Copyright (c) 2019 ООО «МДТЗК» (ticketland.ru)
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense copies of the Software,  and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import {Updater} from "../../src/ts/components/helpers/Updater";
import {TestObject} from "../../src/ts/components/hall_objects/TestObject";
import {TlandSelection} from "../../src/ts/components/hall_objects/TlandSelection";

const assert = require('chai').assert;

describe('Updater for object',()=>{
    let test;

    beforeEach(()=>{
        test = new TestObject();
    });

    it('Метод updateTlandObject возвращает false, если ничего не обновлено',()=>{
        assert.isFalse(Updater.updateTlandObject(test,'{}'));
    });

    it('Метод updateTlandObject обновляет поле hidden истиной и возвращает true',()=>{
        assert.isTrue(Updater.updateTlandObject(test,'{"hidden":true}'),'1');
        assert.isTrue(test.hidden,'2');
    });

    it('Метод updateTlandObject обновляет поле hidden истиной и возвращает true при передаче строкового параметра',()=>{
        assert.isTrue(Updater.updateTlandObject(test,'{"hidden":"true"}'),'1');
        assert.isTrue(test.hidden,'2');
    });

    it('Метод updateTlandObject обновляет поле hidden ложью и возвращает true',()=>{
        assert.isTrue(Updater.updateTlandObject(test,'{"hidden":false}'),'1');
        assert.isFalse(test.hidden,'2');
    });

    it('Метод updateTlandObject обновляет поле hidden ложью и и возвращает true при передаче строкового параметра',()=>{
        assert.isTrue(Updater.updateTlandObject(test,'{"hidden":"false"}'),'1');
        assert.isFalse(test.hidden,'2');
    });

    it('Метод updateTlandObject обновляет звливку и возвращает true',()=>{
        assert.isTrue(Updater.updateTlandObject(test, '{"fill":"#abcdef"}'));

        assert.equal(test.fill, '#abcdef');
    });

    it('Метод updateBase перемещает выделенный объект по горизонтали на заданное количество пикселей',()=>{
        test.left = 9;

        Updater.updateBase(test, {shiftX:2});

        assert.equal(test.left,11);
    });

    it('Метод updateBase перемещает выделенный объект по вертикали на заданное количество пикселей',()=>{
        test.top = 10;

        Updater.updateBase(test, {shiftY:-2});

        assert.equal(test.top,8);
    });

    it('Метод updateBase помещает выделенный объект в заданную координату left',()=>{
        Updater.updateBase(test, {x:"22"});

        assert.strictEqual(test.left,22);
    });

    it('Метод updateBase помещает выделенный объект в заданную координату top',()=>{
        Updater.updateBase(test, {y:"22"});

        assert.strictEqual(test.top,22);
    });

    it('Метод updateBase возвращает false в случае, если для выделенного объекта придут пустые даныне',()=>{
        assert.isFalse(Updater.updateBase(test, {}));
    });

    it('Метод updateBase возвращает false в случае, если для выделенного объекта придут некорректные даныне',()=>{
        assert.isFalse(Updater.updateBase(test,{x:"a"}));
    });

    it('Метод updateActiveSelection прячет каждый объект внутри выделения', ()=>{
        let test1 = new TestObject();
        let select = new TlandSelection();
        select.addWithUpdate(test);
        select.addWithUpdate(test1);

        assert.isTrue(Updater.updateActiveSelection(select, '{"hidden":true}'),'1');
        assert.isTrue(test.hidden,'2');
        assert.isTrue(test1.hidden,'3');
    });

    it('Метод updateActiveSelection перекрашивает каждый объект внутри выделения', ()=>{
        let test1 = new TestObject();
        let select = new TlandSelection();
        select.addWithUpdate(test);
        select.addWithUpdate(test1);

        assert.isTrue(Updater.updateActiveSelection(select, '{"fill":"#ffffff"}'),'1');
        assert.equal(test.fill,'#ffffff');
        assert.equal(test1.fill,'#ffffff');
    });

    it('Метод updateActiveSelection двигает всё выделение в указанную координату по горизонтали', ()=>{
        let select = new TlandSelection([test]);

        assert.isTrue(Updater.updateActiveSelection(select, '{"x":"5"}'),'1');

        assert.equal(select.left, 5);
    });

    it('Метод updateActiveSelection сбрасывает координаты горизонтали каждого объекта внутри выделения',()=>{
        let test1 = new TestObject();
        let select = new TlandSelection();
        test.left = 6;
        test1.left = 7;
        select.addWithUpdate(test);
        select.addWithUpdate(test1);

        assert.isTrue(Updater.updateActiveSelection(select, '{"x":"4"}'),'1');
        assert.equal(test.left,0);
        assert.equal(test1.left,0);
    });

    it('Метод updateActiveSelection двигает всё выделение в указанную координату по вертикали', ()=>{
        let select = new TlandSelection([test]);

        assert.isTrue(Updater.updateActiveSelection(select, '{"y":"5"}'),'1');

        assert.equal(select.top, 5);
    });

    it('Метод updateActiveSelection сбрасывает координаты горизонтали каждого объекта внутри выделения',()=>{
        let test1 = new TestObject();
        let select = new TlandSelection();
        test.top = 6;
        test1.top = 7;
        select.addWithUpdate(test);
        select.addWithUpdate(test1);

        assert.isTrue(Updater.updateActiveSelection(select, '{"y":"4"}'),'1');
        assert.equal(test.top,0);
        assert.equal(test1.top,0);
    });

    it('Метод updateActiveSelection возвращает false, если ничего не обновлено', ()=>{
        let test1 = new TestObject();
        let select = new TlandSelection();
        select.addWithUpdate(test);
        select.addWithUpdate(test1);

        assert.isFalse(Updater.updateActiveSelection(select, '{}'),'1');
    });

});
