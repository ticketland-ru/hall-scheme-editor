/*
 * Copyright (c) 2019 ООО «МДТЗК» (ticketland.ru)
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense copies of the Software,  and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import {fabric} from "fabric";
import {ControlPoint} from "./ControlPoint";
import {HallObject} from "./HallObject";
import {Updater} from "../helpers/Updater";

export class Section extends HallObject{
    private polygon = new fabric.Polygon([new fabric.Point(0,0)]);
    private _controls : Array<ControlPoint> = [];
    private _sectionName: string;
    private _freeSeating: boolean;
    private _sectionId: number;
    data: any = {};

    constructor(objectId: number = undefined){
        super([],{});
        this.addWithUpdate(this.polygon);
        this.objectId = objectId;
        this.type = 'section';
        this.lockRotation = true;
        this.lockScalingX = true;
        this.lockScalingY = true;
        this.hasControls = false;
        this.perPixelTargetFind = true;
        this.polygon.fill = 'rgba(40,167,69,0.32)';
    }

    addControlPoint(cPoint: ControlPoint): void{
        this._controls.push(cPoint);
        this.updateForm();
    }

    removeControlPoint(cPoint: ControlPoint): void{
        this._controls.splice(this.controls.indexOf(cPoint),1);
        this.updateForm();
    }

    updateForm() {
        let pathArray = [];
        if (this._controls.length) {
            for (let i = 0; i < this._controls.length; i++) {
                pathArray.push(new fabric.Point(this._controls[i].left, this._controls[i].top));
            }
        }
        // @ts-ignore
        this.polygon.initialize(pathArray);
        this.data = {
            x:this.left,
            y:this.top,
        };
        // @ts-ignore
        this._calcBounds();
        // @ts-ignore
        this._updateObjectsCoords();
        this.setCoords();
        this.controls.forEach((control)=>{
            (control instanceof ControlPoint) && control.updateOffsetBySectionCenter(this.left, this.top);
        });
        // @ts-ignore
        this.dirty = true;
    }

    getPathString(): string{
        let pString = "M";
        for(let i =0; i<this._controls.length; i++){
            pString+=' '+this._controls[i].left+' '+this._controls[i].top+' ';
            if(this._controls.length-1!==i){
                pString+='L';
            }
        }
        pString+='z';
        return pString;
    }


    set controls(value: Array<ControlPoint>) {
        this._controls = value;
        this.updateForm();
    }

    get controls(): Array<ControlPoint> {
        return this._controls;
    }

    get sectionName(): string {
        return this._sectionName;
    }

    set sectionName(value: string) {
        this._sectionName = value;
    }

    get freeSeating(): boolean {
        return this._freeSeating;
    }

    set freeSeating(value: boolean) {
        this._freeSeating = value;
    }

    toJSON(): any{
        let result = super.toJSON();
        result.x = undefined;
        result.y = undefined;
        result.name = this.sectionName;
        result.freeSeating = this._freeSeating;
        result.fill = this.polygon.fill;
        result.sectionId = this._sectionId;
        let points = [];
        let len = this._controls.length;
        for(let i = 0; i<len; i++){
            points.push({x:this._controls[i].left,y:this._controls[i].top});
        }
        result.points = points;
        return result;
    }

    static parse(obj: any): Section{
        let result = new Section(obj.objectId);
        result._sectionName = obj.name;
        result._freeSeating = obj.freeSeating;
        result._sectionId = obj.sectionId;
        if(obj.points) {
            obj.points.forEach((point: any) => {
                result.addControlPoint(new ControlPoint(point.x, point.y));
            });
        }
        result.polygon.fill = obj.fill;
        result.updateForm();
        return result;
    }

    get sectionId():number{
        return this._sectionId;
    }

    get fill():string{
        return this.polygon.fill;
    }

    set fill(value: string){
        this.polygon.fill = value;
    }

    update(updateString: string):boolean{
        let updated = Updater.updateSection(this, updateString);
        this.controls.forEach((control)=>{
            control.moveWithNewSectionCenter(this.left, this.top);
        });
        // @ts-ignore
        if(this.canvas){
            // @ts-ignore
            this.canvas.markSeatlessSectionsPlaces();
        }
        return updated;
    }

    handleMoving(): any {
        this.controls.forEach((control)=>{
            control.moveWithNewSectionCenter(this.left, this.top);
        })
    }
}
