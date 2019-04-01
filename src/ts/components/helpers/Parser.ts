/*
 * Copyright (c) 2019 ООО «МДТЗК» (ticketland.ru)
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense copies of the Software,  and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import {fabric} from "fabric";
import {Seat} from "../hall_objects/Seat";
import {EventBus} from "../../events/logical/EventBus";
import {TlandEvents} from "../../events/logical/TlandEvents";
import {Section} from "../hall_objects/Section";
import {ControlPoint} from "../hall_objects/ControlPoint";
import {StairwayStraight} from "../hall_objects/svg_objects/StairwayStraight";
import {StairwayCurved} from "../hall_objects/svg_objects/StairwayCurved";
import {PillarCircle} from "../hall_objects/svg_objects/PillarCircle";
import {Stage} from "../hall_objects/svg_objects/Stage";
import {Exit} from "../hall_objects/svg_objects/Exit";
import {PillarRectangle} from "../hall_objects/svg_objects/PillarRectangle";
import {Couch} from "../hall_objects/svg_objects/Couch";
import {CouchCurved} from "../hall_objects/svg_objects/CouchCurved";
import {TableRectangle} from "../hall_objects/svg_objects/TableRectangle";
import {Arena} from "../hall_objects/svg_objects/Arena";
import {ArtistsPassage} from "../hall_objects/svg_objects/ArtistsPassage";
import {TestObject} from "../hall_objects/TestObject";
import {TlandText} from "../hall_objects/TlandText";
import {TlandObject} from "../hall_objects/TlandObject";

export class Parser {

    static parseResponse(response: any): fabric.Object[] {
        if(response.type){
            if(response.type === 'schema'){
                let objects: Array<fabric.Object> = [];
                response.objects.forEach((x: any)=>{
                    objects.push(this.parseObject(x));
                });
                return objects;
            }
        }
        EventBus.pushMessage(TlandEvents.ERROR, "Server response is not a schema: " + JSON.stringify(response))
    }

    static parseObject(object: any, test = false): TlandObject {
        if (object.type) {
            let result: TlandObject;
            switch (object.type) {
                case 'seat':
                    result = Seat.parse(object); break;
                case 'section':
                    result = Section.parse(object); break;
                case 'control_point':
                    result = ControlPoint.parse(object); break;
                case 'straight_stairway':
                    result = StairwayStraight.parse(object, test); break;
                case 'stairway_curved':
                    result = StairwayCurved.parse(object, test); break;
                case 'pillar_circle':
                    result = PillarCircle.parse(object, test); break;
                case 'pillar_rectangle':
                    result = PillarRectangle.parse(object, test); break;
                case 'stage':
                    result = Stage.parse(object, test); break;
                case 'couch':
                    result = Couch.parse(object, test); break;
                case 'couch_curved':
                    result = CouchCurved.parse(object, test); break;
                case 'table_rectangle':
                    result = TableRectangle.parse(object, test); break;
                case 'arena':
                    result = Arena.parse(object, test); break;
                case 'exit':
                    result = Exit.parse(object, test); break;
                case 'artists_passage':
                    result = ArtistsPassage.parse(object, test); break;
                case 'text':
                    result = TlandText.parse(object); break;
                case 'test':
                    result = new TestObject({}); break;
            }
            if(result) {
                result.hidden = !!(object.hidden);
                return result;
            }
        }
        EventBus.pushMessage(TlandEvents.ERROR, "Unknown object: " + JSON.stringify(object));
    }
}
