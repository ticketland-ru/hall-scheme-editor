/*
 * Copyright (c) 2019 ООО «МДТЗК» (ticketland.ru)
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense copies of the Software,  and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import {fabric} from "fabric";
import {EventBus} from "../../events/logical/EventBus";
import {TlandEvents} from "../../events/logical/TlandEvents";
import {HallObject} from "./HallObject";

const Icon = require('../../../images/icon.png');

export class Seat extends HallObject {
    readonly image: fabric.Image;
    readonly _sectionId: number;
    private _row: string;
    private _seatIndex: string;
    private _sectionName: string;
    _savedTransformMatrix: Array<number>;
    static readonly offset: number = 20;
    static readonly offsetSquare: number = 399;
    private _seatIndexObject: fabric.Object = undefined;
    private _fromSeatlessSection: boolean = false;

    constructor(left: number, top: number, sectionId: number, objectId: number = undefined) {
        // @ts-ignore
        super();
        this.objectId = objectId;
        this.type = 'seat';
        this.originX = 'center';
        this.originY = 'center';
        //координаты отображаются слева сверху https://www.w3schools.com/graphics/canvas_coordinates.asp
        this.left = left;
        this.top = top;
        this.data = {
            angle: this.angle || 0,
            x: left,
            y: top
        };
        this.height = 16;
        this.width = 16;
        this.lockRotation = true;
        this.lockScalingX = true;
        this.lockScalingY = true;
        this.hasControls = false;
        let icon = fabric.util.createImage();
        icon.src = Icon;
        this.image = new fabric.Image(icon,{
            left:this.left,
            top:this.top,
            width:this.width,
            height:this.height
        });
        this._seatIndexObject = new fabric.Image(null,null);
        this.addWithUpdate(this.image);
        this.left = this.data.x;
        this.top = this.data.y;
        this._sectionId = +sectionId;
        if(isNaN(this._sectionId)){
            EventBus.pushMessage(TlandEvents.ERROR, "Incorrect sectionId during seat initialisation: '"+ sectionId + "'");
        }
    }

    get sectionId(): number {
        return this._sectionId;
    }

    toString(): string {
        return "Seat idSection: "+this._sectionId + ", x=" + this.left + ", y=" + this.top;
    }

    toJSON(): any {
        let result = super.toJSON();
        result.x = this.savedTransformMatrix[4];
        result.y = this.savedTransformMatrix[5];
        result.attrs = {
            sectionId:this._sectionId,
            section:this._sectionName,
            row:this._row,
            seat:this._seatIndex,
        };
        return result;
    }

    static parse(object: any): Seat{
        if(object.x === undefined || object.y === undefined ||
            object.x === null || object.y === null) {
            EventBus.pushMessage(TlandEvents.ERROR, "Missing seat coords: " + JSON.stringify(object));
        }
        if(typeof object.x !== 'number' || typeof object.y !== 'number'){
            EventBus.pushMessage(TlandEvents.ERROR, "Seat coords must be numbers: " + JSON.stringify(object));
        }
        let seat = new Seat(object.x, object.y, object.attrs?object.attrs.sectionId:null,object.objectId);
        seat._row = object.attrs?object.attrs.row:null;
        seat.seatIndex = object.attrs?object.attrs.seat:null;
        seat.sectionName = object.attrs?object.attrs.section:null;
        return seat;
    }

    isOverlaying(x: number, y: number): boolean {
        if(!this.visible){
            return false;
        }
        if (!this._savedTransformMatrix) {
            this.calcAndSaveTransformMatrix();
        }
        return Math.abs(x - this._savedTransformMatrix[4]) < Seat.offset &&
            Math.abs(y - this._savedTransformMatrix[5]) < Seat.offset &&
             (x - this._savedTransformMatrix[4])*(x - this._savedTransformMatrix[4])+(y - this._savedTransformMatrix[5])*(y - this._savedTransformMatrix[5])<Seat.offsetSquare;
    }

    calcAndSaveTransformMatrix(): Array<number> {
        // @ts-ignore
        this._savedTransformMatrix = this.calcTransformMatrix();
        return this._savedTransformMatrix;
    }


    get savedTransformMatrix(): Array<number> {
        if (!this._savedTransformMatrix) {
            this.calcAndSaveTransformMatrix();
        }
        return this._savedTransformMatrix;
    }

    get seatIndex(): string {
        return this._seatIndex;
    }

    set seatIndex(value: string) {
        this._seatIndex = value;
        this.updateSeatIndex();
    }

    set row(value: string) {
        this._row = value;
        this.updateSeatIndex();
    }

    get seatIndexObject(): fabric.Object {
        return this._seatIndexObject;
    }

    private updateSeatIndex(){
        let info = '';
        if(this._row&&this._row.trim()){
            info+=this._row+'-';
        }
        if(this._seatIndex){
            info+=this._seatIndex;
        }
        let text = new fabric.Text(info,{
            fontSize:14,
            fontFamily:'arial'
        });
        text.cloneAsImage((result)=>
            {
                result.set({
                    originX:'center',
                    originY:'center',
                    scaleX:0.5,
                    scaleY:0.5,
                    left: this.left,
                    top: this.top,
                    selectable: false,
                });
                this.removeWithUpdate(this._seatIndexObject);
                this._seatIndexObject = result;
                this.addWithUpdate(this._seatIndexObject);
                // @ts-ignore
                if(this.canvas){
                    // @ts-ignore
                    this.canvas.requestRenderAll();
                }
            });
    }

    render(ctx: CanvasRenderingContext2D): void{
        // @ts-ignore
        if(this.canvas){
            // @ts-ignore
            this.seatIndexObject.visible = this.canvas.getZoom() >= 1.5;
        }
        super.render(ctx);
    }

    get sectionName(): string {
        return this._sectionName;
    }

    set sectionName(value: string) {
        this._sectionName = value;
    }

    moveOnCanvas(left: number, top: number, angle: number = 0): void {
        super.moveOnCanvas(left, top, angle);
        this.calcAndSaveTransformMatrix();
    }

    restoreLastEligiblePosition(): void {
        super.restoreLastEligiblePosition();
        this.calcAndSaveTransformMatrix();
    }

    update(data: string): boolean {
        let updated = super.update(data);
        this.calcAndSaveTransformMatrix();
        return updated;
    }


    set fromSeatlessSection(value: boolean) {
        if(typeof(value)!=='boolean'){
            if(value === 'true'){
                value = true;
            } else
            // @ts-ignore
            if(value === 'false' || typeof(value)==='undefined'){
                value = false;
            } else {
                EventBus.pushMessage(TlandEvents.ERROR, "Incorrect fromSeatlessSection value: "+value);
            }
        }
        this._fromSeatlessSection = value;
        this.visible = !value;
    }

    get fromSeatlessSection(): boolean {
        return this._fromSeatlessSection;
    }

}
