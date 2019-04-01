/*
 * Copyright (c) 2019 ООО «МДТЗК» (ticketland.ru)
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense copies of the Software,  and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import {TlandText} from "../../src/ts/components/hall_objects/TlandText";
import {Updater} from "../../src/ts/components/helpers/Updater";

const assert = require('chai').assert;

describe('Updater for text',()=>{
    let text;

    beforeEach(()=>{
        text = new TlandText('test');
    });

    it('Метод updateTlandText обновляет размер шрифта из аргумента number и возвращает true',()=>{
        assert.isTrue(Updater.updateTlandText(text, '{"fontSize":25}'));

        assert.strictEqual(text.fontSize, 25);
    });

    it('Метод updateTlandText обновляет размер шрифта из аргумента string и возвращает true',()=>{
        assert.isTrue(Updater.updateTlandText(text, '{"fontSize":"25"}'));

        assert.strictEqual(text.fontSize, 25);
    });

    it('Метод updateTlandText обновляет начертание шрифта и возвращает true',()=>{
        assert.isTrue(Updater.updateTlandText(text, '{"fontFamily":"arial"}'));

        assert.equal(text.fontFamily, 'arial');
    });

    it('Метод updateTlandText возвращает false, если ничего не обновлено',()=>{
        assert.isFalse(Updater.updateTlandText(text, '{}'));
    });

});
