"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
let transferUrl = 'http://localhost:3003/money/push';
let router = express.Router();
router.get('/push', async (req, res, next) => {
    try {
        let param = req.query || req.params;
        let userName = param.userName;
        let amount = Number.parseInt(param.amount);
        let user = await userService.getByUserName(userName);
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
});
router.post('/push', async (req, res, next) => {
    let model = req.body;
    let razorpayPaymentId = model.razorpay_payment_id;
    let amount = Number.parseInt(model.amount);
    let userName = model.userName;
    let sender = await userService.getByUserName('main');
    let senderDevice = await deviceService.get(1);
    let receiver = await userService.getByUserName(userName);
    let receiverDevice = null;
    let trContext = null;
    try {
        if (!amount || amount <= 0)
            throw 'Invalid Amount';
        let q = JSON.parse(await request({
            method: 'POST',
            url: 'https://' + key + ':' + secret + '@api.razorpay.com/v1/payments/' + razorpayPaymentId + '/capture',
            form: {
                amount: amount
            }
        }));
        trContext = await index_1.globalContext.initTransaction();
        userService.context = trContext;
        transactionService.context = trContext;
        sender = await userService.get(sender.id.get());
        receiver = await userService.get(receiver.id.get());
        if (sender.balance.get() < amount)
            throw 'Sender InSufficient Balance';
        sender.balance.set(sender.balance.get() - (q.amount - q.fee));
        receiver.balance.set(receiver.balance.get() + q.amount);
        await userService.save(sender);
        await userService.save(receiver);
        let transaction = await transactionService.save({
            senderId: sender.id.get(),
            senderDeviceId: senderDevice.id.get(),
            receiverId: receiver.id.get(),
            receiverDeviceId: null,
            amount: amount,
            status: "PROCESSED"
        });
        await trContext.commit();
        res.send("Success");
    }
    catch (err) {
        console.log(err);
        if (trContext) {
            await trContext.rollback();
        }
        next(err);
    }
});
router.get('/pull', async (req, res, next) => {
});
router.post('/pull', async (req, res, next) => {
});
index_1.app.use('/money', router);
//# sourceMappingURL=Money.js.map