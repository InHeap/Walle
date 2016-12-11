"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const crypto = require("crypto");
const es = require("es-controller");
const UserService_1 = require("../Service/UserService");
const DeviceService_1 = require("../Service/DeviceService");
const TransactionService_1 = require("../Service/TransactionService");
class Pay extends es.Controller {
    constructor() {
        super(...arguments);
        this.user = null;
        this.device = null;
        this.userService = new UserService_1.default();
        this.deviceService = new DeviceService_1.default();
        this.transactionService = new TransactionService_1.default();
    }
    $init() {
        let request = this.$get('request');
        this.user = request.user;
        this.device = request.device;
    }
    get(params) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (params.id) {
                    let t = yield this.transactionService.get(params.id);
                    if (this.user.id.get() !== t.senderId.get() || this.user.id.get() !== t.receiverId.get())
                        throw 'UnAuthorized Access';
                    let sender = yield this.userService.get(t.senderId.get());
                    let receiver = yield this.userService.get(t.receiverId.get());
                    return {
                        id: t.id.get(),
                        senderUserName: sender.userName.get(),
                        receiverUserName: receiver.userName.get(),
                        amount: t.amount.get(),
                        createdAt: t.crtdAt.get()
                    };
                }
                else {
                    let index = Number.parseInt(params.index);
                    let limit = Number.parseInt(params.limit);
                    let fromDate = Number.parseInt(params.fromDate);
                    let toDate = Number.parseInt(params.toDate);
                    let transactions = yield this.transactionService.getUserTransactions({
                        userId: this.user.id.get(),
                        index: index,
                        limit: limit,
                        fromDate: fromDate,
                        toDate: toDate
                    });
                    let res = [];
                    transactions.forEach((t) => __awaiter(this, void 0, void 0, function* () {
                        let sender = yield this.userService.get(t.senderId.get());
                        let receiver = yield this.userService.get(t.receiverId.get());
                        res.push({
                            id: t.id.get(),
                            senderUserName: sender.userName.get(),
                            receiverUserName: receiver.userName.get(),
                            amount: t.amount.get(),
                            createdAt: t.crtdAt.get()
                        });
                    }));
                    return res;
                }
            }
            catch (error) {
                console.log(error);
                throw 'Invalid Parameter';
            }
        });
    }
    post(params, body) {
        return __awaiter(this, void 0, void 0, function* () {
            let senderUserName = body.senderUserName;
            let senderDeviceId = body.senderDeviceId;
            let receiverUserName = this.user.userName.get();
            let receiverDevice = this.device;
            let amount = Number.parseInt(body.amount);
            let token = body.token;
            if (!senderUserName)
                throw 'Sender UserName is required';
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
            if (senderDevice.payable.get() !== true)
                throw 'Sender Device not payable';
            if (!amount && amount <= 0)
                throw 'Invalid Amount';
            let currentMinute = (new Date().getTime() / (1000 * 60)).toFixed(0);
            let text = ':' + senderUserName + ':' + senderDeviceId + ':' + receiverUserName + ':' + amount.toString() + ':' + currentMinute + ':';
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
            let transaction = yield this.transactionService.save({
                senderId: sender.id.get(),
                senderDeviceId: senderDeviceId,
                receiverId: receiver.id.get(),
                receiverDeviceId: receiverDevice.id.get(),
                amount: amount,
                title: body.title,
                description: body.description
            });
            return {
                id: transaction.id.get(),
                senderUserName: sender.userName.get(),
                receiverUserName: receiver.userName.get(),
                amount: transaction.amount.get(),
                createdAt: transaction.crtdAt.get()
            };
        });
    }
    put(params, body) {
        return __awaiter(this, void 0, void 0, function* () {
            let receiverUserName = params.receiverUserName;
            let amount = Number.parseInt(params.amount);
            let senderUserName = this.user.userName.get();
            let senderDevice = this.device;
            let token = body.token;
            if (!receiverUserName)
                throw 'Receiver UserName is required';
            let receiver = yield this.userService.getByUserName(receiverUserName);
            if (!receiver)
                throw 'Receiver Not Found';
            if (senderDevice.expireAt.get().getTime() < new Date().getTime())
                throw 'Sender Device Expired';
            if (senderDevice.payable.get() !== true)
                throw 'Sender Device not payable';
            if (!amount && amount <= 0)
                throw 'Invalid Amount';
            let currentMinute = (new Date().getTime() / (1000 * 60)).toFixed(0);
            let text = ':' + senderUserName + ':' + senderDevice.id.get().toString() + ':' + receiverUserName + ':' + amount.toString() + ':' + currentMinute + ':';
            let hmac = crypto.createHmac('sha256', senderDevice.secret.get());
            hmac.update(text);
            let computedHmac = hmac.digest('base64');
            if (token !== computedHmac)
                throw 'Invalid Token';
            let sender = yield this.userService.getByUserName(senderUserName);
            if (sender.balance.get() < amount)
                throw 'Sender InSufficient Balance';
            sender.balance.set(sender.balance.get() - amount);
            receiver.balance.set(receiver.balance.get() + amount);
            yield this.userService.save(sender);
            yield this.userService.save(receiver);
            let transaction = yield this.transactionService.save({
                senderId: sender.id.get(),
                senderDeviceId: senderDevice.id.get(),
                receiverId: receiver.id.get(),
                receiverDeviceId: null,
                amount: amount,
                title: body.title,
                description: body.description
            });
            return {
                id: transaction.id.get(),
                senderUserName: sender.userName.get(),
                receiverUserName: receiver.userName.get(),
                amount: transaction.amount.get(),
                createdAt: transaction.crtdAt.get()
            };
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Pay;
