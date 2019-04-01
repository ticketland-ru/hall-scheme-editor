/*
 * Copyright (c) 2019 ООО «МДТЗК» (ticketland.ru)
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense copies of the Software,  and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import {Seat} from "../hall_objects/Seat";
import {fabric} from "fabric";
import {TlandSelection} from "../hall_objects/TlandSelection";
import {isTlandObject} from "../hall_objects/TlandObject";

/**
 * Управляет возвратом объекта в последнее корректное положение.
 */
export class TlandObjectVisitor{

    public static moveObjectTo(object: fabric.Object, left: number, top: number, angle: number): void {
        object.set({
            angle: angle,
            left: left,
            top: top
        });
    }

    public static savePositionAsEligible(object: fabric.Object): void{
        object.data = {
            x: object.left,
            y: object.top,
            angle: object.angle
        }
    }

    public static saveSelectionPositionAsEligible(selection: TlandSelection): void{
        selection.forEachObject((obj)=>{
            isTlandObject(obj) && obj.savePositionAsEligible();
        });
    }

    public static restoreLastEligiblePosition(object: fabric.Object): void{
        object.left = object.data.x;
        object.top = object.data.y;
        object.angle = object.data.angle;
        if(object instanceof fabric.ActiveSelection){
            (<fabric.ActiveSelection>object).getObjects().filter((x: any)=>(x instanceof Seat)).forEach((x:Seat)=>{x.calcAndSaveTransformMatrix()});
        }
    }

    public static restoreSelectionLastEligiblePosition(selection: TlandSelection): void{
        selection.forEachObject((obj)=>{
            isTlandObject(obj) && obj.restoreLastEligiblePosition();
        });
    }
}
