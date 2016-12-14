// Payment Gateway Transfer Controller for recharging users balance

import * as es from 'es-controller';
import * as entity from "es-entity";
import * as request from 'request-promise-native';

import User from '../Model/User';
import UserService from "../Service/UserService";
import Device from '../Model/Device';
import TransactionService from '../Service/TransactionService';

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

export default class Transfer extends es.Controller {
	userService: UserService = new UserService();
	transactionService: TransactionService = new TransactionService();
	key = 'rzp_test_BJD78hX868UODl';
	secret = 'LvNUnyzFO9tuDqadpQrdYr2o';

	$init() {
	}

	async get(param) {
		let userName: string = param.userName;
		let amount = Number.parseInt(param.amount);

		let user = await this.userService.getByUserName(userName);

		if (!amount && amount <= 0)
			throw 'Invalid Amount';

		return this.$view({
			key: this.key,
			userName: userName,
			fullName: user.firstName.get() + ' ' + user.lastName.get(),
			amount: amount
		});
	}

	async post(param, model) {
		let razorpayPaymentId = model.razorpay_payment_id;
		let amount = Number.parseInt(model.amount);
		let userName: string = model.userName;

		let sender: User = null;	// Main Account
		let senderDevice: Device = null;
		let receiver = await this.userService.getByUserName(userName);
		let receiverDevice: Device = null;

		try {
			let q: RazorPayResult = await request({
				method: 'POST',
				url: 'https://' + this.key + ':' + this.secret + '@api.razorpay.com/v1/payments/' + razorpayPaymentId + '/capture',
				form: {
					amount: amount
				}
			});

			sender.balance.set(sender.balance.get() - (q.amount - q.fee));
			receiver.balance.set(receiver.balance.get() + q.amount);

			await this.userService.save(sender);
			await this.userService.save(receiver);

			// Save Transacion
			let transaction = await this.transactionService.save({
				senderId: sender.id.get(),
				senderDeviceId: senderDevice.id.get(),
				receiverId: receiver.id.get(),
				receiverDeviceId: receiverDevice ? receiverDevice.id.get() : null,
				amount: amount,
				status: "PROCESSED"
			});

		} catch (error) {
			console.log(error);
		}
	}

}