import * as crypto from 'crypto';
import * as es from 'es-controller';
import * as entity from "es-entity";

import User from '../Model/User';
import UserService from "../Service/UserService";
import DeviceService from '../Service/DeviceService';
import Transaction from '../Model/Transaction';
import TransactionService from '../Service/TransactionService';
import AuthFilter from '../AuthFilter';

export default class Pay extends es.Controller {
	user: User = null;
	userService: UserService = new UserService();
	deviceService: DeviceService = new DeviceService();
	transactionService: TransactionService = new TransactionService();

	$init() {
		let request = this.$get('request');
		if (request.user) {
			this.user = request.user;
		}
	}

	async post(params, body) {
		let senderUserName: string = body.senderUserName;
		let senderDeviceId = body.senderDeviceId;
		let receiverUserName: string = body.receiverUserName;
		let amount: number = body.amount;
		let token: string = body.token;

		if (!receiverUserName)
			throw 'Receiver UserName is required';

		if (!senderUserName)
			throw 'Sender UserName is required';

		if (receiverUserName != this.user.userName.get())
			throw 'Invalid Receiver Id';

		let sender = await this.userService.getByUserName(senderUserName);
		if (!sender)
			throw 'Sender Not Found';

		let receiver = await this.userService.getByUserName(receiverUserName);
		if (!receiver)
			throw 'Receiver Not Found';

		if (!senderDeviceId)
			throw 'Sender Device Id is required'

		let senderDevice = await this.deviceService.get(senderDeviceId);
		if (!senderDevice)
			throw 'Invalid Sender Device';

		if (senderDevice.userId != sender.id)
			throw 'Invalid Sender Device';

		if (senderDevice.expireAt.get().getTime() < new Date().getTime())
			throw 'Sender Device Expired';

		let currentMinute = new Date().getTime() / (1000 * 60);
		let text = ':' + senderUserName + ':' + senderDeviceId + ':' + receiverUserName + ':' + amount.toFixed(2) + ':' + currentMinute.toString() + ':';

		let hmac = crypto.createHmac('sha256', senderDevice.secret.get());
		hmac.update(text);
		let computedHmac = hmac.digest('base64');

		if (token !== computedHmac)
			throw 'Invalid Token';

		if (sender.balance.get() < amount)
			throw 'Sender InSufficient Balance';

		sender.balance.set(sender.balance.get() - amount);
		receiver.balance.set(receiver.balance.get() + amount);

		await this.userService.save(sender);
		await this.userService.save(receiver);

		// Save Transacion
		await this.transactionService.save({
			senderId: sender.id.get(),
			senderDeviceId: senderDeviceId,
			receiverId: receiver.id.get(),
			receiverDeviceId: null,
			amount: amount,
			title: body.title,
			description: body.description
		});
	}

}