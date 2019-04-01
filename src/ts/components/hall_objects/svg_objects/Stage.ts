/*
 * Copyright (c) 2019 ООО «МДТЗК» (ticketland.ru)
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense copies of the Software,  and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import {SvgObject} from "./SvgObject";
import {StageCenter} from "./StageCenter";

const image = require('../../../../images/library-elements/stage-new.svg');

//TODO make abstract
export class Stage extends SvgObject{
    private readonly _stageCenter: StageCenter;
    private centerOffsetX: number = 0;
    private centerOffsetY: number = 0;

    constructor(x: number, y: number, width: number=46, height: number=24, angle: number=0, objectId: number = undefined, test = false) {
        super(x, y, width, height, angle, objectId);
        this._stageCenter = new StageCenter(x,y,test);
        this._stageCenter.stage = this;
        if(!test){
            super.load(image);
        }
        this.type = 'stage';
        this.lockUniScaling = false;
    }

    toJSON(): any{
        let result = super.toJSON();
        result.attrs = {};
        result.attrs.centerX = this.left+this.centerOffsetX;
        result.attrs.centerY = this.top+this.centerOffsetY;
        return result;
    }

    static parse(object:any, test = false): Stage{
        let stage = new Stage(object.x,object.y,object.width,object.height,object.angle,object.objectId,test);
        if(object.attrs) {
            stage._stageCenter.originX = stage._stageCenter.left = object.attrs.centerX;
            stage._stageCenter.originY = stage._stageCenter.top = object.attrs.centerY;
        }
        stage.updateOffset();
        return stage;
    }

    get stageCenter(): StageCenter {
        return this._stageCenter;
    }

    updateOffset(): void{
        this.setCoords();
        this._stageCenter.setCoords();
        let stageCenter = this.aCoords.bl.midPointFrom(this.aCoords.tr);
        let markerCenter = this._stageCenter.aCoords.bl.midPointFrom(this._stageCenter.aCoords.tr);
        this.centerOffsetX = markerCenter.x - stageCenter.x;
        this.centerOffsetY = markerCenter.y - stageCenter.y;
    }

    moveCenter(): void{
        this.setCoords();
        let centerPoint = this.aCoords.bl.midPointFrom(this.aCoords.tr);
        // @ts-ignore
        if(this.group&&!this._stageCenter.group){
            // @ts-ignore
            centerPoint = centerPoint.add(this.group.getCenterPoint());
        }
        this._stageCenter.left = centerPoint.x+this.centerOffsetX;
        this._stageCenter.top = centerPoint.y+this.centerOffsetY;
        this._stageCenter.setCoords();
    }

    centerInside(): boolean{
        this._stageCenter.setCoords();
        let corners = this._stageCenter.aCoords;
        return this.containsPoint(corners.tl)
            &&this.containsPoint(corners.tr)
            &&this.containsPoint(corners.bl)
            &&this.containsPoint(corners.br);
    }

    handleMoving(): any {
        this.moveCenter();
        // @ts-ignore
        this.canvas && this.canvas.snapToGrid(this.stageCenter);
        this.stageCenter.setCoords();
    }
}
