"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const crypto = require('crypto');
const es = require('es-controller');
const UserService_1 = require("../Service/UserService");
const DeviceService_1 = require('../Service/DeviceService');
const TransactionService_1 = require('../Service/TransactionService');
const AuthFilter_1 = require('../AuthFilter');
class Pay extends es.Controller {
    constructor() {
        super(...arguments);
        this.user = null;
        this.userService = new UserService_1.default();
        this.deviceService = new DeviceService_1.default();
        this.transactionService = new TransactionService_1.default();
    }
    $init() {
        this.filters.push(AuthFilter_1.default);
        let request = this.$get('request');
        if (request.user) {
            this.user = request.user;
        }
    }
    post(params, body) {
        return __awaiter(this, void 0, void 0, function* () {
            let senderUserName = body.senderUserName;
            let senderDeviceId = body.senderDeviceId;
            let receiverUserName = body.receiverUserName;
            let amount = body.amount;
            let token = body.token;
            if (!receiverUserName)
                throw 'Receiver UserName is required';
            if (!senderUserName)
                throw 'Sender UserName is required';
            if (receiverUserName != this.user.userName.get())
                throw 'Invalid Receiver Id';
            let sender = yield this.userService.getByUserName(senderUserName);
            if (!sender)
                throw 'Sender Not Found';
            let receiver = yield this.userService.getByUserName(receiverUserName);
            if (!receiver)
                throw 'Receiver Not Found';
            if (!senderDeviceId)
                throw 'Sender Device Id is required';
            let senderDevice = yield this.deviceService.get(senderDeviceId);
            if (!senderDevice)
                throw 'Invalid Sender Device';
            if (senderDevice.userId != sender.id)
                throw 'Invalid Sender Device';
            if (senderDevice.expireAt.get().getTime() < new Date().getTime())
                throw 'Sender Device Expired';
            let currentMinute = new Date().getTime() / (1000 * 60);
            let text = ':' + senderUserName + ':' + senderDeviceId + ':' + receiverUserName + ':' + amount.toFixed(2) + ':' + currentMinute.toString() + ':';
            let hmac = crypto.createHmac('sha256', senderDevice.secret.get());
            hmac.update(text);
            let computedHmac = hmac.digest('base64');
            if (token !== computedHmac)
                throw 'Invalid Token';
            if (sender.balance.get() < amount)
                throw 'Sender InSufficient Balance';
            sender.balance.set(sender.balance.get() - amount);
            receiver.balance.set(receiver.balance.get() + amount);
            yield this.userService.save(sender);
            yield this.userService.save(receiver);
            yield this.transactionService.save({
                senderId: sender.id.get(),
                senderDeviceId: senderDeviceId,
                receiverId: receiver.id.get(),
                receiverDeviceId: null,
                amount: amount,
                title: body.title,
                description: body.description
            });
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Pay;
