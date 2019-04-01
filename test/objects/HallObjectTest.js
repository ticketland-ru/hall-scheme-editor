/*
 * Copyright (c) 2019 ООО «МДТЗК» (ticketland.ru)
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense copies of the Software,  and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import {TestObject} from "../../src/ts/components/hall_objects/TestObject";

const assert = require('chai').assert;

describe('HallObject',()=>{

    let hallObject;

    beforeEach(()=>{
        hallObject = new TestObject();
        hallObject.left = 49;
        hallObject.top = 50;
        hallObject.objectId = 1;
    });

    it('Метод update обновляет поле hidden истиной',()=>{
        hallObject.update('{"hidden":true}');
        assert.isTrue(hallObject.hidden,'2');
    });

    it('Метод update обновляет поле hidden ложью',()=>{
        hallObject.update('{"hidden":false}');
        assert.isFalse(hallObject.hidden,'2');
    });

    it("При установке флага hidden в true объект становится полупрозрачным",()=>{
        hallObject.hidden = true;

        assert.equal(hallObject.opacity, 0.5);
    });

    it("При установке флага hidden в false объект становится непрозрачным",()=>{
        hallObject.hidden = true;
        hallObject.hidden = false;

        assert.equal(hallObject.opacity, 1);
    });

    it("Метод toJSON сериализует положение объекта",()=>{
        let jsoned = hallObject.toJSON();

        assert.equal(jsoned.x,49);
        assert.equal(jsoned.y,50);
    });

    it("Метод toJSON сериализует тип объекта",()=>{
        let jsoned = hallObject.toJSON();

        assert.equal(jsoned.type,'test');
    });

    it("Метод toJSON сериализует objectId",()=>{
        let jsoned = hallObject.toJSON();

        assert.equal(jsoned.objectId,1);
    });

    it("Метод toJSON сериализует поле hidden для скрытых объектов",()=>{
        hallObject.hidden = true;

        let jsoned = hallObject.toJSON();

        assert.isTrue(jsoned.hidden);
    });

    it("Метод toJSON не сериализует поле hidden для видимых объектов",()=>{
        let jsoned = hallObject.toJSON();

        assert.notExists(jsoned.hidden);
    });

});
