"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
    get(params) {
        return __awaiter(this, void 0, void 0, function* () {
            if (params.id) {
                let deviceId = params.id;
                let device = yield this.deviceService.get(deviceId);
                if (device.userId.get() !== this.user.id.get())
                    throw 'Anauthorized Access';
                return device;
            }
            else {
                let devices = yield this.deviceService.list({ userId: this.user.id.get() });
                return devices;
            }
        });
    }
    post(params, model) {
        return __awaiter(this, void 0, void 0, function* () {
            if (model.id && model.userId) {
                let device = yield this.deviceService.get(model.id);
                if (device.userId.get() !== this.user.id.get())
                    throw 'Anauthorized Access';
            }
            model.userId = this.user.id.get();
            return yield this.deviceService.save(model);
        });
    }
    delete(params) {
        return __awaiter(this, void 0, void 0, function* () {
            let deviceId = params.id;
            let device = yield this.deviceService.get(deviceId);
            if (device.userId.get() !== this.user.id.get())
                throw 'Anauthorized Access';
            device.active.set(false);
            this.deviceService.save(device);
        });
    }
}
exports.default = Device;
