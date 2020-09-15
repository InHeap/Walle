"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DevicePlatform = void 0;
const es_cache_1 = require("es-cache");
const index_1 = require("../index");
const Device_1 = require("../model/Device");
var DevicePlatform;
(function (DevicePlatform) {
    DevicePlatform[DevicePlatform["DEFAULT"] = 0] = "DEFAULT";
    DevicePlatform[DevicePlatform["WEB"] = 1] = "WEB";
    DevicePlatform[DevicePlatform["ANDROID"] = 2] = "ANDROID";
    DevicePlatform[DevicePlatform["IOS"] = 3] = "IOS";
})(DevicePlatform = exports.DevicePlatform || (exports.DevicePlatform = {}));
var deviceCache = new es_cache_1.default({
    valueFunction: async function (id) {
        return await index_1.globalContext.devices.where((d) => {
            return d.id.eq(id);
        }).unique();
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
    async get(id) {
        return await deviceCache.get(id);
    }
    async save(model) {
        let device = null;
        if (model instanceof Device_1.default) {
            device = model;
        }
        else if (model.id) {
            device = await this.context.devices.get(model.id);
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
        device = await this.context.devices.insertOrUpdate(device);
        deviceCache.del(device.id.get());
        return device;
    }
    async delete(id) {
        let device = await this.context.devices.where((a) => {
            return a.id.eq(id);
        }).unique();
        await this.context.devices.delete(device);
    }
    async list(params) {
        let criteria = this.getExpression(params);
        return await this.context.devices.where(criteria).list();
    }
    async single(params) {
        let criteria = this.getExpression(params);
        return await this.context.devices.where(criteria).unique();
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
exports.default = DeviceService;
//# sourceMappingURL=DeviceService.js.map