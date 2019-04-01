/*
 * Copyright (c) 2019 ООО «МДТЗК» (ticketland.ru)
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense copies of the Software,  and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import {Section} from "../../src/ts/components/hall_objects/Section";
import {ControlPoint} from "../../src/ts/components/hall_objects/ControlPoint";

const assert = require('chai').assert;

describe("Section", () => {

    let sect;
    beforeEach(() => {
        sect = new Section(5);
    });

    it("Корректная инициализация", () => {
        assert.equal(sect.type, 'section');
    });

    it("Метод updateForm перестраивает points", () => {
        sect.controls = [new ControlPoint(5, 5), new ControlPoint(3, 3), new ControlPoint(5, 6)];
        sect.updateForm();
        assert.equal(sect.polygon.points[0].x, 5);
        assert.equal(sect.polygon.points[0].y, 5);
        assert.equal(sect.polygon.points[1].x, 3);
        assert.equal(sect.polygon.points[1].y, 3);
        assert.equal(sect.polygon.points[2].x, 5);
        assert.equal(sect.polygon.points[2].y, 6);
    });

    it("Метод addControlPoint добавляет контролы и обновляет points", () => {
        sect.addControlPoint(new ControlPoint(10, 10));
        sect.addControlPoint(new ControlPoint(20, 12));
        sect.addControlPoint(new ControlPoint(15, 18));
        assert.equal(sect.polygon.points[0].x, 10);
        assert.equal(sect.polygon.points[0].y, 10);
        assert.equal(sect.polygon.points[1].x, 20);
        assert.equal(sect.polygon.points[1].y, 12);
        assert.equal(sect.polygon.points[2].x, 15);
        assert.equal(sect.polygon.points[2].y, 18);
    });

    it("Метод removeControlPoint удаляет контролы и обновляет points", () => {
        let cpoint = new ControlPoint(30, 30);
        sect.addControlPoint(new ControlPoint(10, 10));
        sect.addControlPoint(new ControlPoint(20, 12));
        sect.addControlPoint(cpoint);
        sect.addControlPoint(new ControlPoint(15, 18));
        assert.equal(sect.polygon.points[0].x, 10);
        assert.equal(sect.polygon.points[0].y, 10);
        assert.equal(sect.polygon.points[1].x, 20);
        assert.equal(sect.polygon.points[1].y, 12);
        assert.equal(sect.polygon.points[2].x, 30);
        assert.equal(sect.polygon.points[2].y, 30);
        assert.equal(sect.polygon.points[3].x, 15);
        assert.equal(sect.polygon.points[3].y, 18);
        sect.removeControlPoint(cpoint);
        assert.equal(sect.polygon.points[0].x, 10);
        assert.equal(sect.polygon.points[0].y, 10);
        assert.equal(sect.polygon.points[1].x, 20);
        assert.equal(sect.polygon.points[1].y, 12);
        assert.equal(sect.polygon.points[2].x, 15);
        assert.equal(sect.polygon.points[2].y, 18);
    });

    it("Метод getPathString возвращает корректный path", () => {
        sect.addControlPoint(new ControlPoint(10, 10));
        sect.addControlPoint(new ControlPoint(20, 12));
        sect.addControlPoint(new ControlPoint(15, 18));
        assert.equal(sect.getPathString(), "M 10 10 L 20 12 L 15 18 z");
    });

    it("Метод toJSON возвращает объект согласно вики https://gitlab.ticketland.ru/info/info/wikis/web-schema", () => {
        sect.addControlPoint(new ControlPoint(10, 10));
        sect.addControlPoint(new ControlPoint(20, 12));
        sect.addControlPoint(new ControlPoint(15, 18));
        sect.sectionName = 'test';
        sect.freeSeating = true;
        sect.polygon.fill = '#ffff00';
        let jsoned = sect.toJSON();
        assert.equal(jsoned.type, "section");
        assert.equal(jsoned.name, "test");
        assert.isTrue(jsoned.freeSeating);
        assert.equal(jsoned.points[0].x, 10);
        assert.equal(jsoned.points[0].y, 10);
        assert.equal(jsoned.points[1].x, 20);
        assert.equal(jsoned.points[1].y, 12);
        assert.equal(jsoned.points[2].x, 15);
        assert.equal(jsoned.points[2].y, 18);
        assert.notExists(jsoned.points[3]);
        assert.equal(jsoned.fill, '#ffff00');
        assert.equal(jsoned.objectId, 5);
    });

    it("Метод parse корректно создает сектор", () => {
        let parsed = Section.parse({
            type: "section",
            name: "test",
            freeSeating: false,
            points: [{x: 10, y: 10}, {x: 10, y: 20}, {x: 20, y: 20}],
            fill: '#aaaaaa',
            objectId: 5
        });
        assert.equal(parsed.sectionName, 'test');
        assert.exists(parsed.freeSeating);
        assert.isFalse(parsed.freeSeating);
        assert.equal(parsed.controls[0].left, 10);
        assert.equal(parsed.controls[0].top, 10);
        assert.equal(parsed.controls[1].left, 10);
        assert.equal(parsed.controls[1].top, 20);
        assert.equal(parsed.controls[2].left, 20);
        assert.equal(parsed.controls[2].top, 20);
        assert.equal(parsed.polygon.points[0].x, 10);
        assert.equal(parsed.polygon.points[0].y, 10);
        assert.equal(parsed.polygon.points[1].x, 10);
        assert.equal(parsed.polygon.points[1].y, 20);
        assert.equal(parsed.polygon.points[2].x, 20);
        assert.equal(parsed.polygon.points[2].y, 20);
        assert.notExists(parsed.polygon.points[3]);
        assert.equal(parsed.polygon.fill, '#aaaaaa');
        assert.equal(parsed.objectId, 5);
    });

    it('Метод update меняет цвет секции, если приезжает строка вида \'{"fill":string}\'',()=>{
        sect.update('{"fill":"#ffffff"}');
        assert.equal(sect.polygon.fill,'#ffffff');
    });

});
