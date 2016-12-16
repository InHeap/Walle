"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const express = require("express");
const request = require("request-promise-native");
const UserService_1 = require("../Service/UserService");
const TransactionService_1 = require("../Service/TransactionService");
const DeviceService_1 = require("../Service/DeviceService");
const index_1 = require("../index");
let userService = new UserService_1.default();
let deviceService = new DeviceService_1.default();
let transactionService = new TransactionService_1.default();
let key = 'rzp_test_BJD78hX868UODl';
let secret = 'LvNUnyzFO9tuDqadpQrdYr2o';
let transferUrl = 'http://localhost:3003/transfer';
let router = express.Router();
router.get('/', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        let param = req.query || req.params;
        let userName = param.userName;
        let amount = Number.parseInt(param.amount);
        let user = yield userService.getByUserName(userName);
        if (!amount || amount <= 0)
            throw 'Invalid Amount';
        res.render('addMoney', {
            key: key,
            transferUrl: transferUrl,
            userName: userName,
            fullName: user.firstName.get() + ' ' + user.lastName.get(),
            amount: amount
        });
    }
    catch (err) {
        next(err);
    }
}));
router.post('/', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    let model = req.body;
    let razorpayPaymentId = model.razorpay_payment_id;
    let amount = Number.parseInt(model.amount);
    let userName = model.userName;
    let sender = yield userService.getByUserName('main');
    let senderDevice = yield deviceService.get(1);
    let receiver = yield userService.getByUserName(userName);
    let receiverDevice = null;
    let trContext = null;
    try {
        if (!amount || amount <= 0)
            throw 'Invalid Amount';
        let q = JSON.parse(yield request({
            method: 'POST',
            url: 'https://' + key + ':' + secret + '@api.razorpay.com/v1/payments/' + razorpayPaymentId + '/capture',
            form: {
                amount: amount
            }
        }));
        trContext = yield index_1.globalContext.initTransaction();
        userService.context = trContext;
        transactionService.context = trContext;
        sender = yield userService.get(sender.id.get());
        receiver = yield userService.get(receiver.id.get());
        sender.balance.set(sender.balance.get() - (q.amount - q.fee));
        receiver.balance.set(receiver.balance.get() + q.amount);
        yield userService.save(sender);
        yield userService.save(receiver);
        let transaction = yield transactionService.save({
            senderId: sender.id.get(),
            senderDeviceId: senderDevice.id.get(),
            receiverId: receiver.id.get(),
            receiverDeviceId: senderDevice.id.get(),
            amount: amount,
            status: "PROCESSED"
        });
        yield trContext.commit();
        res.send("Success");
    }
    catch (err) {
        console.log(err);
        if (trContext) {
            yield trContext.rollback();
        }
        next(err);
    }
}));
index_1.app.use('/addMoney', router);
