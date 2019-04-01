/*
 * Copyright (c) 2019 ООО «МДТЗК» (ticketland.ru)
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense copies of the Software,  and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import {TlandText} from "../../src/ts/components/hall_objects/TlandText";

const assert = require('chai').assert;

describe('TlandText',()=>{
    let text;

    beforeEach(()=>{
        text = new TlandText('Lorem ipsum',11,12);
        text.fontFamily = 'Arial';
        text.fontFamilyForClient = 'Arial, Helvetica';
        text.fontSize = 18;
        text.angle = 10;
        text.fill = '#abcdef';
        text.objectId = 13;
    });

    it('Метод toJSON сериализует объект в соответствии с вики https://gitlab.ticketland.ru/info/info/wikis/web-schema',()=>{
        let jsoned = text.toJSON();

        assert.equal(jsoned.type, 'text');
        assert.equal(jsoned.text, 'Lorem ipsum');
        assert.equal(jsoned.angle, 10);
        assert.exists(jsoned.attrs);
        assert.equal(jsoned.attrs.fill, '#abcdef');
        assert.equal(jsoned.attrs['font-size'], 18);
        assert.equal(jsoned.attrs['font-family'], 'Arial, Helvetica');
    });

    it('Метод parse десериализует объект в соответствии с вики https://gitlab.ticketland.ru/info/info/wikis/web-schema',()=>{
        let parsed = TlandText.parse(text.toJSON());

        assert.equal(parsed.type, text.type, 'type');
        assert.equal(parsed.left, text.left, 'left');
        assert.equal(parsed.top, text.top, 'top');
        assert.equal(parsed.text, text.text, 'text');
        assert.equal(parsed.angle, text.angle, 'angle');
        assert.equal(parsed.objectId, text.objectId, 'objectId');
        assert.equal(parsed.hidden, text.hidden, 'hidden');
        assert.equal(parsed.fontSize, text.fontSize, 'fontSize');
        assert.equal(parsed.fontFamily, text.fontFamily, 'fontFamily');
        assert.equal(parsed.fontFamilyForClient, text.fontFamilyForClient, 'fontFamilyForClient');
        assert.equal(parsed.fill, text.fill, 'fill');
    });

    it("При установке флага hidden в true объект становится полупрозрачным",()=>{
        text.hidden = true;

        assert.equal(text.opacity, 0.5);
    });

    it("При установке флага hidden в false объект становится непрозрачным",()=>{
        text.hidden = true;
        text.hidden = false;

        assert.equal(text.opacity, 1);
    });

    afterEach(()=>{
        text.exitEditing();
    });
});
