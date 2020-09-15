"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const es = require("es-controller");
const DeviceService_1 = require("../Service/DeviceService");
class Device extends es.Controller {
    constructor() {
        super(...arguments);
        this.user = null;
        this.deviceService = new DeviceService_1.default();
    }
    $init() {
        let request = this.$get('request');
        if (request.user) {
            this.user = request.user;
        }
    }
    async get(params) {
        if (params.id) {
            let deviceId = params.id;
            let device = await this.deviceService.get(deviceId);
            if (device.userId.get() !== this.user.id.get())
                throw 'Anauthorized Access';
            return device;
        }
        else {
            let devices = await this.deviceService.list({ userId: this.user.id.get() });
            return devices;
        }
    }
    async post(params, model) {
        if (model.id && model.userId) {
            let device = await this.deviceService.get(model.id);
            if (device.userId.get() !== this.user.id.get())
                throw 'Anauthorized Access';
        }
        model.userId = this.user.id.get();
        return await this.deviceService.save(model);
    }
    async delete(params) {
        let deviceId = params.id;
        let device = await this.deviceService.get(deviceId);
        if (device.userId.get() !== this.user.id.get())
            throw 'Anauthorized Access';
        device.active.set(false);
        this.deviceService.save(device);
    }
}
exports.default = Device;
//# sourceMappingURL=Device.js.map