// Payment Gateway Transfer Controller for recharging users balance

import * as express from 'express';
import * as es from 'es-controller';
import * as entity from "es-entity";
import * as request from 'request-promise-native';

import User from '../Model/User';
import UserService from "../Service/UserService";
import Device from '../Model/Device';
import TransactionService from '../Service/TransactionService';
import DeviceService from '../Service/DeviceService';
import { globalContext, app } from "../index";

interface RazorPayResult {
	id: string;
	entity: string;
	amount: number;
	currency: string;
	status: string;
	amount_refunded: number;
	refund_status: string;
	email: string;
	contact: string;
	error_code: string;
	error_description: string;
	notes: any;
	created_at: number;
	fee: number;
}

let userService: UserService = new UserService();
let deviceService: DeviceService = new DeviceService();
let transactionService: TransactionService = new TransactionService();
let key = 'rzp_test_BJD78hX868UODl';
let secret = 'LvNUnyzFO9tuDqadpQrdYr2o';
let transferUrl = 'http://localhost:3003/transfer';

let router = express.Router();

router.get('/', async (req, res, next) => {
	try {
		let param = req.query || req.params;
		let userName: string = param.userName;
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
	} catch (err) {
		next(err);
	}
});

router.post('/', async (req, res, next) => {
	let model = req.body;
	let razorpayPaymentId = model.razorpay_payment_id;
	let amount = Number.parseInt(model.amount);
	let userName: string = model.userName;

	let sender: User = await userService.getByUserName('main');	// Main Account
	let senderDevice: Device = await deviceService.get(1);
	let receiver = await userService.getByUserName(userName);
	let receiverDevice: Device = null;

	let trContext = null;
	try {
		if (!amount || amount <= 0)
			throw 'Invalid Amount';

		let q: RazorPayResult = JSON.parse(await request({
			method: 'POST',
			url: 'https://' + key + ':' + secret + '@api.razorpay.com/v1/payments/' + razorpayPaymentId + '/capture',
			form: {
				amount: amount
			}
		}));

		trContext = await globalContext.initTransaction();
		userService.context = trContext;
		transactionService.context = trContext;

		sender = await userService.get(sender.id.get());
		receiver = await userService.get(receiver.id.get());

		sender.balance.set(sender.balance.get() - (q.amount - q.fee));
		receiver.balance.set(receiver.balance.get() + q.amount);

		await userService.save(sender);
		await userService.save(receiver);

		// Save Transacion
		let transaction = await transactionService.save({
			senderId: sender.id.get(),
			senderDeviceId: senderDevice.id.get(),
			receiverId: receiver.id.get(),
			receiverDeviceId: senderDevice.id.get(),
			amount: amount,
			status: "PROCESSED"
		});
		await trContext.commit();
		
		res.send("Success");
	} catch (err) {
		console.log(err);
		if (trContext) {
			await trContext.rollback();
		}
		next(err);
	}
});

app.use('/addMoney', router);