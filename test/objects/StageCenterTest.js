/*
 * Copyright (c) 2019 ООО «МДТЗК» (ticketland.ru)
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense copies of the Software,  and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import {StageCenter} from "../../src/ts/components/hall_objects/svg_objects/StageCenter";
import {Stage} from "../../src/ts/components/hall_objects/svg_objects/Stage";

const assert = require('chai').assert;

describe("StageCenter",()=>{

    let center;

    beforeEach(()=>{
        center = new StageCenter(40,60,true);
    });

    it("Корректная инициализация",()=>{
        assert.isTrue(center.lockScalingX);
        assert.isTrue(center.lockScalingY);
        assert.isTrue(center.lockRotation);
        assert.equal(center.type, 'stage_center');
    });

    it("Метод handleMoving обновляет offset у сцены",()=>{
        let stage = new Stage(10,11,12,13,14,15,true);
        let center = stage.stageCenter;
        center.left = 14;
        center.top = 13;

        center.handleMoving();

        assert.equal(stage.centerOffsetX,4);
        assert.equal(stage.centerOffsetY,2);
    });
});
