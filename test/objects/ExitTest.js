/*
 * Copyright (c) 2019 ООО «МДТЗК» (ticketland.ru)
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense copies of the Software,  and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import {Exit} from "../../src/ts/components/hall_objects/svg_objects/Exit";

const assert = require('chai').assert;

describe("Exit",()=>{
    let exit;
    beforeEach(()=>{
        exit = new Exit(10,11,12,13,14,16,true);
    });

   it("Корректная инициализация",()=>{
       assert.equal(exit.type,'exit');
   });

    it("Метод parse корректно инициализирует выход",()=>{
        let parsed = Exit.parse(exit.toJSON(),true);
        assert.equal(parsed.left,10);
        assert.equal(parsed.top,11);
        assert.equal(parsed.width,12);
        assert.equal(parsed.height,13);
        assert.equal(parsed.angle,14);
        assert.equal(parsed.type,'exit');
        assert.equal(parsed.objectId, 16);
    })

});
