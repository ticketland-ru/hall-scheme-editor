/*
 * Copyright (c) 2019 ООО «МДТЗК» (ticketland.ru)
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense copies of the Software,  and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import {isTlandObject, TlandObject} from "../hall_objects/TlandObject";
import {Section} from "../hall_objects/Section";
import {TlandText} from "../hall_objects/TlandText";
import {TlandSelection} from "../hall_objects/TlandSelection";
import {ControlPoint} from "../hall_objects/ControlPoint";

/**
 * Обновляет атрибуты объектов в зависимости от аргумента data
 */
export class Updater{

    static updateTlandObject(obj: TlandObject, data: string): boolean{
        let updateObj = JSON.parse(data);
        let updated: boolean = this.updateBase(obj,updateObj);
        if(typeof(updateObj.hidden) !== 'undefined' && (typeof(updateObj.hidden) === 'boolean' ||
            typeof(updateObj.hidden = JSON.parse(updateObj.hidden)) === 'boolean')){
            updated = true;
            obj.hidden = updateObj.hidden;
        }
        if(typeof(updateObj.fill) !== 'undefined') {
            obj.fill = updateObj.fill;
            updated = true;
        }
        return updated;
    }

    static updateBase(obj: TlandObject,updateObj: any,) {
        let updated: boolean = false;
        if (typeof (updateObj.shiftX) != 'undefined') {
            updated = true;
            obj.left += updateObj.shiftX;
        }
        if (typeof (updateObj.shiftY) != 'undefined') {
            updated = true;
            obj.top += updateObj.shiftY;
        }
        if (typeof (updateObj.x) != 'undefined' && !isNaN(Number(updateObj.x))) {
            updated = true;
            obj.left = Number(updateObj.x);
        }
        if (typeof (updateObj.y) != 'undefined' && !isNaN(Number(updateObj.y))) {
            updated = true;
            obj.top = Number(updateObj.y);
        }
        return updated;
    }

    static updateSection(sect: Section, data: string): boolean{
        let updated: boolean = Updater.updateTlandObject(sect, data);
        let updateObj = JSON.parse(data);
        if(typeof(updateObj.name) !== 'undefined') {
            sect.sectionName = updateObj.name;
            updated = true;
        }
        if(typeof(updateObj.freeSeating) !== 'undefined') {
            sect.freeSeating = updateObj.freeSeating;
            updated = true;
        }
        return updated;
    }

    static updateTlandText(text: TlandText, data: string): boolean{
        let updated = Updater.updateTlandObject(text, data);
        let updateObj = JSON.parse(data);
        if(typeof(updateObj.fontSize) === 'number' || (typeof(updateObj.fontSize) === 'string' && !isNaN(updateObj.fontSize = parseFloat(updateObj.fontSize)))) {
            text.fontSize = updateObj.fontSize;
            updated = true;
        }
        if(typeof(updateObj.fontFamily) !== 'undefined') {
            text.fontFamily = updateObj.fontFamily;
            updated = true;
        }
        return updated;
    }

    static updateActiveSelection(select: TlandSelection, data: string): boolean{
        let updated: boolean = false;
        select.forEachObject((obj)=> {
            updated = ((isTlandObject(obj) && obj.update(data)) || updated);
        });
        return updated;
    }

    static updateControlPoint(obj: ControlPoint, data: string): boolean{
        let parsed = JSON.parse(data);
        return Updater.updateBase(obj, parsed);
    }

}
