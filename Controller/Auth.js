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
const random = require("randomstring");
const es = require("es-controller");
const crypto = require("crypto");
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
            let av = yield this.check({ userName: model.userName });
            if (!av.available)
                throw 'Duplicate User';
            if (model.phoneNo) {
                var str = "The best things in life are free";
                var patt = new RegExp("e");
                var res = patt.test(str);
            }
            let user = yield this.userService.save(model);
            return true;
        });
    }
    check(params) {
        return __awaiter(this, void 0, void 0, function* () {
            let userName = params.userName;
            let available = false;
            if (!(userName && typeof userName == 'string'))
                available = false;
            let u = yield this.userService.getByUserName(userName);
            available = u ? false : true;
            return {
                available: available
            };
        });
    }
    login(params, model) {
        return __awaiter(this, void 0, void 0, function* () {
            let userName = model.userName;
            let passKey = model.passKey;
            let deviceId = Number.parseInt(model.deviceId);
            let platform = model.platform;
            if (!(userName && typeof userName == 'string'))
                throw 'Invalid UserName';
            if (!(passKey && typeof passKey == 'string'))
                throw 'Invalid Password';
            let user = yield this.userService.getByUserName(userName);
            if (!user)
                throw 'User not found';
            let hash = crypto.createHash('sha256');
            let currDate = new Date();
            let passText = `:${user.password.get()}:${currDate.getDate()}:${currDate.getMonth()}:${currDate.getFullYear()}:`;
            hash.update(passText);
            let passHash = hash.digest('base64');
            if (passHash !== passKey)
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
            let request = this.$get('request');
            let user = request.user;
            let device = request.device;
            device.secret.set(random.generate());
            device.expireAt.set(new Date().getTime());
            yield this.deviceService.save(device);
            return {
                response: "success"
            };
        });
    }
}
exports.default = Auth;
