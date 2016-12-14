import * as crypto from 'crypto';
import * as es from 'es-controller';
import * as entity from "es-entity";
import * as random from 'randomstring';

import User from '../Model/User';
import UserService from "../Service/UserService";
import Device from '../Model/Device';
import DeviceService, { DevicePlatform } from '../Service/DeviceService';
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

	async $getTransPxy(tran: Transaction) {
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
		}
	}

	async get(params) {
		try {
			if (params.id) {
				let t = await this.transactionService.get(params.id);
				if (this.user.id.get() !== t.senderId.get() || this.user.id.get() !== t.receiverId.get())
					throw 'UnAuthorized Access';

				return await this.$getTransPxy(t);
			} else {
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
				transactions.forEach(async t => {
					res.push(await this.$getTransPxy(t));
				});

				return res;
			}
		} catch (error) {
			console.log(error);
			throw 'Invalid Parameter';
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

		return await this.$createTransaction(sender, senderDevice, receiver, receiverDevice, amount, token, body.data);
	}

	async put(params, body) {
		let receiverUserName = params.receiverUserName;
		let receiverDeviceId = params.receiverDeviceId;
		let amount: number = Number.parseInt(params.amount);
		let senderUserName: string = this.user.userName.get();
		let senderDevice = this.device;
		let token: string = body.token;

		if (!receiverUserName)
			throw 'Receiver UserName is required';

		let receiver = await this.userService.getByUserName(receiverUserName);
		if (!receiver)
			throw 'Receiver Not Found';

		let receiverDevice: Device = null;
		if (receiverDeviceId) {
			receiverDevice = await this.deviceService.get(receiverDeviceId);

			if (receiverDevice.userId.get() != receiver.id.get())
				throw 'UnAuthorized Device Access';
		}
		let sender = await this.userService.getByUserName(senderUserName);

		return await this.$createTransaction(sender, senderDevice, receiver, receiverDevice, amount, token, body.data);
	}

	async $createTransaction(sender: User, senderDevice: Device, receiver: User, receiverDevice: Device, amount: number, token: string, data?) {
		if (senderDevice.expireAt.get().getTime() < new Date().getTime())
			throw 'Sender Device Expired';

		if (senderDevice.payable.get() !== true)
			throw 'Sender Device not payable';

		if (!amount && amount <= 0)
			throw 'Invalid Amount';

		let currentMinute = Math.round(new Date().getTime() / (1000 * 60));
		let text = ':' + sender.userName.get() + ':' + senderDevice.id.get().toString() + ':' + receiver.userName.get() + ':' + amount.toString() + ':' + currentMinute.toString() + ':';

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
			senderDeviceId: senderDevice.id.get(),
			receiverId: receiver.id.get(),
			receiverDeviceId: receiverDevice ? receiverDevice.id.get() : null,
			amount: amount,
			status: "PROCESSED",
			data: data
		});

		// Reset device secret if platform is WEB
		if (senderDevice.platform.get() == DevicePlatform.WEB) {
			senderDevice.secret.set(random.generate());
		}

		return await this.$getTransPxy(transaction);
	}

}