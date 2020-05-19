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
const express = require("express");
const UserService_1 = require("../Service/UserService");
const TransactionService_1 = require("../Service/TransactionService");
const index_1 = require("../index");
let userService = new UserService_1.default();
let transactionService = new TransactionService_1.default();
let router = express.Router();
router.get('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let param = req.query || req.params;
        let userName = param.userName;
        let amount = Number.parseFloat(param.amount);
        amount = Number.parseInt((amount * 100).toFixed(2));
        if (!(userName && typeof userName == 'string'))
            throw 'Receiver Username is required';
        let receiver = yield userService.getByUserName(userName);
        if (!receiver)
            throw 'Receiver Not Found';
        if (!amount || amount <= 0)
            throw 'Invalid Amount';
        let transaction = yield transactionService.save({
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
}));
router.post('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        let sender = yield userService.getByUserName(userName);
        if (!sender)
            throw 'User Not Found';
        if (sender.password.get() !== password)
            throw 'Invalid Password';
        if (!(transactionId && typeof transactionId == 'number'))
            throw 'Invalid Transaction id';
        trContext = yield index_1.globalContext.initTransaction();
        userService.context = trContext;
        transactionService.context = trContext;
        let transaction = yield transactionService.get(transactionId);
        if (transaction.status.get() == TransactionService_1.TransactionStatus.PROCESSED)
            throw 'Transaction Already Processed';
        sender = yield userService.get(sender.id.get());
        let receiver = yield userService.get(transaction.receiverId.get());
        if (sender.balance.get() < transaction.amount.get())
            throw 'Sender InSufficient Balance';
        sender.balance.set(sender.balance.get() - transaction.amount.get());
        receiver.balance.set(receiver.balance.get() + transaction.amount.get());
        transaction.senderId.set(sender.id.get());
        transaction.status.set(TransactionService_1.TransactionStatus.PROCESSED);
        yield userService.save(sender);
        yield userService.save(receiver);
        transaction = yield transactionService.save(transaction);
        yield trContext.commit();
        res.json({
            transactionId: transaction.id.get(),
            amount: transaction.amount.get()
        });
    }
    catch (err) {
        console.log(err);
        if (trContext) {
            yield trContext.rollback();
        }
        res.status(400).send(err);
    }
}));
index_1.app.use('/transfer', router);
