/*
 * Copyright (c) 2019 ООО «МДТЗК» (ticketland.ru)
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense copies of the Software,  and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import {SvgObject} from "./SvgObject";

const image = require('../../../../images/library-elements/couch-curved.svg');

export class CouchCurved extends SvgObject{
    constructor(x: number, y: number, angle: number = 0, objectId: number = undefined, test = false) {
        super(x, y, 24, 24, angle, objectId);
        if(!test){
            super.load(image);
        }
        this.type = 'couch_curved';
        this.lockScalingX = true;
        this.lockScalingY = true;
        this.setControlsVisibility({
            mt: false,
            tr: false,
            mr: false,
            br: false,
            mb: false,
            bl: false,
            ml: false,
            tl: false,
            mtr: true
        });
    }

    static parse(object:any, test = false){
        return new CouchCurved(object.x, object.y, object.angle, object.objectId, test);
    }
}
