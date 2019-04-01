/*
 * Copyright (c) 2019 ООО «МДТЗК» (ticketland.ru)
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense copies of the Software,  and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import {fabric} from "fabric";
import {HallObject} from "../HallObject";

export class SvgObject extends HallObject {
    private originLeft:number;
    private originTop:number;
    private readonly originWidth: number;
    private readonly originHeight: number;
    private readonly originAngle: number;
    protected strokeWidths: Array<number> = [];

    protected constructor(x: number, y: number, width: number, height: number, angle: number, objectId: number = undefined) {
        super([],{});
        this.objectId = objectId;
        this.originWidth = this.width = width;
        this.originHeight = this.height = height;
        this.originAngle = this.angle = angle;
        this.originLeft = this.left = x;
        this.originTop = this.top = y;
        this.scaleX = 1;
        this.scaleY = 1;
        this.lockUniScaling = true;
        this.lockScalingFlip = true;
        // @ts-ignore
        this.snapAngle = 15;
        this.data = {
            x:this.left,
            y:this.top,
            angle: this.angle,
        };
        // @ts-ignore
        this.calcOwnMatrix();
        this.visible = false;
        this.originX = 'center';
        this.originY = 'center';
    }

    toJSON():any{
        let result = super.toJSON();
        // @ts-ignore
        result.width = this.getScaledWidth();
        // @ts-ignore
        result.height = this.getScaledHeight();
        result.angle = this.angle;
        return result;
    }

    addWithUpdate(obj: fabric.Object):fabric.Group{
        this.strokeWidths.push(obj.strokeWidth);
        return super.addWithUpdate(obj);
    }

    resetStrokeWidth(): void {
        this.forEachObject((x, i) => {
            if(this.scaleX>1) {
                x.strokeWidth = this.strokeWidths[i] / this.scaleX;
            } else{
                x.strokeWidth = this.strokeWidths[i];
            }
        })
    }

    restoreCoords(){
        this.left = this.originLeft;
        this.top = this.originTop;
        this.scaleX = this.originWidth/this.width;
        this.scaleY = this.originHeight/this.height;
        this.angle = this.originAngle;
        this.setCoords();
        this.resetStrokeWidth();
        this.visible = true;
    }

    load(image: any) {
        fabric.loadSVGFromURL(image,(results => {
            // @ts-ignore
            let group = this.group;
            if(group){
                group.removeWithUpdate(this);
            }
            results.forEach((res)=>{
                this.addWithUpdate(res);
            });
            this.restoreCoords();
            if(group){
                group.addWithUpdate(this);
            }
            // @ts-ignore
            if(this.canvas){
                // @ts-ignore
                this.canvas.requestRenderAll();
            }
        }));
    }

    updateOrigin() {
        this.originLeft = this.left;
        this.originTop = this.top;
    }

}
