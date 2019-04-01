/*
 * Copyright (c) 2019 ООО «МДТЗК» (ticketland.ru)
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense copies of the Software,  and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import {SvgObject} from "../../src/ts/components/hall_objects/svg_objects/SvgObject";

const assert = require('chai').assert;

describe("SvgObject",()=>{

    let obj;
    beforeEach(()=>{
        obj = new SvgObject(50, 49, 31, 32, 60, 12);
        obj.setCoords();
    });

    it("Корректная инициализация",()=>{
        assert.equal(obj.left, 50);
        assert.equal(obj.top, 49);
        assert.equal(obj.height, 32);
        assert.equal(obj.width, 31);
        assert.equal(obj.angle, 60);
        assert.isTrue(obj.lockUniScaling);
        assert.isTrue(obj.lockScalingFlip);
        assert.equal(obj.snapAngle,15);
        assert.equal(obj.originX, 'center');
        assert.equal(obj.originY, 'center');
        assert.isNotTrue(obj.visible);
    });

    it("Метод toJSON сериализует положение объекта в соответствии с вики https://gitlab.ticketland.ru/info/info/wikis/web-schema",()=>{
        let jsoned = obj.toJSON();

        assert.equal(jsoned.height,32);
        assert.equal(jsoned.width,31);
        assert.equal(jsoned.angle,60);
    });

    it("Метод restoreCoords восстанавливает исходные координаты",()=>{
        obj.left=0;
        obj.top=0;
        obj.angle=0;
        obj.restoreCoords();
        assert.equal(obj.left,50);
        assert.equal(obj.top,49);
        assert.equal(obj.angle,60);
    });

    it("Метод restoreCoords делает объект видимым",()=>{
        obj.restoreCoords();

        assert.isTrue(obj.visible);
    });

    it("Метод restoreCoords восстанавливает исходные размеры объекта",()=>{
        obj.width = 10;
        obj.height = 10;
        obj.restoreCoords();
        assert.equal(obj._getTransformedDimensions().x,31);
        assert.equal(obj.getScaledHeight(),32);
    });

});
