"use strict";
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
    async $getTransPxy(tran) {
        let sender = await this.userService.get(tran.senderId.get());
        let receiver = await this.userService.get(tran.receiverId.get());
        let metadatas = await this.transactionService.getMetadatas(tran.id.get());
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
    }
    async get(params) {
        try {
            if (params.id) {
                let t = await this.transactionService.get(params.id);
                if (this.user.id.get() !== t.senderId.get() || this.user.id.get() !== t.receiverId.get())
                    throw 'UnAuthorized Access';
                return await this.$getTransPxy(t);
            }
            else {
                let index = Number.parseInt(params.index);
                let limit = Number.parseInt(params.limit);
                let fromDate = Number.parseInt(params.fromDate);
                let toDate = Number.parseInt(params.toDate);
                let transactions = await this.transactionService.getUserTransactions({
                    userId: this.user.id.get(),
                    index: index,
                    limit: limit,
                    fromDate: fromDate,
                    toDate: toDate
                });
                let res = [];
                transactions.forEach(async (t) => {
                    res.push(await this.$getTransPxy(t));
                });
                return res;
            }
        }
        catch (error) {
            console.log(error);
            throw 'Invalid Parameter';
        }
    }
    async post(params, body) {
        let senderUserName = body.senderUserName;
        let senderDeviceId = body.senderDeviceId;
        let receiverUserName = this.user.userName.get();
        let receiverDevice = this.device;
        let amount = Number.parseInt(body.amount);
        let token = body.token;
        if (!senderUserName)
            throw 'Sender UserName is required';
        let sender = await this.userService.getByUserName(senderUserName);
        if (!sender)
            throw 'Sender Not Found';
        let receiver = await this.userService.getByUserName(receiverUserName);
        if (!receiver)
            throw 'Receiver Not Found';
        if (!senderDeviceId)
            throw 'Sender Device Id is required';
        let senderDevice = await this.deviceService.get(senderDeviceId);
        if (!senderDevice)
            throw 'Invalid Sender Device';
        if (senderDevice.userId != sender.id)
            throw 'Invalid Sender Device';
        return await this.$createTransaction(sender, senderDevice, receiver, receiverDevice, amount, token, body.data);
    }
    async put(params, body) {
        let receiverUserName = params.receiverUserName;
        let receiverDeviceId = params.receiverDeviceId;
        let amount = Number.parseInt(params.amount);
        let senderUserName = this.user.userName.get();
        let senderDevice = this.device;
        let token = body.token;
        if (!receiverUserName)
            throw 'Receiver UserName is required';
        let receiver = await this.userService.getByUserName(receiverUserName);
        if (!receiver)
            throw 'Receiver Not Found';
        let receiverDevice = null;
        if (receiverDeviceId) {
            receiverDevice = await this.deviceService.get(receiverDeviceId);
            if (receiverDevice.userId.get() != receiver.id.get())
                throw 'UnAuthorized Device Access';
        }
        let sender = await this.userService.getByUserName(senderUserName);
        return await this.$createTransaction(sender, senderDevice, receiver, receiverDevice, amount, token, body.data);
    }
    async $createTransaction(sender, senderDevice, receiver, receiverDevice, amount, token, data) {
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
        let trContext = await index_1.globalContext.initTransaction();
        try {
            this.userService.context = trContext;
            this.deviceService.context = trContext;
            this.transactionService.context = trContext;
            sender = await this.userService.get(sender.id.get());
            receiver = await this.userService.get(receiver.id.get());
            sender.balance.set(sender.balance.get() - amount);
            receiver.balance.set(receiver.balance.get() + amount);
            senderDevice.lastToken.set(token);
            await this.userService.save(sender);
            await this.userService.save(receiver);
            await this.deviceService.save(senderDevice);
            let transaction = await this.transactionService.save({
                senderId: sender.id.get(),
                senderDeviceId: senderDevice.id.get(),
                receiverId: receiver.id.get(),
                receiverDeviceId: receiverDevice ? receiverDevice.id.get() : null,
                amount: amount,
                status: "PROCESSED",
                data: data
            });
            await trContext.commit();
            return await this.$getTransPxy(transaction);
        }
        catch (err) {
            console.log(err);
            trContext.rollback();
            throw 'Tranfer Failed';
        }
    }
}
exports.default = Pay;
//# sourceMappingURL=Pay.js.map