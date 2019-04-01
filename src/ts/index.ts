/*
 * Copyright (c) 2019 ООО «МДТЗК» (ticketland.ru)
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense copies of the Software,  and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import '../scss/style.scss'

import {TicketlandCanvas} from "./components/TicketlandCanvas";
import {InfoSideBar} from "./interface/InfoSideBar";
import {LibraryOfElements} from "./interface/LibraryOfElements";
import {EventBus} from "./events/logical/EventBus";
import {InterfaceEventHandler} from './interface/InterfaceEventHandler';
import {DomEventActionsInit} from "./interface/dom/DomEventActionsInit";
import {DomEventHandlersLibrary} from "./interface/dom/DomEventHandlersLibrary";
import {DomStateChanger} from "./interface/dom/DomStateChanger";
import {UndoAndRedoPerformer} from "./components/helpers/UndoAndRedoPerformer";
import {Clipboard} from "./components/helpers/Clipboard";
import {KeyboardEventHandler} from "./interface/dom/KeyboardEventHandler";
import {TlandEvents} from "./events/logical/TlandEvents";
import {demoJson} from "./DemoSchema";

//инициализация элементов
new DomEventActionsInit(new DomEventHandlersLibrary());
const stateChanger = new DomStateChanger();
const canvas = new TicketlandCanvas('canvas');
const infoSideBar = new InfoSideBar();
const libraryOfElements = new LibraryOfElements ();
InterfaceEventHandler.setCanvasSize(canvas);
canvas.recalcViewport();
const undoer = new UndoAndRedoPerformer();
const clipboard = new Clipboard();
new KeyboardEventHandler();

//связывание компонентов через шину сообщений приложения
EventBus.addListener(canvas);
EventBus.addListener(undoer);
EventBus.addListener(stateChanger);
EventBus.addListener(infoSideBar);
EventBus.addListener(libraryOfElements);
EventBus.addListener(clipboard);

//загрузка информации в рабочую область
EventBus.pushMessage(TlandEvents.CANVAS_LOAD_REQUEST, demoJson());
