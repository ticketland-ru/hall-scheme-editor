/*
 * Copyright (c) 2019 ООО «МДТЗК» (ticketland.ru)
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense copies of the Software,  and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import {fabric} from "fabric";
import {Seat} from "./hall_objects/Seat";
import {TlandEvents} from "../events/logical/TlandEvents";
import {Parser} from "./helpers/Parser";
import {EventBus} from "../events/logical/EventBus";
import {Section} from "./hall_objects/Section";
import {ControlPoint} from "./hall_objects/ControlPoint";
import {SvgObject} from "./hall_objects/svg_objects/SvgObject";
import {StageCenter} from "./hall_objects/svg_objects/StageCenter";
import {Stage} from "./hall_objects/svg_objects/Stage";
import {IdRegister} from "./helpers/IdRegister";
import {isTlandObject} from "./hall_objects/TlandObject";
import {TlandText} from "./hall_objects/TlandText";
import {TlandSelection} from "./hall_objects/TlandSelection";
import {Observer} from "../events/logical/Observer";

export class TicketlandCanvas extends fabric.Canvas implements Observer{
    private sections: Array<Section> = [];
    private selectedSection: Section;
    private adding: boolean = false;
    private lastAddedObject: fabric.Object;
    private data_to_add: string;
    private _gridStep: number;
    private dx: number;
    private dy: number;
    private isDragging: boolean = false;
    private lastPosX: number;
    private lastPosY: number;
    private viewportBounds: any;
    private readonly zoomFactors: Array<number> = [0.4,0.6,0.75,1,1.25,1.5,2];
    private registry: IdRegister = new IdRegister();

    constructor(element: HTMLCanvasElement | string, options?: fabric.ICanvasOptions) {
        super(element, options);
        this.initMoving(4);
        this.initSelections();
        this.initRotating();
        this.initAddMode();
        this.initMovingModifiyngDeselectActions();
        this.initZoomAndPan();
        this.renderOnAddRemove = false;
        this.recalcViewport();
    }

    recalcViewport() {
        // @ts-ignore
        this.viewportBounds = this.calcViewportBoundaries();
        this.requestRenderAll();
    }

    initMoving(gridStep: number) {
        this._gridStep = gridStep;

        this.on('object:moving', event => {
            this._handleMovingOrRotating(event);
            if(event.target instanceof ControlPoint){
                this.updateSelectedSection();
            }
        });
    }

    private _handleMovingOrRotating(event: fabric.IEvent) {
        const target = event.target;

        let x = Math.round(target.left / this._gridStep) * this._gridStep;
        let y = Math.round(target.top / this._gridStep) * this._gridStep;

        if (target instanceof fabric.ActiveSelection) {
            x += this.dx;
            y += this.dy;
            const selection = <fabric.ActiveSelection>target;
            selection.forEachObject(object => {
                if (object instanceof Seat) {
                    object.calcAndSaveTransformMatrix();
                }
            });
        } else if(target instanceof Seat){
            (<Seat>target).calcAndSaveTransformMatrix();
        }
        this.checkAndSaveOrRestorePosition(target, x, y, target.angle)
    }

    private eligiblePosition(object: fabric.Object): boolean{
        if(object instanceof fabric.ActiveSelection){
            let isGood = true;
            (<fabric.ActiveSelection>object).forEachObject((object)=>{isGood = isGood && this.eligiblePosition(object)});
            return isGood;
        }
        if((object instanceof StageCenter) && !((<StageCenter>object).stage.centerInside())){
            return false;
        }
        return !(this.isOutOfArea(TicketlandCanvas.getTransformMatrix(object))||this.isPlaceBusy(object));
    }

    snapToGrid(object: fabric.Object) {
        object.left = Math.round(object.left / this._gridStep) * this._gridStep;
        object.top = Math.round(object.top / this._gridStep) * this._gridStep;
        isTlandObject(object) && object.savePositionAsEligible();
    }

    private static getTransformMatrix(obj: fabric.Object): Array<number> {
        let transformMatrix;
        if (obj instanceof Seat) {
            transformMatrix = obj.savedTransformMatrix;
        } else {
            // @ts-ignore
            transformMatrix = obj.calcTransformMatrix();
        }
        return transformMatrix;
    }

    isPlaceBusy(obj: fabric.Object): boolean {
        if(!(obj instanceof Seat)){
            return false;
        }
        let transformMatrix = TicketlandCanvas.getTransformMatrix(obj);
        let x = transformMatrix[4];
        let y = transformMatrix[5];
        const objects: Array<fabric.Object> = this.getObjects();
        let length = objects.length;
        for (let i = 0; i < length; i++) {
            if (obj !== objects[i] && objects[i].type == 'seat' && (< Seat > objects[i]).isOverlaying(x, y)) {
                return true;
            }
        }
        return false;
    }

    isOutOfArea(matrix: Array<number>): boolean {
        return matrix[4] < this.viewportBounds.tl.x
            || matrix[5] < this.viewportBounds.tl.y
            || matrix[4] > this.viewportBounds.br.x
            || matrix[5] > this.viewportBounds.br.y;
    }

    private initMovingModifiyngDeselectActions() {
        this.on('selection:cleared', () => {
            if(!this.selectedSection) {
                this.reportSelection();
            }
        });
        this.on('object:modified', (e) => {
            if(e.target instanceof SvgObject){
                (<SvgObject>e.target).resetStrokeWidth();
            }
            if(e.target instanceof Stage){
                (<Stage>e.target).moveCenter();
            }
            this.reportChanges();
        });
    }

    private reportChanges() {
        EventBus.pushMessage(TlandEvents.CHANGED, this.exportContentsToJsonString());
    }

    private reportSelection() {
        EventBus.pushMessage(TlandEvents.SELECTED, this.getSelectionJson());
    }

    private getSelectionJson() {
        const sel = this.getActiveObject();
        let data: any;
        if (!sel) {
            data = {
                type: 'empty',
                sections: this.sections.filter((x) => x.controls.length > 2)
            }
        } else {
            data = sel
        }
        return JSON.stringify(data);
    }

    private initAddMode() {
        this.on('mouse:down', (e) => {
            // @ts-ignore
            this.addObjectFromPointer(e);
            if (!e.target && !this.adding) {
                if(this.selectedSection) {
                    this.hideSelectedSectionsControls();
                    this.selectedSection = null;
                    this.reportSelection()
                }
            }
        });
    }

    get gridStep(): number {
        return this._gridStep;
    }

    private initSelections(): void {
        fabric.Group.prototype.originX = 'center';
        fabric.Group.prototype.originY = 'center';

        this.on('selection:created', () => {
            if(!this.adding){
                this.handleSelection();
                this.showControlsIfNeccessary();
            } else {
                this.discardActiveObject();
            }
        });
        this.on('selection:updated', () => {
            this.handleSelection();
            this.showControlsIfNeccessary();
        });
    }

    handleSelection(): void {
        const sel = this.getActiveObject();
        if (!(sel instanceof fabric.ActiveSelection)) {
            this.reportSelection();
            return;
        }
        sel.getObjects().forEach((x)=>{
            if(x instanceof Section || x instanceof ControlPoint){
                // @ts-ignore
                sel.removeWithUpdate(x);
            }
        });
        this.reportSelection();
        sel.lockScalingY = true;
        sel.lockScalingX = true;
        sel.setControlsVisibility({
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

        sel.data = {
            angle: sel.angle,
            x: sel.left,
            y: sel.top
        };
        // @ts-ignore
        sel.snapAngle = 15;

        this.dx = sel.left - Math.round(sel.left / this._gridStep) * this._gridStep;
        this.dy = sel.top - Math.round(sel.top / this._gridStep) * this._gridStep;
    }

    private showControlsIfNeccessary() {
        const sel = this.getActiveObject();
        if(!(sel instanceof ControlPoint)){
            this.hideSelectedSectionsControls();
            this.selectedSection = null;
        }
        if(sel instanceof Section){
            this.selectedSection = <Section>sel;
            this.showSelectedSectionsControls();
            // this.discardActiveObject();
        }
    }

    private hideSelectedSectionsControls() {
        if(this.selectedSection)
            this.removeAll(this.selectedSection.controls);
    }

    private showSelectedSectionsControls() {
        if(this.selectedSection)
            this.addAll(this.selectedSection.controls);
    }

    private initRotating() {
        this.on('object:rotating', event => {
            this._handleMovingOrRotating(event);
        });
    }

    private initZoomAndPan() {
        this.on('mouse:wheel',(opt)=>{
            // @ts-ignore
            let delta = opt.e.deltaY;
            let zoom = this.getZoom() - delta/200;
            if(zoom > 2){
                zoom = 2;
            }
            if(zoom < 0.4){
                zoom = 0.4;
            }
            // @ts-ignore
            this.zoomToPoint(new fabric.Point(opt.e.offsetX,opt.e.offsetY),zoom);
            opt.e.preventDefault();
            opt.e.stopPropagation();
            this.requestRenderAll();
            this.recalcViewport();
        });
        this.on('mouse:down',(opt)=>{
            let evt = opt.e;
            // @ts-ignore
            if (evt.altKey === true) {
                this.isDragging = true;
                this.selection = false;
                if(opt.target) {
                    this.discardActiveObject();
                    // @ts-ignore
                    this._currentTransform=false;
                }
                // @ts-ignore
                this.lastPosX = evt.clientX;
                // @ts-ignore
                this.lastPosY = evt.clientY;
            }
        });
        this.on('mouse:move', (opt)=>{
            if (this.isDragging) {
                let e = opt.e;
                // @ts-ignore
                this.viewportTransform[4] += e.clientX - this.lastPosX;
                // @ts-ignore
                this.viewportTransform[5] += e.clientY - this.lastPosY;
                // @ts-ignore
                this.zoomToPoint(new fabric.Point(e.clientX - this.lastPosX,e.clientY - this.lastPosY),this.getZoom());
                // @ts-ignore
                this.lastPosX = e.clientX;
                // @ts-ignore
                this.lastPosY = e.clientY;
                opt.e.preventDefault();
                opt.e.stopPropagation();
                this.requestRenderAll();
            }
        });
        this.on('mouse:up',()=>{
            if(this.isDragging) {
                this.recalcViewport();
                this.isDragging = false;
                this.selection = true;
            }
        })
    }

    toJSON() : any{
        // @ts-ignore
        let toExport: Array<fabric.Object> = this.getObjects().filter((x)=>!(x.type==='control_point'||x.type ==='stage_center'||(x.type==='section'&&x.controls.length<3)));
        let bounds = TicketlandCanvas.getOffsetWidthHeight(this.getObjects())||{offsetX:0,offsetY:0,width:0,height:0};
        return {
            type:"schema",
            offsetX:bounds.offsetX,
            offsetY:bounds.offsetY,
            width:bounds.width,
            height:bounds.height,
            objects:toExport,
        };
    }

    exportContentsToJsonString():string{
        let oldSel = this.getActiveObject();
        let textEditing: boolean = false;
        if(oldSel){
            if(oldSel instanceof TlandText && (<TlandText> oldSel).isEditing){
                textEditing = true;
            }
            this.discardActiveObject();
        }
        let json = JSON.stringify(this.toJSON());
        if(oldSel) {
            let newSel;
            if(oldSel instanceof fabric.ActiveSelection) {
                // @ts-ignore
                newSel = new TlandSelection(oldSel.getObjects(), {canvas: this});
            } else {
                newSel = oldSel;
                if (textEditing) {
                    debugger;
                    (<TlandText> newSel).enterEditing();
                }
            }
            this.setActiveObject(newSel);
        }
        return json;
    }

     handleEvent(event: TlandEvents, data: string){
        if(event === TlandEvents.CANVAS_LOAD_REQUEST) {
            this.loadFromJsonString(data);
            this.reportChanges();
            return;
        }
        if(event === TlandEvents.REQUEST_ADD_OBJECT) {
            this.data_to_add = data;
            this.adding = true;
            return;
        }
        if(event === TlandEvents.REQUEST_SELECT_MODE){
            this.adding = false;
            return;
        }
        if(event === TlandEvents.REQUEST_REMOVE_SELECTED){
            this.removeSelected();
            this.reportChanges();
            return;
        }
        if(event === TlandEvents.REQUESTED_SAVE){
            EventBus.pushMessage(TlandEvents.SAVE_DATA, this.exportContentsToJsonString());
            return;
        }
        if(event === TlandEvents.UPDATE_SELECTED){
            this.updateSelected(data);
            this.reportChanges();
            return;
        }
        if(event === TlandEvents.ZOOM_IN){
            return this.zoomIn();
        }
        if(event === TlandEvents.ZOOM_OUT){
            return this.zoomOut();
        }
        if(event === TlandEvents.REQUEST_ADD_SECTION){
            this.selectedSection = new Section();
            this.addAll([this.selectedSection]);
            EventBus.pushMessage(TlandEvents.REQUEST_ADD_OBJECT, '{"type":"control_point"}');
            return;
        }
        if(event === TlandEvents.CANVAS_RESTORE_REQUEST){
            this.loadFromJsonString(data);
            return;
        }
        if(event === TlandEvents.COPY){
            return this.copySelected();
        }
        if(event === TlandEvents.ADD_FROM_CLIPBOARD){
            let dataObj = JSON.parse(data);
            if(typeof(dataObj.type)!=='undefined'){
                if(dataObj.type !== 'selection'){
                    this.paste(dataObj);
                    this.reportChanges();
                    return;
                }
                this.pasteGroup(dataObj);
                this.reportChanges();
                return;
            }
            return EventBus.pushMessage(TlandEvents.ERROR, 'Incorrect data to paste');
        }
    }

    private loadFromJsonString(data: string) {
        this.clear();
        this.addAll(Parser.parseResponse(JSON.parse(data)));
        this.markSeatlessSectionsPlaces();
        this.reportSelection();
    }

    private updateSelected(data: string) {
        let selection = this.getActiveObject();
        if(selection){
            if(isTlandObject(selection)) {
                if(!selection.update(data))
                    EventBus.pushMessage(TlandEvents.ERROR, 'Incorrect update command: '+data);
                // @ts-ignore
                selection.dirty = true;
                this.checkAndSaveOrRestorePosition(selection);
                selection.setCoords();
                this.reportSelection();
                this.requestRenderAll();
            }
        }else {
            if(this.selectedSection) {
                let updated = this.selectedSection.update(data);
                if (updated) {
                    // @ts-ignore
                    this.selectedSection.dirty = true;
                    this.requestRenderAll();
                } else {
                    EventBus.pushMessage(TlandEvents.ERROR, 'Section data update: illegal argument in JSON: ' + data);
                }
            }
        }
    }

    addObjectFromPointer(event: fabric.IEvent){
        if(this.adding){
            // @ts-ignore
            let point = this.getPointer(event,false);
            let object: any = JSON.parse(this.data_to_add);
            object.x = point.x;
            object.y = point.y;
            if(object.type === 'control_point'){
                if(event.target instanceof ControlPoint){
                    this.adding=false;
                    return;
                }
                this.addControlPoint(object);
                this.reportChanges();
                return;
            }
            this.lastAddedObject = Parser.parseObject(object);
            this.snapToGrid(this.lastAddedObject);
            this.addAll([this.lastAddedObject]);
            this.reportChanges();
            this.adding = false;
            EventBus.pushMessage(TlandEvents.REQUEST_SELECT_MODE, null);
        }
    }

    private addControlPoint(object: any): void {
        if (!this.selectedSection) {
            EventBus.pushMessage(TlandEvents.REQUEST_SELECT_MODE, null);
            EventBus.pushMessage(TlandEvents.ERROR, 'No section selected');
        }
        this.hideSelectedSectionsControls();
        this.selectedSection.addControlPoint(<ControlPoint>Parser.parseObject(object));
        this.selectedSection = this.selectedSection.setCoords();
        this.showSelectedSectionsControls();
        return;
    }

    private updateSelectedSection() {
        this.selectedSection.updateForm();
        this.selectedSection = this.selectedSection.setCoords();
    }

    addAll(objects: fabric.Object[]) {
        let length = objects.length;
        for (let i = 0; i < length; i++) {
            if(objects[i] instanceof Section){
                this.sections.push(<Section>objects[i]);
            }
            this.add(objects[i]);
            if(objects[i] instanceof Stage){
                this.add((<Stage>objects[i]).stageCenter);
            }
        }
        this.requestRenderAll();
    }

    removeAll(objects: fabric.Object[]) {
        for (let i = 0; i < objects.length; i++) {
            if(objects[i] instanceof Section){
                this.sections.splice(this.sections.indexOf(<Section>objects[i]),1)
            }
            if(objects[i] instanceof Stage){
                this.remove((<Stage>objects[i]).stageCenter);
            }
            this.remove(objects[i]);
        }
        this.requestRenderAll();
    }

    removeSelected() {
        const selection = this.getActiveObject();
        if (selection === null) {
            if(this.selectedSection){
                this.hideSelectedSectionsControls();
                this.sections.splice(this.sections.indexOf(this.selectedSection),1);
                this.removeAll([this.selectedSection]);
                this.selectedSection = null;
                this.reportSelection();
                this.reportChanges();
            }
            return;
        }
        if (selection instanceof TlandSelection) {
            this.removeAll(selection.getObjects().filter((x)=>!(x instanceof ControlPoint) && !(x instanceof Seat)));
            this.discardActiveObject();
            this.reportChanges();
            return;
        }
        if (selection instanceof ControlPoint){
            this.hideSelectedSectionsControls();
            this.selectedSection.removeControlPoint(<ControlPoint>selection);
            this.selectedSection = this.selectedSection.setCoords();
            this.showSelectedSectionsControls();
            this.reportChanges();
            return;
        }
        if(selection instanceof Seat || selection instanceof StageCenter){
            //ignore
            return;
        }
        if(selection instanceof TlandText && (<TlandText>selection).isEditing){
            // @ts-ignore
            selection.dirty = true;
            this.requestRenderAll();
            return;
        }
        this.removeAll([selection]);
        this.reportChanges();
        this.reportSelection();
    }

    private static getOffsetWidthHeight(objects: fabric.Object[]): any {
        if(objects.length) {
            let count = objects.length;
            objects[0].setCoords();
            let corners = objects[0].aCoords;
            let minX = Math.min(corners.tl.x, corners.bl.x, corners.tr.x, corners.br.x);
            let minY = Math.min(corners.tl.y, corners.bl.y, corners.tr.y, corners.br.y);
            let maxX = Math.max(corners.tl.x, corners.bl.x, corners.tr.x, corners.br.x);
            let maxY = Math.max(corners.tl.y, corners.bl.y, corners.tr.y, corners.br.y);
            for (let i = 1; i < count; i++) {
                let obj = objects[i];
                if (!(obj instanceof ControlPoint||obj instanceof StageCenter)) {
                    obj.setCoords();
                    corners = obj.aCoords;
                    minX = Math.min(minX, corners.tl.x, corners.bl.x, corners.tr.x, corners.br.x);
                    minY = Math.min(minY, corners.tl.y, corners.bl.y, corners.tr.y, corners.br.y);
                    maxX = Math.max(maxX, corners.tl.x, corners.bl.x, corners.tr.x, corners.br.x);
                    maxY = Math.max(maxY, corners.tl.y, corners.bl.y, corners.tr.y, corners.br.y);
                }
            }
            return {
                offsetX: minX,
                offsetY: minY,
                width: maxX - minX,
                height: maxY - minY,
            }
        }
        return null;
    }

    zoomIn(): void {
        // @ts-ignore
        this.zoomToPoint(this.getVpCenter(),Math.min(Math.min(...this.zoomFactors.filter(x => x > this.getZoom())),Math.max(...this.zoomFactors)));
        this.recalcViewport();
    }

    zoomOut(): void{
        // @ts-ignore
        this.zoomToPoint(this.getVpCenter(),Math.max(Math.max(...this.zoomFactors.filter(x=>x<this.getZoom())),Math.min(...this.zoomFactors)));
        this.recalcViewport();
    }

    clear(): this{
        this.sections = [];
        this.registry = new IdRegister();
        return super.clear();
    }

    private checkAndSaveOrRestorePosition(object: fabric.Object,x: number = object.left, y: number = object.top, angle: number = object.angle) {
        if(isTlandObject(object)) {
            if (this.eligiblePosition(object)) {
                object.moveOnCanvas(x, y, angle);
                object.savePositionAsEligible();
                object.handleMoving();
            } else {
                object.restoreLastEligiblePosition();
                this.reportSelection();
            }
        }
    }

    add(...object: fabric.Object[]): fabric.StaticCanvas{
        object.forEach((x)=>{
            this.registry.register(x);
            this._objects.splice(this.getIndexToInsert(x),0,x);
        });
        // @ts-ignore
        if(this._onObjectAdded){
            object.forEach((x)=>{
                // @ts-ignore
                this._onObjectAdded(x);
            })
        }
        this.renderOnAddRemove && this.requestRenderAll();
        return this;
    }

    remove(...object: fabric.Object[]): fabric.StaticCanvas {
        object.forEach((x)=>{
            this.registry.unregister(x);
            super.remove(x);
        });
        return this;
    }

    private getIndexToInsert(obj: fabric.Object): number{
        let arrayEndIndex = this._objects.length;
        if(obj instanceof Seat){
            return arrayEndIndex;
        }
        if(obj instanceof Section){
            // @ts-ignore
            let index = this._objects.findIndex((x)=>!(x instanceof Section));
            return index > -1? index: arrayEndIndex;
        }
        if(obj instanceof SvgObject){
            // @ts-ignore
            let index = this._objects.findIndex((x)=>x instanceof Seat);
            return index > -1? index: arrayEndIndex;
        }
        // @ts-ignore
        let index = this._objects.findIndex((x)=>(x instanceof SvgObject)||(x instanceof Seat));
        return index > -1? index: arrayEndIndex;
    }

    private copySelected(): void{
        if(this.getActiveObject()) {
            EventBus.pushMessage(TlandEvents.REQUEST_WRITE_CLIPBOARD, this.getSelectionJson());
        }
    }

    private paste(object: any): void{
        let parsed = Parser.parseObject(object);
        if(parsed.type === 'seat'){
            return;
        }
        // @ts-ignore
        this.viewportCenterObject(parsed);
        if(parsed instanceof SvgObject){
            (<SvgObject>parsed).updateOrigin();
        }
        this.addAll([parsed]);
        this.requestRenderAll();
    }

    private pasteGroup(dataObject: any): void{
        let objects = dataObject.objects.filter((x:any)=>x.type!=='seat').map((x: any) =>Parser.parseObject(x));
        // @ts-ignore
        let vpCenter = this.getVpCenter();
        objects.forEach((object: fabric.Object)=>{
            object.left+=vpCenter.x;
            object.top+=vpCenter.y;
        });
        objects.filter((x: any)=>(x instanceof SvgObject)).forEach((x: SvgObject)=>x.updateOrigin());
        this.addAll(objects);
        // @ts-ignore
        let selection = new TlandSelection(objects,{canvas:this});
        this.setActiveObject(selection);
        this.requestRenderAll();
    }

    getSeatsBySectionId(id: number): Array<Seat>{
        // @ts-ignore
        return this.getObjects().filter(obj=>(obj instanceof Seat) && (<Seat>obj).sectionId === id);
    }

    private markSeatlessSectionsPlaces() {
        this.sections.forEach(section => this.fillPlacesSeatlessAttribute(section));
    }

    private fillPlacesSeatlessAttribute(section: Section) {
        console.log("invoke");
        console.log("section "+section.sectionName+" id: "+section.sectionId);
        console.log("freeSeating "+section.freeSeating);
        this.getSeatsBySectionId(section.sectionId).forEach(seat => {
            seat.fromSeatlessSection = section.freeSeating;
        });
    }
}
