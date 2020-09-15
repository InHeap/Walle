import * as express from 'express';
import * as request from 'request-promise-native';

import User from '../Model/User';
import UserService from "../Service/UserService";
import Device from '../Model/Device';
import TransactionService, { TransactionStatus } from '../Service/TransactionService';
import DeviceService from '../Service/DeviceService';
import { globalContext, app } from "../index";

let userService: UserService = new UserService();
let transactionService: TransactionService = new TransactionService();

let router = express.Router();

//  Web payment api page
router.get('/', async (req, res, next) => {
	try {
		let param = req.query || req.params;
		let userName: string = param.userName;
		let amount = Number.parseFloat(param.amount);

		// Converting Rupees to Paise
		amount = Number.parseInt((amount * 100).toFixed(2));

		if (!(userName && typeof userName == 'string'))
			throw 'Receiver Username is required';

		let receiver = await userService.getByUserName(userName);
		if (!receiver)
			throw 'Receiver Not Found';

		if (!amount || amount <= 0)
			throw 'Invalid Amount';

		// Save Transacion
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
	} catch (err) {
		res.status(400).send(err);
	}
});

router.post('/', async (req, res, next) => {
	let body = req.body;
	let transactionId: number = Number.parseInt(body.transactionId);
	let userName: string = body.userName;
	let password: string = body.password;

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

		trContext = await globalContext.initTransaction();
		userService.context = trContext;
		transactionService.context = trContext;

		let transaction = await transactionService.get(transactionId);
		if (transaction.status.get() == TransactionStatus.PROCESSED)
			throw 'Transaction Already Processed';

		sender = await userService.get(sender.id.get());
		let receiver = await userService.get(transaction.receiverId.get());

		if (sender.balance.get() < transaction.amount.get())
			throw 'Sender InSufficient Balance';

		sender.balance.set(sender.balance.get() - transaction.amount.get());
		receiver.balance.set(receiver.balance.get() + transaction.amount.get());
		transaction.senderId.set(sender.id.get());
		transaction.status.set(TransactionStatus.PROCESSED);

		await userService.save(sender);
		await userService.save(receiver);

		transaction = await transactionService.save(transaction);
		await trContext.commit();

		res.json({
			transactionId: transaction.id.get(),
			amount: transaction.amount.get()
		});
	} catch (err) {
		console.log(err);
		if (trContext) {
			await trContext.rollback();
		}
		res.status(400).send(err);
	}
});

app.use('/transfer', router);
