/*
 * Copyright (c) 2019 ООО «МДТЗК» (ticketland.ru)
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense copies of the Software,  and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import {Stage} from "../../src/ts/components/hall_objects/svg_objects/Stage";
import {StageCenter} from "../../src/ts/components/hall_objects/svg_objects/StageCenter";

const assert = require('chai').assert;

describe("Stage",()=>{
    let stage;
    beforeEach(()=>{
        stage = new Stage(10,11,12,13,14,16,true);
        stage.stageCenter.left = 12;
        stage.stageCenter.top = 12;
        stage.updateOffset();
    });

   it("Корректная инициализация",()=>{
       assert.equal(stage.type,'stage');
       assert.equal(stage.centerOffsetX,2);
       assert.equal(stage.centerOffsetY,1);
       assert.isFalse(stage.lockUniScaling);
   });

    it("Метод updateOffset пересчитывает смещение центра схемы в пикселях",()=>{
        stage._stageCenter = new StageCenter(15,15,true);
        stage.updateOffset();
        assert.equal(stage.centerOffsetX,5);
        assert.equal(stage.centerOffsetY,4);
    });

    it("Метод toJSON возвращает результат в соответствии с вики https://gitlab.ticketland.ru/info/info/wikis/web-schema",()=>{
        let jsoned = stage.toJSON();
        assert.equal(jsoned.x,10);
        assert.equal(jsoned.y,11);
        assert.equal(jsoned.width,12);
        assert.equal(jsoned.height,13);
        assert.equal(jsoned.angle,14);
        assert.equal(jsoned.type,'stage');
        assert.equal(jsoned.attrs.centerX,12);
        assert.equal(jsoned.attrs.centerY,12);
        assert.equal(jsoned.objectId,16);
    });

    it("Метод parse корректно инициализирует сцену",()=>{
        let parsed = Stage.parse(stage.toJSON(),true);
        assert.equal(parsed.left,10);
        assert.equal(parsed.top,11);
        assert.equal(parsed.width,12);
        assert.equal(parsed.height,13);
        assert.equal(parsed.angle,14);
        assert.equal(parsed.type,'stage');
        assert.equal(parsed.stageCenter.left,12);
        assert.equal(parsed.stageCenter.top,12);
        assert.equal(parsed.objectId, 16);
    });

    it("Метод moveCenter рассчитывает координаты центра сцены, используя координаты сцены и смещение центра",()=>{
        let center = stage.stageCenter;
        stage.left = 15;
        stage.top = 15;
        stage.moveCenter();
        assert.equal(center.left,17);
        assert.equal(center.top,16);
    });

    it("Метод centerInside возвращает истину, если центр лежит внутри сцены, включая границы",()=>{
        let stage = new Stage(20,20,undefined,undefined,undefined,undefined,true);
        stage.setCoords();
        assert.isTrue(stage.centerInside());
    });

    it("Метод centerInside возвращает ложь, если центр лежит снаружи сцены, за исключением границ",()=>{
        let stage = new Stage(30,16.4,undefined,undefined,15,undefined,true);
        stage.setCoords();
        stage.stageCenter.left=15;
        stage.stageCenter.top=21;
        assert.isFalse(stage.centerInside(),'1 check');
        stage.stageCenter.left=45;
        stage.stageCenter.top=12;
        assert.isFalse(stage.centerInside(),'2 check');
    });

    it("Метод handleMoving перемещает центр сцены вместе с ней",()=>{
        stage.left = 20;
        stage.top = 22;

        stage.handleMoving();

        assert.equal(stage.stageCenter.left, 22);
        assert.equal(stage.stageCenter.top, 23);
    });

});
