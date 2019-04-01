/*
 * Copyright (c) 2019 ООО «МДТЗК» (ticketland.ru)
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense copies of the Software,  and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import {TlandSelection} from "../../src/ts/components/hall_objects/TlandSelection";
import {isTlandObject} from "../../src/ts/components/hall_objects/TlandObject";
import {TestObject} from "../../src/ts/components/hall_objects/TestObject";

const assert = require('chai').assert;

describe('TlandSelection',()=>{

    let selection;
    let test;
    let test1;

    beforeEach(()=>{
        selection = new TlandSelection();
        test = new TestObject();
        test1 = new TestObject();
        selection.addWithUpdate(test).addWithUpdate(test1);
        selection.left = 10;
        selection.top = 11;
    });

    it('Является TlandObject',()=>{
        assert.isTrue(isTlandObject(selection));
    });

    it('Метод toJSON возвращает количество объектов внутри выделения',()=>{
        let dataObject = selection.toJSON();

        assert.equal(dataObject.type,'selection');
        assert.equal(dataObject.objectCount,2);
    });

    it('Метод toJSON сериализует содержимое выделения',()=>{
        let dataObject = selection.toJSON();

        assert.exists(dataObject.objects);
        assert.equal(dataObject.objects[0].type,'test');
        assert.equal(dataObject.objects[1].type,'test');
    });

    it('Метод toJSON сериализует координаты выделения',()=>{
        let dataObject = selection.toJSON();

        assert.equal(dataObject.x, 10);
        assert.equal(dataObject.y, 11);
        assert.equal(dataObject.angle, 0);
    });

    it('Метод toJSON сериализует размеры выделения',()=>{
        let dataObject = selection.toJSON();

        assert.exists(dataObject.width);
        assert.exists(dataObject.height);
    });

    it('Метод toJSON помечает выделение спрятанным, если спрятаны все объекты',()=>{
        test.hidden = true;
        test1.hidden = true;

        let dataObject = selection.toJSON();

        assert.isTrue(dataObject.hidden);
    });

    it('Метод toJSON помечает выделение не спрятанным, если спрятаны не все объекты',()=>{
        test.hidden = true;

        let dataObject = selection.toJSON();

        assert.isFalse(dataObject.hidden);
    });
});
