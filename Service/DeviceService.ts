import * as entity from "es-entity";
import Cache from 'es-cache';

import { globalContext } from "../index";
import DbContext from "../Model/DbContext";
import User from '../Model/User';
import Device from '../Model/Device';

export enum DevicePlatform {
	DEFAULT,
	WEB,
	ANDROID,
	IOS
}

var deviceCache = new Cache({
	valueFunction: async function (id) {
		return await globalContext.devices.where((d) => {
			return d.id.eq(id);
		}).unique();
	},
	limit: 65536
});

export default class DeviceService {
	context: DbContext = null;

	constructor(context?: DbContext) {
		if (context)
			this.context = context;
		else
			this.context = globalContext;
	}

	copyProperties(device: Device, model: any): Device {
		device.name.set(model.name);
		device.payable.set(model.payable);
		device.platform.set(model.platform);
		return device;
	}

	async get(id: number): Promise<Device> {
		return await deviceCache.get(id);
	}

	async save(model): Promise<Device> {
		let device: Device = null
		if (model instanceof Device) {
			device = model;
		} else if (model.id) {
			device = await this.context.devices.get(model.id);
			device = this.copyProperties(device, model);
		} else {
			device = this.context.devices.getEntity();
			device = this.copyProperties(device, model);
			device.userId.set(model.userId);
		}
		if (model.platform) {
			device.platform.set(DevicePlatform[<string>model.platform]);
		}
		device = await this.context.devices.insertOrUpdate(device);
		deviceCache.del(device.id.get());
		return device;
	}

	async delete(id: number) {
		let device: Device = await this.context.devices.where((a) => {
			return a.id.eq(id);
		}).unique();
		await this.context.devices.delete(device);
	}

	async list(params): Promise<Array<Device>> {
		let criteria = this.getExpression(params);
		return await this.context.devices.where(criteria).list();
	}

	async single(params): Promise<Device> {
		let criteria = this.getExpression(params);
		return await this.context.devices.where(criteria).unique();
	}

	getExpression(params) {
		if (params) {
			let e = this.context.devices.getEntity();
			let c = this.context.getCriteria();
			if (params.userId) {
				c = c.add(e.userId.eq(params.userId));
			}
			if (params.platform) {
				c = c.add(e.platform.eq(DevicePlatform[params.platform]));
			}
			if (params.payable) {
				c = c.add(e.payable.eq(params.payable));
			}
			if (params.active) {
				c = c.add(e.active.eq(params.active));
			}
			return c;
		} else {
			throw 'No Parameter Found';
		}
	}

}