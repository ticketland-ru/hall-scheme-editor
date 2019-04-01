
/*
 * Copyright (c) 2019 ООО «МДТЗК» (ticketland.ru)
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense copies of the Software,  and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

export enum TlandEvents {

    /**
     * начальное состояние после корректного запуска
     * @data = null
     */
    INITIALIZED = 'INITIALIZED',

    /**
     * при получении этой команды рабочая область попытается разобрать и загрузить данные
     * а единичные компоненты очистят своё состояние
     * @data - json со схемой зала
     */
    CANVAS_LOAD_REQUEST='CANVAS_LOAD_REQUEST',

    /**
     * при любом изменении схемы на рабочей области она отправляет в шину сообщений новую версию схемы
     * @data - json со схемой зала
     */
    CHANGED='CHANGED',

    /**
     * Данное сообщение может отправлять любой компонент при любой ошибке
     * @data - сообщение об ошибке
     */
    ERROR='ERROR',

    /**
     * Данное сообщение сообщает рабочей области, что её состояние надо сохранить.
     * В реализации ticketland рабочая область отправляет сообщение SAVE_DATA
     * @data = null
     */
    REQUESTED_SAVE='REQUESTED_SAVE',

    /**
     * Сообщает рабочей области, что необходимо переключиться в режим добавления объекта
     * @data = '{"type":string,"width":number,"height":number}',
     *      где type - тип добавляемого объекта, а width, height - его размеры
     */
    REQUEST_ADD_OBJECT='REQUEST_ADD_OBJECT',

    /**
     * Сообщает рабочей области, что необходимо переключиться в режим выделения
     * @data = null
     */
    REQUEST_SELECT_MODE='REQUEST_SELECT_MODE',

    /**
     * Сообщает рабочей области, что выделенный объект необходимо удалить
     * @data = null
     */
    REQUEST_REMOVE_SELECTED = 'REQUEST_REMOVE_SELECTED',

    /**
     * Отправляется рабочей областью при выделении объекта.
     * Сообщает пользовательскому интерфейсу параметры выделенного объекта
     * @data - сериализованный объект
     */
    SELECTED = 'SELECTED',

    /**
     * Сообщает рабочей области, что выделенному объекту надо присвоить новые атрибуты
     * @data - '{"attr1":value1,"attr2":value2}'
     */
    UPDATE_SELECTED = 'UPDATE_SELECTED',

    /**
     * Отправляется рабочей областью в ответ на REQUESTED_SAVE
     * @data - сериализованная схема зала
     */
    SAVE_DATA = 'SAVE_DATA',

    /**
     * Сообщает рабочей области о необходимости приблизить представление
     * @data = null
     */
    ZOOM_IN = 'ZOOM_IN',

    /**
     * Сообщает рабочей области о необходимости отдалить представление
     * @data = null
     */
    ZOOM_OUT = 'ZOOM_OUT',

    /**
     * Переводит рабочую область в режим добавления сектора
     * @data = null
     */
    REQUEST_ADD_SECTION = 'REQUEST_ADD_SECTION',

    /**
     * при получении этой команды рабочая область попытается разобрать и загрузить данные
     * единичные компоненты проигнорируют
     * @data - json со схемой зала
     */
    CANVAS_RESTORE_REQUEST = 'CANVAS_RESTORE_REQUEST',

    /**
     * при получении этой команды диспетчер отмены действий спровоцирует рабочую область
     * на восстановление предыдущего состояния
     * @data = null
     */
    UNDO = 'UNDO',

    /**
     * при получении этой команды диспетчер отмены действий спровоцирует рабочую область
     * на восстановление предыдущего отменённого состояния
     * @data = null
     */
    REDO = 'REDO',

    /**
     * при получении этой команды диспетчер буфера обмена запишет в него данные
     * @data - json скопированных объектов
     */
    REQUEST_WRITE_CLIPBOARD = 'REQUEST_WRITE_CLIPBOARD',

    /**
     * при получении этой команды рабочая область добавит в центр экрана объекты из сообщения
     * @data - json скопированных объектов
     */
    ADD_FROM_CLIPBOARD = 'ADD_FROM_CLIPBOARD',

    /**
     * При получении этой команды рабочая область выполнит действия, необходимые для копирования объектов
     * @data = null
     */
    COPY = 'COPY',

    /**
     * При получении этой команды дипетчер буфера обмена выполнит действия,
     * необходимые для вставки объектов на рабочую область
     * @data = null
     */
    PASTE = 'PASTE',
}
