/*
 * Copyright (c) 2019 ООО «МДТЗК» (ticketland.ru)
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense copies of the Software,  and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import {TestObject} from "../../src/ts/components/hall_objects/TestObject";
import {TlandObjectVisitor} from "../../src/ts/components/helpers/TlandObjectVisitor";
import {TlandSelection} from "../../src/ts/components/hall_objects/TlandSelection";

const assert = require('chai').assert;

describe('TlandObjectVisitor',()=>{

    let testObj;

    beforeEach(()=>{
        testObj = new TestObject();
        testObj.left=10;
        testObj.top=11;
        testObj.angle=12;
    });

    it('Метод moveObjectTo перемещает объект в заданные координаты',()=>{
        TlandObjectVisitor.moveObjectTo(testObj, 5, 6, 7);

        assert.equal(testObj.left, 5);
        assert.equal(testObj.top, 6);
        assert.equal(testObj.angle, 7);
    });

    it('Метод savePositionAsEligible сохраняет координаты объекта в объект data',()=>{
        TlandObjectVisitor.savePositionAsEligible(testObj);

        assert.equal(testObj.data.x, 10);
        assert.equal(testObj.data.y, 11);
        assert.equal(testObj.data.angle, 12);
    });

    it('Метод restoreLastEligiblePosition восстанавливает координаты из объекта data',()=>{
        TlandObjectVisitor.savePositionAsEligible(testObj);
        testObj.left=20;
        testObj.top=21;
        testObj.angle=22;

        TlandObjectVisitor.restoreLastEligiblePosition(testObj);

        assert.equal(testObj.left, 10);
        assert.equal(testObj.top, 11);
        assert.equal(testObj.angle, 12);
    });

    describe('selection',()=>{
        let testObj1;
        let select;

        beforeEach(()=>{
            testObj1 = new TestObject();
            testObj1.left = 30;
            testObj1.top = 31;
            testObj1.angle = 32;
            select = new TlandSelection([testObj, testObj1]);
        });

        it('Метод saveSelectionPositionAsEligible сохраняет координаты последней возможной позиции в сам объект',()=>{
            TlandObjectVisitor.saveSelectionPositionAsEligible(select);

            assert.deepEqual(testObj.data, {x:10, y:11, angle:12});
            assert.deepEqual(testObj1.data, {x:30, y:31, angle:32});
        });

        it('Метод restoreSelectionLastEligiblePosition восстанавливает координаты каждого объекта из выделения',()=>{
            TlandObjectVisitor.saveSelectionPositionAsEligible(select);
            testObj1.left = 2;
            testObj1.top = 3;
            testObj.left = 4;
            testObj.top = 5;

            TlandObjectVisitor.restoreSelectionLastEligiblePosition(select);

            select.removeAllWithUpdate([testObj,testObj1]);
            assert.equal(testObj.left, 10);
            assert.equal(testObj.top, 11);
            assert.equal(testObj.angle, 12);
            assert.equal(testObj1.left, 30);
            assert.equal(testObj1.top, 31);
            assert.equal(testObj1.angle, 32);
        });

    });

});
