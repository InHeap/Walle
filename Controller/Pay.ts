import * as crypto from 'crypto';
import * as es from 'es-controller';
import * as entity from "es-entity";

import User from '../Model/User';
import UserService from "../Service/UserService";
import Device from '../Model/Device';
import DeviceService from '../Service/DeviceService';
import Transaction from '../Model/Transaction';
import TransactionService from '../Service/TransactionService';
import AuthFilter from '../AuthFilter';

export default class Pay extends es.Controller {
	user: User = null;
	device: Device = null;
	userService: UserService = new UserService();
	deviceService: DeviceService = new DeviceService();
	transactionService: TransactionService = new TransactionService();

	$init() {
		let request = this.$get('request');
		this.user = request.user;
		this.device = request.device;
	}

	async get(params) {
		let t = await this.transactionService.get(params.id);
		if (this.user.id.get() !== t.senderId.get() || this.user.id.get() !== t.receiverId.get())
			throw 'UnAuthorized Access';

		let sender = await this.userService.get(t.senderId.get());
		let receiver = await this.userService.get(t.receiverId.get());

		return {
			id: t.id.get(),
			senderUserName: sender.userName.get(),
			receiverUserName: receiver.userName.get(),
			amount: t.amount.get(),
			createdAt: t.crtdAt.get()
		}
	}

	async post(params, body) {
		let senderUserName: string = body.senderUserName;
		let senderDeviceId = body.senderDeviceId;
		let receiverUserName: string = this.user.userName.get();
		let receiverDevice = this.device;
		let amount: number = Number.parseInt(body.amount);
		let token: string = body.token;

		if (!senderUserName)
			throw 'Sender UserName is required';

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

		if (senderDevice.payable.get() !== true)
			throw 'Sender Device not payable';

		if (!amount && amount <= 0)
			throw 'Invalid Amount';

		let currentMinute = (new Date().getTime() / (1000 * 60)).toFixed(0);
		let text = ':' + senderUserName + ':' + senderDeviceId + ':' + receiverUserName + ':' + amount.toString() + ':' + currentMinute + ':';

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
		let transaction = await this.transactionService.save({
			senderId: sender.id.get(),
			senderDeviceId: senderDeviceId,
			receiverId: receiver.id.get(),
			receiverDeviceId: receiverDevice.id.get(),
			amount: amount,
			title: body.title,
			description: body.description
		});

		return {
			id: transaction.id.get(),
			senderUserName: sender.userName.get(),
			receiverUserName: receiver.userName.get(),
			amount: transaction.amount.get(),
			createdAt: transaction.crtdAt.get()
		}
	}

	async put(params, body) {
		let receiverUserName = params.receiverUserName;
		let amount: number = Number.parseInt(params.amount);
		let senderUserName: string = this.user.userName.get();
		let senderDevice = this.device;
		let token: string = body.token;

		if (!receiverUserName)
			throw 'Receiver UserName is required';

		let receiver = await this.userService.getByUserName(receiverUserName);
		if (!receiver)
			throw 'Receiver Not Found';

		if (senderDevice.expireAt.get().getTime() < new Date().getTime())
			throw 'Sender Device Expired';

		if (senderDevice.payable.get() !== true)
			throw 'Sender Device not payable';

		if (!amount && amount <= 0)
			throw 'Invalid Amount';

		let currentMinute = (new Date().getTime() / (1000 * 60)).toFixed(0);
		let text = ':' + senderUserName + ':' + senderDevice.id.get().toString() + ':' + receiverUserName + ':' + amount.toString() + ':' + currentMinute + ':';

		let hmac = crypto.createHmac('sha256', senderDevice.secret.get());
		hmac.update(text);
		let computedHmac = hmac.digest('base64');

		if (token !== computedHmac)
			throw 'Invalid Token';

		let sender = await this.userService.getByUserName(senderUserName);
		if (sender.balance.get() < amount)
			throw 'Sender InSufficient Balance';

		sender.balance.set(sender.balance.get() - amount);
		receiver.balance.set(receiver.balance.get() + amount);

		await this.userService.save(sender);
		await this.userService.save(receiver);

		// Save Transacion
		let transaction = await this.transactionService.save({
			senderId: sender.id.get(),
			senderDeviceId: senderDevice.id.get(),
			receiverId: receiver.id.get(),
			receiverDeviceId: null,
			amount: amount,
			title: body.title,
			description: body.description
		});

		return {
			id: transaction.id.get(),
			senderUserName: sender.userName.get(),
			receiverUserName: receiver.userName.get(),
			amount: transaction.amount.get(),
			createdAt: transaction.crtdAt.get()
		}

	}

}