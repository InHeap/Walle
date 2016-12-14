"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const random = require("randomstring");
const es = require("es-controller");
const UserService_1 = require("../Service/UserService");
const DeviceService_1 = require("../Service/DeviceService");
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
            if (!(model.userName && typeof model.userName == 'string'))
                throw 'Invalid UserName';
            if (model.userName.length > 25)
                throw 'UserName should be less then 16 characters';
            if (!(model.password && typeof model.password == 'string'))
                throw 'Blank Password';
            if (model.password.length > 25)
                throw 'Password should be less then 16 characters';
            if (!(yield this.check({ userName: model.userName })))
                throw 'Duplicate User';
            if (model.phoneNo) {
            }
            let user = yield this.userService.save(model);
            return true;
        });
    }
    check(params) {
        return __awaiter(this, void 0, void 0, function* () {
            let userName = params.userName;
            if (!(userName && typeof userName == 'string'))
                return false;
            let u = yield this.userService.getByUserName(userName);
            return u ? false : true;
        });
    }
    login(params, model) {
        return __awaiter(this, void 0, void 0, function* () {
            let userName = model.userName;
            let password = model.password;
            let deviceId = Number.parseInt(model.deviceId);
            let platform = model.platform;
            if (!(userName && typeof userName == 'string'))
                throw 'Invalid UserName';
            if (!(password && typeof password == 'string'))
                throw 'Invalid Password';
            let user = yield this.userService.getByUserName(userName);
            if (!user)
                throw 'User not found';
            if (user.password.get() !== password)
                throw 'Invalid Username or Password';
            if (platform) {
                if (!(typeof platform == 'string' && DeviceService_1.DevicePlatform[platform]))
                    throw 'Invalid Platform';
            }
            else {
                platform = 'DEFAULT';
            }
            user.accessToken.set(random.generate());
            user.expireAt.set(new Date(new Date().getTime() + 3600000));
            this.userService.save(user);
            let device = null;
            if (deviceId) {
                device = yield this.deviceService.get(deviceId);
                if (device.active.get() !== true)
                    throw 'Device Inactive';
            }
            else if (DeviceService_1.DevicePlatform[platform] == DeviceService_1.DevicePlatform.WEB) {
                device = yield this.deviceService.single({
                    userId: user.id.get(),
                    platform: platform,
                    active: true
                });
            }
            if (!device) {
                device = yield this.deviceService.save({
                    userId: user.id.get(),
                    platform: platform,
                    payable: true
                });
            }
            device.secret.set(random.generate());
            if (DeviceService_1.DevicePlatform[model.platform] == DeviceService_1.DevicePlatform.WEB) {
                device.expireAt.set(new Date(new Date().getTime() + (3600 * 1000)));
            }
            else {
                device.expireAt.set(new Date(new Date().getTime() + (7 * 24 * 3600 * 1000)));
            }
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
    pay(params, model) {
        return __awaiter(this, void 0, void 0, function* () {
            let callbackUrl = model.callbackUrl;
            let receiverUsername = model.receiverUsername;
            let amount = Number.parseInt(model.amount);
            if (!(callbackUrl && typeof callbackUrl == 'string'))
                throw 'Invalid Callback Url';
            if (!(receiverUsername && typeof receiverUsername == 'string'))
                throw 'Receiver Username is required';
            if (!(amount && amount <= 0))
                throw 'Invalid Amount';
            let receiver = yield this.userService.getByUserName(receiverUsername);
            if (!receiver)
                throw 'Receiver Not Found';
            return this.$view({
                callbackUrl: callbackUrl,
                receiverUsername: receiver.userName.get(),
                amount: amount
            });
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Auth;
