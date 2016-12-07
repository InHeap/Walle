import * as es from 'es-controller';
import * as entity from "es-entity";

import User from '../Model/User';
import DeviceService from "../Service/DeviceService";
import AuthFilter from '../AuthFilter';

export default class Device extends es.Controller {
	user: User = null;
	deviceService: DeviceService = new DeviceService();

	$init() {
		let request = this.$get('request');
		if (request.user) {
			this.user = request.user;
		}
	}

	async get(params: any): Promise<any> {
		if (params.id) {
			let deviceId = params.id;
			let device = await this.deviceService.get(deviceId);
			if (device.userId.get() !== this.user.id.get())
				throw 'Anauthorized Access';
			return device;
		} else {
			let devices = await this.deviceService.list({ userId: this.user.id.get() });
			return devices;
		}
	}

	async post(params, model) {
		if (model.id && model.userId) {
			let device = await this.deviceService.get(model.id);
			if (device.userId.get() !== this.user.id.get())
				throw 'Anauthorized Access';
		}
		model.userId = this.user.id.get();
		return await this.deviceService.save(model);
	}

	async delete(params) {
		let deviceId = params.id;
		let device = await this.deviceService.get(deviceId);
		if (device.userId.get() !== this.user.id.get())
			throw 'Anauthorized Access';
		device.active.set(false);
		this.deviceService.save(device);
	}

}