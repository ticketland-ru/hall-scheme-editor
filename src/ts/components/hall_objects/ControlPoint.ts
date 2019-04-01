/*
 * Copyright (c) 2019 ООО «МДТЗК» (ticketland.ru)
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense copies of the Software,  and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import {fabric} from "fabric";
import {HallObject} from "./HallObject";
import {Updater} from "../helpers/Updater";

export class ControlPoint extends HallObject{
    private rect = new fabric.Rect({
        width:8,
        height:8,
        originX:'center',
        originY:'center'
    });
    private offsetX: number = 0;
    private offsetY: number = 0;

    constructor(x:number, y:number, objectId: number = undefined){
        super([],{});
        this.addWithUpdate(this.rect);
        this.objectId = objectId;
        this.width = 8;
        this.height = 8;
        this.type = 'control_point';
        this.rect.fill = 'white';
        this.rect.stroke = 'grey';
        this.left = x;
        this.top = y;
        this.lockRotation = true;
        this.lockScalingX = true;
        this.lockScalingY = true;
        this.hasControls = false;
        this.originX = 'center';
        this.originY = 'center';
        this.data = {
            angle: this.angle || 0,
            x: x,
            y: y
        };
    }

    toJSON():any{
        return{
            type:"control_point",
            x:this.left,
            y:this.top,
            objectId: this.objectId,
        }
    }

    update(data: string): boolean{
        let updated = Updater.updateControlPoint(this, data);
        if(updated){
            // @ts-ignore
            this.canvas && this.canvas.selectedSection.updateForm();
        }
        return updated;
    }

    static parse(object: any):ControlPoint{
        return new ControlPoint(object.x,object.y,object.objectId);
    }

    updateOffsetBySectionCenter(x: number, y: number):void{
        this.offsetX = this.left - x;
        this.offsetY = this.top - y;
    }

    moveWithNewSectionCenter(x: number, y: number):void{
        this.left = x + this.offsetX;
        this.top = y + this.offsetY;
        // @ts-ignore
        this.dirty = true;
    }
}
