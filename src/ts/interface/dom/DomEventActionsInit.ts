/*
 * Copyright (c) 2019 ООО «МДТЗК» (ticketland.ru)
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense copies of the Software,  and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import {EventBus} from "../../events/logical/EventBus";
import {TlandEvents} from "../../events/logical/TlandEvents";
import {DomEventHandlersLibrary} from "./DomEventHandlersLibrary";

export class DomEventActionsInit {

    constructor(private _domEventHandlersInstance: DomEventHandlersLibrary) {

        document.getElementById("add_cpoint").onclick = () => {
            EventBus.pushMessage(TlandEvents.REQUEST_SELECT_MODE, null);
            EventBus.pushMessage(TlandEvents.REQUEST_ADD_OBJECT, '{"type":"control_point"}')
        };
        // обработчик на элементы библиотеки //
        let libraryElements: HTMLCollectionOf<any> = document.getElementsByClassName('element__cell');

        for (let i = 0; i < libraryElements.length; i++) {

            let item: HTMLDivElement = libraryElements[i];

            if (item.id) {
                item.onclick = (e) => {
                    let element = <HTMLDivElement>e.currentTarget;
                    //@ts-ignore
                    if (element['isActive']) {
                        _domEventHandlersInstance.unSelectLibraryElement(element, true);
                        return;
                    } else {
                        EventBus.pushMessage(TlandEvents.REQUEST_ADD_OBJECT, '{"type":"' + element.id + '"}');
                        _domEventHandlersInstance.selectLibraryElement(element);
                    }

                }
            }
        }
        document.getElementById('zoom-in').onclick = ()=>EventBus.pushMessage(TlandEvents.ZOOM_IN);
        document.getElementById('zoom-out').onclick = ()=>EventBus.pushMessage(TlandEvents.ZOOM_OUT);
        document.getElementById('undo').onclick = ()=>EventBus.pushMessage(TlandEvents.UNDO);
        document.getElementById('redo').onclick = ()=>EventBus.pushMessage(TlandEvents.REDO);
        document.getElementById('tool-text-mode').onclick = ()=>EventBus.pushMessage(TlandEvents.REQUEST_ADD_OBJECT,'{"type":"text"}');
        // конец обработчик на элементы библиотеки //
    }
}
