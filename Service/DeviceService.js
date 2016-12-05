"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const es_entity_1 = require("es-entity");
const index_1 = require("../index");
const Device_1 = require('../Model/Device');
var devicePropertyTrans = new es_entity_1.default.Util.PropertyTransformer();
devicePropertyTrans.fields.push('name', 'description', 'payable');
class DeviceService {
    constructor() {
    }
    copyProperties(device, entity) {
        device = devicePropertyTrans.assignEntity(device, entity);
        return device;
    }
    get(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield index_1.context.devices.where((d) => {
                return d.id.eq(id);
            }).unique();
        });
    }
    save(model) {
        return __awaiter(this, void 0, void 0, function* () {
            let device = null;
            if (model instanceof Device_1.default) {
                device = model;
            }
            else if (model.id) {
                device = yield index_1.context.devices.get(model.id);
                device = this.copyProperties(device, model);
            }
            else {
                device = index_1.context.devices.getEntity();
                device = this.copyProperties(device, model);
                device.userId.set(model.userId);
            }
            device = yield index_1.context.devices.insertOrUpdate(device);
            return device;
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            let device = yield index_1.context.devices.where((a) => {
                return a.id.eq(id);
            }).unique();
            yield index_1.context.devices.delete(device);
        });
    }
    list(params) {
        return __awaiter(this, void 0, void 0, function* () {
            let criteria = this.getExpression(params);
            return yield index_1.context.devices.where(criteria).list();
        });
    }
    single(params) {
        return __awaiter(this, void 0, void 0, function* () {
            let criteria = this.getExpression(params);
            return yield index_1.context.devices.where(criteria).unique();
        });
    }
    getExpression(params) {
        if (params) {
            let e = index_1.context.devices.getEntity();
            let c = index_1.context.getCriteria();
            if (params.userId) {
                c = c.add(e.userId.eq(params.userId));
            }
            return c;
        }
        else {
            throw 'No Parameter Found';
        }
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DeviceService;