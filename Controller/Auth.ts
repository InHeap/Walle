import * as random from 'randomstring';
import * as es from 'es-controller';
import * as entity from "es-entity";
import * as crypto from 'crypto';

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

		let av = await this.check({ userName: model.userName })
		if (!av.available)
			throw 'Duplicate User';

		// TODO: Check phoneno
		if (model.phoneNo) {
			var str = "The best things in life are free";
			var patt = new RegExp("e");
			var res = patt.test(str);
		}

		let user = await this.userService.save(model);
		return true;
	}

	async check(params) {
		let userName = params.userName;
		let available = false;

		if (!(userName && typeof userName == 'string'))
			available = false;

		let u = await this.userService.getByUserName(userName);
		available = u ? false : true;

		return {
			available: available
		};
	}

	async login(params, model) {
		let userName = model.userName;
		let passKey = model.passKey;
		let deviceId = Number.parseInt(model.deviceId);
		let platform: string = model.platform;

		if (!(userName && typeof userName == 'string'))
			throw 'Invalid UserName'

		if (!(passKey && typeof passKey == 'string'))
			throw 'Invalid Password';

		let user = await this.userService.getByUserName(userName);
		if (!user)
			throw 'User not found';

		let hash = crypto.createHash('sha256');
		let currDate = new Date();
		let passText = `:${user.password.get()}:${currDate.getDate()}:${currDate.getMonth()}:${currDate.getFullYear()}:`;
		hash.update(passText);
		let passHash = hash.digest('base64');

		if (passHash !== passKey)
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
		let request = this.$get('request');
		let user = request.user;
		let device = request.device;

		// Reset device expire time
		device.secret.set(random.generate());
		device.expireAt.set(new Date().getTime());	// Device Secret valid for 1 hour
		await this.deviceService.save(device);

		// Set user token expity as now
		return {
			response: "success"
		};
	}

}