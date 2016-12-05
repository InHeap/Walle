import * as random from 'randomstring';
import * as es from 'es-controller';
import * as entity from "es-entity";

import UserService from "../Service/UserService";
import User from '../Model/User';
import Device from '../Model/Device';
import DeviceService from '../Service/DeviceService';

export default class Auth extends es.Controller {
	userService: UserService = new UserService();
	deviceService: DeviceService = new DeviceService();

	$init() {
		let request = this.$get('request');
	}

	async register(params, model) {
		if (!model.userName)
			throw 'Blank UserName'

		if (!model.password)
			throw 'Blank Password';

		if (!await this.check({ userName: model.userName }))
			throw 'Duplicate User';

		let user = await this.userService.save(model);
	}

	async check(params) {
		let u = await this.userService.getByUserName(params.userName);
		return u ? false : true;
	}

	async login(params, model) {
		if (!model.userName)
			throw 'Blank UserName'

		if (!model.password)
			throw 'Blank Password';

		let user = await this.userService.getByUserName(params.userName);

		if (!user)
			throw 'User not found';

		if (user.password.get() !== model.password)
			throw 'Invalid Username or Password';

		// Generate Token and set token expiry as now + 1hr
		user.accessToken.set(random.generate());
		user.expireAt.set(new Date(new Date().getTime() + 3600000));
		this.userService.save(user);

		// Check for device id and if not then create
		let device: Device = null;
		if (model.deviceId) {
			device = await this.deviceService.get(model.deviceId);
		} else {
			device = await this.deviceService.save({
				userId: user.id.get(),
				payable: true
			});
		}
		// Reset device expire time
		device.secret.set(random.generate());
		device.expireAt.set(new Date(new Date().getTime() + (7 * 24 * 3600 * 1000)));
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

}