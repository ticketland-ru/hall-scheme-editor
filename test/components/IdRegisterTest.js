/*
 * Copyright (c) 2019 ООО «МДТЗК» (ticketland.ru)
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense copies of the Software,  and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import {IdRegister} from "../../src/ts/components/helpers/IdRegister";

const assert = require('chai').assert;

describe('IdRegister',()=>{

    let register;

    beforeEach(()=>{
        register = new IdRegister();
    });

    it('При регистрации объекта с определённым id поле для хранения максимального id обновляется',()=>{
        register.register({objectId:10});

        assert.equal(register.maxId,10);
    });

    it('При регистрации объекта с objectId=undefined поле для хранения максимального id обновляется',()=>{
        register.register({});

        assert.equal(register.maxId, 1);
    });

    it('При регистрации объекта с objectId=NaN поле для хранения максимального id обновляется',()=>{
        register.register({objectId: NaN});

        assert.equal(register.maxId, 1);
    });

    it('При регистрации объекта с objectId=undefined ему присваивается id, который больше всех предыдущих',()=>{
        let obj = {};

        register.register({objectId:10});
        register.register(obj);

        assert.equal(obj.objectId, 11);
    });

    it('При регистрации объекта с незанятым id его id сохраняется в множестве',()=>{
        register.register({objectId:10});

        assert.isTrue(register.isIdRegistered(10));
    });

    it('При регистрации объекта с занятым id ему присваивается новый id',()=>{
        register.register({objectId:10});
        let obj = {objectId:10};

        register.register(obj);

        assert.equal(obj.objectId, 11);
    });

    it('При регистрации объекта с занятым id его новый id сохраняется в множестве',()=>{
        register.register({objectId:10});
        let obj = {objectId:10};

        register.register(obj);

        assert.isTrue(register.isIdRegistered(11));
    });

    it('При регистрации объекта с незанятым и немаксимальным id его id не изменяется',()=>{
        register.register({objectId:10});
        let obj = {objectId:9};

        register.register(obj);

        assert.equal(obj.objectId, 9);
    });

    it('При регистрации объекта с незанятым и немаксимальным id поле maxId не обновляется',()=>{
        register.register({objectId:10});
        let obj = {objectId:9};

        register.register(obj);

        assert.equal(register.maxId, 10);
    });

    it('При снятии объекта с регистрации его id удаляется из множества, а максимальный id остаётся',()=>{
        register.register({objectId:10});
        register.unregister({objectId:10});

        assert.isFalse(register.isIdRegistered(10));
    });

    it('При снятии объекта с регистрации максимальный id не изменяется',()=>{
        register.register({objectId:10});
        register.unregister({objectId:10});

        assert.equal(register.maxId, 10);
    });
});
