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

export class TlandText extends fabric.IText implements TlandObject {
    private _hidden: boolean = false;
    objectId: number = NaN;
    hiddenTextarea: HTMLTextAreaElement;
    private cursorOffsetCache: any;
    private fontFamilyForClient: string;

    constructor(initialText: string, x: number, y: number) {
        super(initialText);
        this.type = 'text';
        this.originX = 'center';
        this.originY = 'center';
        this.fontFamily = 'Helvetica ';
        this.fontFamilyForClient = 'Helvetica, Arial, sans-serif';
        this.left = x;
        this.top = y;
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
        // @ts-ignore
        this.snapAngle = 15;
        this.fontSize = 16;
        this.fill = '#3D4349';
    }

    toJSON(): any {
        let result = {
            type: 'text',
            x: this.left,
            y: this.top,
            text: this.text,
            angle: this.angle,
            hidden: this._hidden,
            objectId: this.objectId,
            attrs: {
                fill: this.fill,
            }
        };
        // @ts-ignore
        result.attrs['font-size'] = this.fontSize;
        // @ts-ignore
        result.attrs['font-family'] = this.fontFamilyForClient;
        return result;
    }

    static parse(object: any): TlandText {
        let result = new TlandText(object.text ? object.text : 'text', object.x, object.y);
        result.angle = object.angle;
        result.objectId = object.objectId;
        result._hidden = !!object.hidden;
        if (object.attrs) {
            result.fill = object.attrs.fill;
            result.fontSize = object.attrs['font-size'] ? object.attrs['font-size'] : 18;
            if (object.attrs['font-family']) {
                result.fontFamilyForClient = object.attrs['font-family'];
                result.fontFamily = (<string>object.attrs['font-family']).split(',')[0];
            }
        }
        return result;
    }

    get hidden(): boolean {
        return this._hidden;
    }

    set hidden(value: boolean) {
        if (value) {
            this.opacity = 0.5;
        } else {
            this.opacity = 1;
        }
        this._hidden = value;
        // @ts-ignore
        if (this.canvas) {
            // @ts-ignore
            this.dirty = true;
            // @ts-ignore
            this.canvas.requestRenderAll();
        }
    }

    update(data: string): boolean {
        return Updater.updateTlandText(this, data);
    }

    /**
     * Данный метод переопределяется в связи с требованием бизнеса о запрете переносов в тексте.
     * При вводе переноса завершается сеанс ввода.
     */
    private updateFromTextArea(): void {
        if (!this.hiddenTextarea) {
            return;
        }
        this.cursorOffsetCache = {};
        //моё добавление к библиотечному коду
        if (this.hiddenTextarea.value.match(/[\n\r]/gu)) {
            this.exitEditing();
        }
        this.text = this.hiddenTextarea.value;
        // @ts-ignore
        if (this._shouldClearDimensionCache()) {
            // @ts-ignore
            this.initDimensions();
            this.setCoords();
        }
        // @ts-ignore
        let newSelection = this.fromStringToGraphemeSelection(
            this.hiddenTextarea.selectionStart, this.hiddenTextarea.selectionEnd, this.hiddenTextarea.value);
        this.selectionEnd = this.selectionStart = newSelection.selectionEnd;
        // @ts-ignore
        if (!this.inCompositionMode) {
            this.selectionStart = newSelection.selectionStart;
        }
        // @ts-ignore
        this.updateTextareaPosition();

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
        //to be implemented if necessary
    }

}
