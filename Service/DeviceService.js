"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const es_cache_1 = require("es-cache");
const index_1 = require("../index");
const Device_1 = require("../Model/Device");
var DevicePlatform;
(function (DevicePlatform) {
    DevicePlatform[DevicePlatform["DEFAULT"] = 0] = "DEFAULT";
    DevicePlatform[DevicePlatform["WEB"] = 1] = "WEB";
    DevicePlatform[DevicePlatform["ANDROID"] = 2] = "ANDROID";
    DevicePlatform[DevicePlatform["IOS"] = 3] = "IOS";
})(DevicePlatform = exports.DevicePlatform || (exports.DevicePlatform = {}));
var deviceCache = new es_cache_1.default({
    valueFunction: function (id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield index_1.globalContext.devices.where((d) => {
                return d.id.eq(id);
            }).unique();
        });
    },
    limit: 65536
});
class DeviceService {
    constructor(context) {
        this.context = null;
        if (context)
            this.context = context;
        else
            this.context = index_1.globalContext;
    }
    copyProperties(device, model) {
        device.name.set(model.name);
        device.payable.set(model.payable);
        device.platform.set(model.platform);
        return device;
    }
    get(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield deviceCache.get(id);
        });
    }
    save(model) {
        return __awaiter(this, void 0, void 0, function* () {
            let device = null;
            if (model instanceof Device_1.default) {
                device = model;
            }
            else if (model.id) {
                device = yield this.context.devices.get(model.id);
                device = this.copyProperties(device, model);
            }
            else {
                device = this.context.devices.getEntity();
                device = this.copyProperties(device, model);
                device.userId.set(model.userId);
            }
            if (model.platform) {
                device.platform.set(DevicePlatform[model.platform]);
            }
            device = yield this.context.devices.insertOrUpdate(device);
            deviceCache.del(device.id.get());
            return device;
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            let device = yield this.context.devices.where((a) => {
                return a.id.eq(id);
            }).unique();
            yield this.context.devices.delete(device);
        });
    }
    list(params) {
        return __awaiter(this, void 0, void 0, function* () {
            let criteria = this.getExpression(params);
            return yield this.context.devices.where(criteria).list();
        });
    }
    single(params) {
        return __awaiter(this, void 0, void 0, function* () {
            let criteria = this.getExpression(params);
            return yield this.context.devices.where(criteria).unique();
        });
    }
    getExpression(params) {
        if (params) {
            let e = this.context.devices.getEntity();
            let c = this.context.getCriteria();
            if (params.userId) {
                c = c.add(e.userId.eq(params.userId));
            }
            if (params.platform) {
                c = c.add(e.platform.eq(DevicePlatform[params.platform]));
            }
            if (params.payable) {
                c = c.add(e.payable.eq(params.payable));
            }
            if (params.active) {
                c = c.add(e.active.eq(params.active));
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
