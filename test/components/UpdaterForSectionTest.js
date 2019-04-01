/*
 * Copyright (c) 2019 ООО «МДТЗК» (ticketland.ru)
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense copies of the Software,  and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import {Section} from "../../src/ts/components/hall_objects/Section";
import {Updater} from "../../src/ts/components/helpers/Updater";

const assert = require('chai').assert;

describe('Updater for section',()=>{
    let sect;

    beforeEach(()=>{
        sect = new Section();
    });

    it('Метод update возвращает true и меняет название секции, если приезжает строка вида \'{"name":string}\'',()=>{
        assert.isTrue(Updater.updateSection(sect,'{"name":"test"}'));
        assert.equal(sect._sectionName,'test');
    });

    it('Метод update возвращает true и обновляет факт свободной рассадки, если приезжает строка вида \'{"freeSeating":boolean}\'',()=>{
        assert.isTrue(Updater.updateSection(sect,'{"freeSeating":false}'));
        assert.isFalse(sect.freeSeating);
    });

    it('Метод update возвращает false и ничего не меняет, если в строке осутствуют корректные атрибуты',()=>{
        sect.name = 'not_test';
        sect.freeSeating = true;

        assert.isFalse(Updater.updateSection(sect,'{"notExistField":"test"}'));
        assert.equal(sect.polygon.fill,'rgba(40,167,69,0.32)');
        assert.equal(sect.name,'not_test');
        assert.isTrue(sect.freeSeating);
    });

});
