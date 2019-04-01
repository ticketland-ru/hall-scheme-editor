/*
 * Copyright (c) 2019 ООО «МДТЗК» (ticketland.ru)
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense copies of the Software,  and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import {fabric} from "fabric";
import {TlandObject} from "./TlandObject";
import {Updater} from "../helpers/Updater";
import {TlandObjectVisitor} from "../helpers/TlandObjectVisitor";

export abstract class HallObject extends fabric.Group implements TlandObject{

    private _objectId: number = NaN;
    private _hidden: boolean = false;

    protected constructor(objects: fabric.Object[],options: any){
        super(objects, options);
    }

    get objectId(): number {
        return this._objectId;
    }

    set objectId(value: number) {
        this._objectId = value;
    }

    public get hidden(): boolean {
        return this._hidden;
    }

    public set hidden(value: boolean) {
        if(value){
            this.opacity = 0.5;
        } else {
            this.opacity = 1;
        }
        this._hidden = value;
        // @ts-ignore
        if(this.canvas){
            // @ts-ignore
            this.dirty = true;
            // @ts-ignore
            this.canvas.requestRenderAll();
        }
    }

    toJSON(): any {
        let result = {
            type: this.type,
            x: this.left,
            y: this.top,
            objectId: this.objectId,
        };
        if (this.hidden) {
            // @ts-ignore
            result.hidden = true;
        }
        return result;
    }

    update(data: string): boolean{
        return Updater.updateTlandObject(this,data);
    }

    moveOnCanvas(left: number, top: number, angle: number = 0): void {
        TlandObjectVisitor.moveObjectTo(this, left, top, angle);
    }

    restoreLastEligiblePosition(): void {
        TlandObjectVisitor.restoreLastEligiblePosition(this);
    }

    savePositionAsEligible(): void {
        TlandObjectVisitor.savePositionAsEligible(this);
    }

    handleMoving(): any {
        //to be overridden if necessary
    }
}
