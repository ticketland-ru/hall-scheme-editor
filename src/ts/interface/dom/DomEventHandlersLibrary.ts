/*
 * Copyright (c) 2019 ООО «МДТЗК» (ticketland.ru)
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense copies of the Software,  and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { EventBus } from "../../events/logical/EventBus";
import { TlandEvents } from "../../events/logical/TlandEvents";


export class DomEventHandlersLibrary {

    private _activeBorderColor: string = '#0369d9';
    private _borderColor: string = '#E2E6EA';
    private _activeLibraryElement: HTMLDivElement;

    private _addHighLightedBorder(element: HTMLDivElement): void {

        element.style.borderColor = this._activeBorderColor;
    }
    private _removeHighLightedBorder(element: HTMLDivElement): void {

        element.style.borderColor = this._borderColor;
    }

    public unSelectLibraryElement(element: HTMLDivElement, isAlreadyActive: boolean): void {

        if (isAlreadyActive) {
            EventBus.pushMessage(TlandEvents.REQUEST_SELECT_MODE, null);
        }
        this._removeHighLightedBorder(element);
        //@ts-ignore
        element['isActive'] = false;
        return;
    }

    public selectLibraryElement(element: HTMLDivElement): void {

        if (this._activeLibraryElement) {
            this.unSelectLibraryElement(this._activeLibraryElement, false);
        }
        this._addHighLightedBorder(element);
        this._activeLibraryElement = element;
        //@ts-ignore
        element['isActive'] = true;
    }
}
