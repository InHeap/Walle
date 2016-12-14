import * as random from 'randomstring';
import * as es from 'es-controller';
import * as entity from "es-entity";

import UserService from "../Service/UserService";
import User from '../Model/User';
import Device from '../Model/Device';
import DeviceService, { DevicePlatform } from '../Service/DeviceService';

export default class Auth extends es.Controller {
	userService: UserService = new UserService();
	deviceService: DeviceService = new DeviceService();

	$init() {
		let request = this.$get('request');
	}

	async register(params, model) {
		if (!(model.userName && typeof model.userName == 'string'))
			throw 'Invalid UserName'

		if ((<string>model.userName).length > 25)
			throw 'UserName should be less then 16 characters';

		if (!(model.password && typeof model.password == 'string'))
			throw 'Blank Password';

		if ((<string>model.password).length > 25)
			throw 'Password should be less then 16 characters';

		if (!await this.check({ userName: model.userName }))
			throw 'Duplicate User';

		// TODO: Check phoneno
		if (model.phoneNo) {
		}

		let user = await this.userService.save(model);
		return true;
	}

	async check(params) {
		let userName = params.userName;

		if (!(userName && typeof userName == 'string'))
			return false;

		let u = await this.userService.getByUserName(userName);
		return u ? false : true;
	}

	async login(params, model) {
		let userName = model.userName;
		let password = model.password;
		let deviceId = Number.parseInt(model.deviceId);
		let platform: string = model.platform;

		if (!(userName && typeof userName == 'string'))
			throw 'Invalid UserName'

		if (!(password && typeof password == 'string'))
			throw 'Invalid Password';

		let user = await this.userService.getByUserName(userName);
		if (!user)
			throw 'User not found';

		if (user.password.get() !== password)
			throw 'Invalid Username or Password';

		if (platform) {
			if (!(typeof platform == 'string' && DevicePlatform[platform]))
				throw 'Invalid Platform';
		} else {
			platform = 'DEFAULT';
		}

		// Generate Token and set token expiry as now + 1hr
		user.accessToken.set(random.generate());
		user.expireAt.set(new Date(new Date().getTime() + 3600000));
		this.userService.save(user);

		// Check for device id and if not then create
		let device: Device = null;
		if (deviceId) {
			device = await this.deviceService.get(deviceId);
			if (device.active.get() !== true)
				throw 'Device Inactive';
		} else if (DevicePlatform[platform] == DevicePlatform.WEB) {
			device = await this.deviceService.single({
				userId: user.id.get(),
				platform: platform,
				active: true
			});
		}
		if (!device) {
			device = await this.deviceService.save({
				userId: user.id.get(),
				platform: platform,
				payable: true
			});
		}

		// Reset device expire time
		device.secret.set(random.generate());
		if (DevicePlatform[<string>model.platform] == DevicePlatform.WEB) {
			device.expireAt.set(new Date(new Date().getTime() + (3600 * 1000)));	// Device Secret valid for 1 hour
		} else {
			device.expireAt.set(new Date(new Date().getTime() + (7 * 24 * 3600 * 1000)));	// Device Secret valid for 7 days
		}

		this.deviceService.save(device);

		return {
			userName: user.userName.get(),
			token: user.accessToken.get(),
			deviceId: device.id.get(),
			deviceSecret: device.secret.get()
		}
	}

	async logout(params, model) {
		let user = await this.userService.getByUserName(model.userName);
		if (!user)
			throw 'User Not Found';

		// Set user token expity as now
	}

	async pay(params, model) {
		let callbackUrl = model.callbackUrl;
		let receiverUsername = model.receiverUsername;
		let amount = Number.parseInt(model.amount);

		if (!(callbackUrl && typeof callbackUrl == 'string'))
			throw 'Invalid Callback Url';

		if (!(receiverUsername && typeof receiverUsername == 'string'))
			throw 'Receiver Username is required';

		if (!(amount && amount <= 0))
			throw 'Invalid Amount';

		let receiver = await this.userService.getByUserName(receiverUsername);
		if (!receiver)
			throw 'Receiver Not Found';

		return this.$view({
			callbackUrl: callbackUrl,
			receiverUsername: receiver.userName.get(),
			amount: amount
		});
	}

}