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
const crypto = require("crypto");
const es = require("es-controller");
const random = require("randomstring");
const UserService_1 = require("../Service/UserService");
const DeviceService_1 = require("../Service/DeviceService");
const TransactionService_1 = require("../Service/TransactionService");
const index_1 = require("../index");
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
    $getTransPxy(tran) {
        return __awaiter(this, void 0, void 0, function* () {
            let sender = yield this.userService.get(tran.senderId.get());
            let receiver = yield this.userService.get(tran.receiverId.get());
            let metadatas = yield this.transactionService.getMetadatas(tran.id.get());
            let data = new Object();
            metadatas.forEach((m) => {
                data[m.key.get()] = m.value.get();
            });
            return {
                id: tran.id.get(),
                senderUserName: sender.userName.get(),
                receiverUserName: receiver.userName.get(),
                amount: tran.amount.get(),
                createdAt: tran.crtdAt.get(),
                data: data
            };
        });
    }
    get(params) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (params.id) {
                    let t = yield this.transactionService.get(params.id);
                    if (this.user.id.get() !== t.senderId.get() || this.user.id.get() !== t.receiverId.get())
                        throw 'UnAuthorized Access';
                    return yield this.$getTransPxy(t);
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
                        res.push(yield this.$getTransPxy(t));
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
            return yield this.$createTransaction(sender, senderDevice, receiver, receiverDevice, amount, token, body.data);
        });
    }
    put(params, body) {
        return __awaiter(this, void 0, void 0, function* () {
            let receiverUserName = params.receiverUserName;
            let receiverDeviceId = params.receiverDeviceId;
            let amount = Number.parseInt(params.amount);
            let senderUserName = this.user.userName.get();
            let senderDevice = this.device;
            let token = body.token;
            if (!receiverUserName)
                throw 'Receiver UserName is required';
            let receiver = yield this.userService.getByUserName(receiverUserName);
            if (!receiver)
                throw 'Receiver Not Found';
            let receiverDevice = null;
            if (receiverDeviceId) {
                receiverDevice = yield this.deviceService.get(receiverDeviceId);
                if (receiverDevice.userId.get() != receiver.id.get())
                    throw 'UnAuthorized Device Access';
            }
            let sender = yield this.userService.getByUserName(senderUserName);
            return yield this.$createTransaction(sender, senderDevice, receiver, receiverDevice, amount, token, body.data);
        });
    }
    $createTransaction(sender, senderDevice, receiver, receiverDevice, amount, token, data) {
        return __awaiter(this, void 0, void 0, function* () {
            if (senderDevice.expireAt.get().getTime() < new Date().getTime())
                throw 'Sender Device Expired';
            if (senderDevice.payable.get() !== true)
                throw 'Sender Device not payable';
            if (!amount || amount <= 0 || amount > 2000000)
                throw 'Invalid Amount';
            let currentMinute = Math.round(new Date().getTime() / (1000 * 60));
            let text = ':' + sender.userName.get() + ':' + senderDevice.id.get().toString() + ':' + receiver.userName.get() + ':' + amount.toString() + ':' + currentMinute.toString() + ':';
            let hmac = crypto.createHmac('sha256', senderDevice.secret.get());
            hmac.update(text);
            let computedHmac = hmac.digest('base64');
            if (token !== computedHmac || token == senderDevice.lastToken.get())
                throw 'Invalid Token';
            if (sender.balance.get() < amount)
                throw 'Sender InSufficient Balance';
            if (senderDevice.platform.get() == DeviceService_1.DevicePlatform.WEB) {
                senderDevice.secret.set(random.generate());
            }
            let trContext = yield index_1.globalContext.initTransaction();
            try {
                this.userService.context = trContext;
                this.deviceService.context = trContext;
                this.transactionService.context = trContext;
                sender = yield this.userService.get(sender.id.get());
                receiver = yield this.userService.get(receiver.id.get());
                sender.balance.set(sender.balance.get() - amount);
                receiver.balance.set(receiver.balance.get() + amount);
                senderDevice.lastToken.set(token);
                yield this.userService.save(sender);
                yield this.userService.save(receiver);
                yield this.deviceService.save(senderDevice);
                let transaction = yield this.transactionService.save({
                    senderId: sender.id.get(),
                    senderDeviceId: senderDevice.id.get(),
                    receiverId: receiver.id.get(),
                    receiverDeviceId: receiverDevice ? receiverDevice.id.get() : null,
                    amount: amount,
                    status: "PROCESSED",
                    data: data
                });
                yield trContext.commit();
                return yield this.$getTransPxy(transaction);
            }
            catch (err) {
                console.log(err);
                trContext.rollback();
                throw 'Tranfer Failed';
            }
        });
    }
}
exports.default = Pay;
