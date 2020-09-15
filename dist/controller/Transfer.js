"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const UserService_1 = require("../Service/UserService");
const TransactionService_1 = require("../Service/TransactionService");
const index_1 = require("../index");
let userService = new UserService_1.default();
let transactionService = new TransactionService_1.default();
let router = express.Router();
router.get('/', async (req, res, next) => {
    try {
        let param = req.query || req.params;
        let userName = param.userName;
        let amount = Number.parseFloat(param.amount);
        amount = Number.parseInt((amount * 100).toFixed(2));
        if (!(userName && typeof userName == 'string'))
            throw 'Receiver Username is required';
        let receiver = await userService.getByUserName(userName);
        if (!receiver)
            throw 'Receiver Not Found';
        if (!amount || amount <= 0)
            throw 'Invalid Amount';
        let transaction = await transactionService.save({
            receiverId: receiver.id.get(),
            amount: amount,
            status: "INITIATED"
        });
        res.render('transfer', {
            transactionId: transaction.id.get(),
            userName: receiver.userName.get(),
            fullName: receiver.firstName.get() + ' ' + receiver.lastName.get(),
            amount: amount
        });
    }
    catch (err) {
        res.status(400).send(err);
    }
});
router.post('/', async (req, res, next) => {
    let body = req.body;
    let transactionId = Number.parseInt(body.transactionId);
    let userName = body.userName;
    let password = body.password;
    let trContext = null;
    try {
        if (!(userName && typeof userName == 'string'))
            throw 'Username is required';
        if (!(password && typeof password == 'string'))
            throw 'Password is required';
        let sender = await userService.getByUserName(userName);
        if (!sender)
            throw 'User Not Found';
        if (sender.password.get() !== password)
            throw 'Invalid Password';
        if (!(transactionId && typeof transactionId == 'number'))
            throw 'Invalid Transaction id';
        trContext = await index_1.globalContext.initTransaction();
        userService.context = trContext;
        transactionService.context = trContext;
        let transaction = await transactionService.get(transactionId);
        if (transaction.status.get() == TransactionService_1.TransactionStatus.PROCESSED)
            throw 'Transaction Already Processed';
        sender = await userService.get(sender.id.get());
        let receiver = await userService.get(transaction.receiverId.get());
        if (sender.balance.get() < transaction.amount.get())
            throw 'Sender InSufficient Balance';
        sender.balance.set(sender.balance.get() - transaction.amount.get());
        receiver.balance.set(receiver.balance.get() + transaction.amount.get());
        transaction.senderId.set(sender.id.get());
        transaction.status.set(TransactionService_1.TransactionStatus.PROCESSED);
        await userService.save(sender);
        await userService.save(receiver);
        transaction = await transactionService.save(transaction);
        await trContext.commit();
        res.json({
            transactionId: transaction.id.get(),
            amount: transaction.amount.get()
        });
    }
    catch (err) {
        console.log(err);
        if (trContext) {
            await trContext.rollback();
        }
        res.status(400).send(err);
    }
});
index_1.app.use('/transfer', router);
//# sourceMappingURL=Transfer.js.map