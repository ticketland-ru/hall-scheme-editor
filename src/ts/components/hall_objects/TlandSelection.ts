/*
 * Copyright (c) 2019 ООО «МДТЗК» (ticketland.ru)
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense copies of the Software,  and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import {isTlandObject, TlandObject} from "./TlandObject";
import {TlandObjectVisitor} from "../helpers/TlandObjectVisitor";
import {fabric} from "fabric";
import {Updater} from "../helpers/Updater";

export class TlandSelection extends fabric.ActiveSelection implements TlandObject {
    hidden: boolean = false;
    objectId: number = NaN;

    constructor(items: fabric.Object[], options: fabric.IObjectOptions) {
        super(items, options);
    }

    moveOnCanvas(left: number, top: number, angle: number): void {
        TlandObjectVisitor.moveObjectTo(this, left, top, angle);
    }

    restoreLastEligiblePosition(): void {
        TlandObjectVisitor.restoreSelectionLastEligiblePosition(this);
    }

    savePositionAsEligible(): void {
        TlandObjectVisitor.saveSelectionPositionAsEligible(this);
    }

    update(data: string): boolean {
        return Updater.updateActiveSelection(this, data);
    }

    addWithUpdate(object: fabric.Object): this {
        // @ts-ignore
        return super.addWithUpdate(object);
    }

     addAllWithUpdate(objects: fabric.Object[]): void{
         // @ts-ignore
         this._restoreObjectsState();
         // @ts-ignore
         fabric.util.resetObjectTransform(this);
         objects.forEach((object)=>{
             // @ts-ignore
             this._objects.push(object);
             // @ts-ignore
             object.group = this;
             // @ts-ignore
             object._set('canvas', this.canvas)
         });
         // @ts-ignore
         this._calcBounds();
         // @ts-ignore
         this._updateObjectsCoords();
         this.setCoords();
         // @ts-ignore
         this.dirty = true;
     }

     removeAllWithUpdate(objects: fabric.Object[]): void{
         // @ts-ignore
         this._restoreObjectsState();
         // @ts-ignore
         fabric.util.resetObjectTransform(this);
         objects.forEach((obj)=>this.remove(obj));
         // @ts-ignore
         this._calcBounds();
         // @ts-ignore
         this._updateObjectsCoords();
         this.setCoords();
         // @ts-ignore
         this.dirty = true;
     }

     forEachObject(callback: (element: fabric.Object, index: number, array: fabric.Object[]) => void, context?: any): fabric.Group {
         let selectedObjects = this.getObjects();
         this.removeAllWithUpdate(selectedObjects);
         selectedObjects.forEach((obj, index, array)=>{
             isTlandObject(obj) && callback(obj, index, array);
         });
         this.addAllWithUpdate(selectedObjects);
         return undefined;
     }

     toJSON(): any {
        return {
            type:'selection',
            hidden: !this.getObjects().filter((x)=>isTlandObject(x)&&!x.hidden).length,
            x: this.left,
            y: this.top,
            angle: this.angle,
            width: this.width,
            height: this.height,
            objectCount:this.getObjects().length,
            objects: this.getObjects(),
        }
     }

     handleMoving(): void {
        this.forEachObject((obj)=>{
            isTlandObject(obj) && obj.handleMoving();
        })
     }
}
