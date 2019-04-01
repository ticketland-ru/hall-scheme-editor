/*
 * Copyright (c) 2019 ООО «МДТЗК» (ticketland.ru)
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense copies of the Software,  and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import {ControlPoint} from "../../src/ts/components/hall_objects/ControlPoint";

const assert = require('chai').assert;

describe("ControlPoint",()=>{
    let cpoint;
    beforeEach(()=>{
        cpoint = new ControlPoint(12,16,15);
    });

    it("Корректная инициализация",()=>{
        assert.equal(cpoint.width, 8);
        assert.equal(cpoint.height, 8);
        assert.equal(cpoint.left, 12);
        assert.equal(cpoint.top, 16);
        assert.isFalse(cpoint.hasControls);
        assert.isTrue(cpoint.lockRotation);
        assert.isTrue(cpoint.lockScalingX);
        assert.isTrue(cpoint.lockScalingY);
        assert.equal(cpoint.type,'control_point');
    });

    it("Метод toJSON возвращает объект в соответствии с вики",()=>{
        let jsoned = cpoint.toJSON();
        assert.equal(jsoned.type,'control_point');
        assert.equal(jsoned.x,12);
        assert.equal(jsoned.y,16);
        assert.equal(jsoned.objectId,15);
    });

    it("Метод parse корректно инициализирует контролы",()=>{
        let parsed = ControlPoint.parse({type:'control_point',x:10,y:11,objectId:12});
        assert.equal(parsed.left, 10);
        assert.equal(parsed.top, 11);
        assert.equal(parsed.objectId, 12);
    });

    it("Метод updateOffsetBySectionCenter рассчитывает и сохраняет смещение относительно точки",()=>{
        cpoint.updateOffsetBySectionCenter(21,22);

        assert.equal(cpoint.offsetX, 12-21);
        assert.equal(cpoint.offsetY, 16-22);
    });

    it("Метод moveWithNewSectionCenter задаёт контролу новые координаты с учётом смещения",()=>{
        cpoint.updateOffsetBySectionCenter(21,22);
        cpoint.moveWithNewSectionCenter(25,24);

        assert.equal(cpoint.left, 16);
        assert.equal(cpoint.top, 18);
    })
});
