"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const random = require('randomstring');
const es = require('es-controller');
const UserService_1 = require("../Service/UserService");
const DeviceService_1 = require('../Service/DeviceService');
class Auth extends es.Controller {
    constructor() {
        super(...arguments);
        this.userService = new UserService_1.default();
        this.deviceService = new DeviceService_1.default();
    }
    $init() {
        let request = this.$get('request');
    }
    register(params, model) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!model.userName)
                throw 'Blank UserName';
            if (!model.password)
                throw 'Blank Password';
            if (!(yield this.check({ userName: model.userName })))
                throw 'Duplicate User';
            let user = yield this.userService.save(model);
        });
    }
    check(params) {
        return __awaiter(this, void 0, void 0, function* () {
            let u = yield this.userService.getByUserName(params.userName);
            return u ? false : true;
        });
    }
    login(params, model) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!model.userName)
                throw 'Blank UserName';
            if (!model.password)
                throw 'Blank Password';
            let user = yield this.userService.getByUserName(params.userName);
            if (!user)
                throw 'User not found';
            if (user.password.get() !== model.password)
                throw 'Invalid Username or Password';
            user.accessToken.set(random.generate());
            user.expireAt.set(new Date(new Date().getTime() + 3600000));
            this.userService.save(user);
            let device = null;
            if (model.deviceId) {
                device = yield this.deviceService.get(model.deviceId);
            }
            else {
                device = yield this.deviceService.save({
                    userId: user.id.get(),
                    payable: true
                });
            }
            device.secret.set(random.generate());
            device.expireAt.set(new Date(new Date().getTime() + (7 * 24 * 3600 * 1000)));
            this.deviceService.save(device);
            return {
                userName: user.userName.get(),
                token: user.accessToken.get(),
                deviceId: device.id.get(),
                deviceSecret: device.secret.get()
            };
        });
    }
    logout(params, model) {
        return __awaiter(this, void 0, void 0, function* () {
            let user = yield this.userService.getByUserName(model.userName);
            if (!user)
                throw 'User Not Found';
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Auth;
