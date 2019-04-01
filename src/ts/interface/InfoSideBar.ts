/*
 * Copyright (c) 2019 ООО «МДТЗК» (ticketland.ru)
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense copies of the Software,  and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import {EventBus} from "../events/logical/EventBus";
import {TlandEvents} from "../events/logical/TlandEvents";
import {Observer} from "../events/logical/Observer";

interface SideBarElements {
    [HTMLElement: string]: HTMLDivElement | HTMLInputElement | HTMLSpanElement;
}

export class InfoSideBar implements Observer{


    private _sideBarElements: SideBarElements = {};

    private _elementsToShowMap: any = {
        empty: [],
        seat: [],
        section: [],
        selection: [],
        text: [],
        other: []
    };


    constructor() {

        this._sideBarElements.InputHallName = (<HTMLInputElement>document.getElementById('input-hall-name'));
        this._sideBarElements.DivOfSectors = (<HTMLDivElement>document.getElementById('sectors'));
        this._sideBarElements.InputPlaceId = (<HTMLInputElement>document.getElementById('input-place-id'));
        this._sideBarElements.InputRowNumber = (<HTMLInputElement>document.getElementById('input-row-number'));
        this._sideBarElements.InputPlaceNumber = (<HTMLInputElement>document.getElementById('input-place-number'));
        this._sideBarElements.InputSeatSectionName = (<HTMLInputElement>document.getElementById('input-seat-section-name'));
        this._sideBarElements.ButtonSaveSection = (<HTMLInputElement>document.getElementById('section-save'));
        this._sideBarElements.InputSectorName = (<HTMLInputElement>document.getElementById('input-sector-name'));
        this._sideBarElements.InputCheckBox = (<HTMLInputElement>document.getElementById('checkbox-free-placing'));
        this._sideBarElements.SpanMessage = (<HTMLSpanElement>document.getElementById('span-message'));
        this._sideBarElements.DivFontAttributes = (<HTMLDivElement>document.getElementById('font-attributes'));
        this._sideBarElements.InputFontSize = (<HTMLInputElement>document.getElementById('input-font-size'));

        // захват блока координат и инпутов блока КООРДИНАТЫ и РАЗМЕР
        this._sideBarElements.DivCoordinates = (<HTMLDivElement>document.getElementById('coordinates'));
        this._sideBarElements.InputCoordinateX = (<HTMLInputElement>document.getElementById('input-coordinate-x'));
        this._sideBarElements.InputCoordinateY = (<HTMLInputElement>document.getElementById('input-coordinate-y'));
        this._sideBarElements.InputCoordinateZ = (<HTMLInputElement>document.getElementById('input-coordinate-z'));
        this._sideBarElements.InputWidth = (<HTMLInputElement>document.getElementById('input-width'));
        this._sideBarElements.InputHeight = (<HTMLInputElement>document.getElementById('input-height'));
        // захват блока координат и инпутов блока КООРДИНАТЫ и РАЗМЕР - конец

        // захват блока ПАЛИТРЫ ЦВЕТОВ
        this._sideBarElements.DivSectionPalette = (<HTMLDivElement>document.getElementById('palette-section'));
        this._sideBarElements.DivTextPalette = (<HTMLDivElement>document.getElementById('palette-text'));
        // захват блока ПАЛИТРЫ ЦВЕТОВ - конец

        this._sideBarElements.HideCheckbox = (<HTMLInputElement>document.getElementById('checkbox-hidden'));

        this._elementsToShowMap.empty.push(
            this._sideBarElements.InputHallName,
            this._sideBarElements.DivOfSectors);
        this._elementsToShowMap.seat.push(
            this._sideBarElements.InputPlaceId,
            this._sideBarElements.InputRowNumber,
            this._sideBarElements.InputPlaceNumber,
            this._sideBarElements.InputSeatSectionName,
            this._sideBarElements.DivCoordinates,
            this._sideBarElements.HideCheckbox);
        this._elementsToShowMap.section.push(
            this._sideBarElements.InputSectorName,
            this._sideBarElements.InputCheckBox,
            this._sideBarElements.DivSectionPalette,
            this._sideBarElements.HideCheckbox,
            this._sideBarElements.ButtonSaveSection);
        this._elementsToShowMap.selection.push(
            this._sideBarElements.SpanMessage,
            this._sideBarElements.HideCheckbox,
            this._sideBarElements.DivCoordinates);
        this._elementsToShowMap.text.push(
            this._sideBarElements.DivFontAttributes,
            this._sideBarElements.DivTextPalette,
            this._sideBarElements.SpanMessage,
            this._sideBarElements.DivCoordinates,
            this._sideBarElements.HideCheckbox);
        this._elementsToShowMap.other.push(
            this._sideBarElements.SpanMessage,
            this._sideBarElements.DivCoordinates,
            this._sideBarElements.HideCheckbox);

        this._sideBarElements.InputHallName.onchange = (event: Event): void => {
            alert('Имя зала могло бы быть ' + (<HTMLInputElement>event.target).value + 'но у нас пока нет поля имя зала и записывать некуда :-(...');
            // EventBus.pushMessage(TlandEvents.UPDATE_SELECTED, '{"name":"' + (<HTMLInputElement>event.target).value + '"}')
        };

        this._sideBarElements.InputCoordinateX.onchange = (event: Event): void => {

            let input = (<HTMLInputElement>event.target);

            if (this._validateNumericaInput(input)) {
                EventBus.pushMessage(TlandEvents.UPDATE_SELECTED, '{"x":"' + (<HTMLInputElement>event.target).value + '"}')
            }
        };
        this._sideBarElements.InputCoordinateY.onchange = (event: Event): void => {

            let input = (<HTMLInputElement>event.target);

            if (this._validateNumericaInput(input)) {
                EventBus.pushMessage(TlandEvents.UPDATE_SELECTED, '{"y":"' + (<HTMLInputElement>event.target).value + '"}')
            }
        };

        this._sideBarElements.InputFontSize.onchange = (event: Event): void =>{
            let input = (<HTMLInputElement>event.target);

            if (this._validateNumericaInput(input)) {
                EventBus.pushMessage(TlandEvents.UPDATE_SELECTED, '{"fontSize":"' + (<HTMLInputElement>event.target).value + '"}')
            }
        };

        this._sideBarElements.InputSectorName.onchange = (event: Event): void => {
            EventBus.pushMessage(TlandEvents.UPDATE_SELECTED, '{"name":"' + (<HTMLInputElement>event.target).value + '"}')
        };

        let sectionFillElements: HTMLCollectionOf<any> = document.getElementsByClassName('element__color');
        let len = sectionFillElements.length;
        for (let i = 0; i < len; i++) {
            let elem = sectionFillElements.item(i);
            elem.onclick = (): void => {
                EventBus.pushMessage(TlandEvents.UPDATE_SELECTED, '{"fill":"' + elem.style.backgroundColor + '"}')
            }
        }

        this._sideBarElements.InputCheckBox.onchange = (event: Event): void => {
            EventBus.pushMessage(TlandEvents.UPDATE_SELECTED, '{"freeSeating":"' + (<HTMLInputElement>event.target).checked + '"}')
        };
        this._sideBarElements.HideCheckbox.onchange = (event: Event):void => {
           EventBus.pushMessage(TlandEvents.UPDATE_SELECTED, '{"hidden":'+((<HTMLInputElement>event.target).checked)+'}')
        };
        let buttonAddSector = (<HTMLInputElement>document.getElementById('button-add-sector'));
        buttonAddSector.onclick = () => EventBus.pushMessage(TlandEvents.REQUEST_ADD_SECTION, null);
        this._sideBarElements.ButtonSaveSection.onclick = ()=>{
            // @ts-ignore
            let val  = this._sideBarElements.InputSectorName.value;
            if(val){
                EventBus.pushMessage(TlandEvents.UPDATE_SELECTED, '{"name":"' + val + '"}')
            }
        }
    }

    private _validateNumericaInput(input: HTMLInputElement): boolean {
        // @ts-ignore
        if (isNaN(input.value)) {
            input.value = input.value.replace(/\D/g, '');
            EventBus.pushMessage(TlandEvents.ERROR, "Координата не может быть буквой или символом! Должна быть числом.");
        } else if(input.value === ''){
            EventBus.pushMessage(TlandEvents.ERROR, "Некорректный ввод");
        }
        return true;
    }


    private _showInfoSideBarElements(type: string): void {
        let listIdsToShow: Array<HTMLElement> = this._elementsToShowMap[type] ? this._elementsToShowMap[type] : this._elementsToShowMap['other'];

        listIdsToShow.forEach((htmlElement: HTMLElement): void => {
            htmlElement.parentElement.classList.remove('hidden'); // снимается класс hidden с родительского элемента
        })
    }

    private _hideInfoSideBarElements(currentType: string): void {

        for (let key in this._elementsToShowMap) {

            if (this._elementsToShowMap[key] !== currentType) {

                this._elementsToShowMap[key].forEach((htmlElement: HTMLElement) => {
                    htmlElement.parentElement.classList.add('hidden'); // ставится класс hidden на родительский элемент
                })
            }
        }
    }

    private _displaySelectionInfo(obj : any): void {

        document.getElementById('span-message').innerHTML = `Выделено объектов: ${obj.objectCount}`;
        // @ts-ignore
        this._sideBarElements.HideCheckbox.checked = !!obj.hidden;
        this._fillCordinatesInput(obj);
    }


    private _displayOtherObjectAttributes(object:any): void {

        document.getElementById('span-message').innerHTML = 'Выделен объект: '+(object.name?object.name:object.type);
        this._fillCordinatesInput(object);
        // @ts-ignore
        this._sideBarElements.HideCheckbox.checked = !!object.hidden;
    }

    private _addSector(divSectorsToLoad: HTMLDivElement, sectorName: string, backgroundColor: string) {
        // логика добавления сектора
        let parentElementSectors = divSectorsToLoad,
            newDivWrapper = document.createElement('div'),
            newDivSector = document.createElement('div'),
            newSpanDescription = document.createElement('span');

        newDivWrapper.classList.add('element', 'element--sector');
        newDivSector.classList.add('element__sector');
        newSpanDescription.innerHTML = sectorName;
        newDivSector.appendChild(newSpanDescription);
        newDivWrapper.appendChild(newDivSector);
        parentElementSectors.appendChild(newDivWrapper);
        parentElementSectors.insertBefore(newDivWrapper, parentElementSectors.children[0]); // вставка блока сектор перед кнопкой /добавить сектор/
        newDivSector.style.backgroundColor = backgroundColor;
    }

    private _clearSectors(HTMLElementSector: HTMLDivElement): void {

        HTMLElementSector.innerHTML = '';
    }


    private _setHallName(hallName: string) {

        let hallNameInput = (<HTMLInputElement>document.getElementById('input-hall-name'));
        hallNameInput.value = hallName;
    }

    handleEvent(event: TlandEvents, data: string) {

        if (event === TlandEvents.CANVAS_LOAD_REQUEST) {

            let hallName: string = JSON.parse(data).name ? JSON.parse(data)['name'] : 'Данные имени не заданы';
            this._setHallName(hallName);
        }

        if (event === TlandEvents.SELECTED) {

            let dataObj = JSON.parse(data);

            this._hideInfoSideBarElements(dataObj.type);
            this._showInfoSideBarElements(dataObj.type);

            switch (dataObj.type) {
                case 'empty':
                    let sectorsDiv = (<HTMLDivElement>document.getElementById('sectors'));
                    this._clearSectors(sectorsDiv);
                    let sectionsArray: Array<any> = dataObj.sections;

                    sectionsArray.forEach((section) => {
                        this._addSector(sectorsDiv, section['name'] ? section.name : 'Имя не задано', section['fill'] ? section['fill'] : 'rgba(40, 167, 69, 0.2)');
                    });
                    return;
                case 'selection': return this._displaySelectionInfo(dataObj);
                case 'seat': return this._fillSeatAttributes(dataObj);
                case 'section': return this._fillSectionAttributes(dataObj);
                case 'text': return this._displayTextAttributes(dataObj);
                default: return this._displayOtherObjectAttributes(dataObj);
            }
        }
    }

    private _fillSeatAttributes(obj: any): void {
        // @ts-ignore
        this._sideBarElements.InputPlaceId.value = obj.placeId;
        // @ts-ignore
        this._sideBarElements.InputRowNumber.value = (obj.attrs.row.trim() ? obj.attrs.row : 'не задан');
        // @ts-ignore
        this._sideBarElements.InputPlaceNumber.value = (obj.attrs.seat.trim() ? obj.attrs.seat : 'не задано');
        // @ts-ignore
        this._sideBarElements.InputSeatSectionName.value = '['+obj.attrs.sectionId+']' +(obj.attrs.section?' '+obj.attrs.section:'');
        this._fillCordinatesInput(obj);
        // @ts-ignore
        this._sideBarElements.HideCheckbox.checked = !!obj.hidden;
        return;
    }

    private _fillSectionAttributes(obj: any): void {
        // @ts-ignore
        this._sideBarElements.InputSectorName.value = obj.name ? obj.name : 'Имя не задано';
        // @ts-ignore
        this._sideBarElements.InputCheckBox.checked = !(!obj.freeSeating || obj.freeSeating === "false");
        // @ts-ignore
        this._sideBarElements.HideCheckbox.checked = !!obj.hidden;
        return;
    }

    private _displayTextAttributes(object: any) {
        document.getElementById('span-message').innerHTML = 'Выделен объект: '+(object.name?object.name:object.type);
        // @ts-ignore
        this._sideBarElements.HideCheckbox.checked = !!object.hidden;
        // @ts-ignore
        this._sideBarElements.InputFontSize.value = object.attrs['font-size'];
        this._fillCordinatesInput(object);
        return;
    }

    private _fillCordinatesInput(object: any){
        // @ts-ignore
        this._sideBarElements.InputCoordinateX.value = object.x;
        // @ts-ignore
        this._sideBarElements.InputCoordinateY.value = object.y;
        // @ts-ignore
        this._sideBarElements.InputCoordinateZ.value = (object.z ? object.z : 0);

        if(object.type === 'seat'){
            // @ts-ignore
            this._sideBarElements.InputWidth.value = this._sideBarElements.InputHeight.value = 16;
        }else if(object.type === 'text'){
            // @ts-ignore
            this._sideBarElements.InputWidth.value = this._sideBarElements.InputHeight.value = '';
        } else {
            // @ts-ignore
            this._sideBarElements.InputWidth.value = object.width;
            // @ts-ignore
            this._sideBarElements.InputHeight.value = object.height;
        }
    }
}
