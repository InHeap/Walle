import * as entity from "es-entity";
import { context } from "../index";
import DbContext from "../Model/DbContext";
import User from '../Model/User';
import Device from '../Model/Device';

export enum DevicePlatform {
	DEFAULT,
	WEB,
	ANDROID,
	IOS
}

export default class DeviceService {

	copyProperties(device: Device, model: any): Device {
		device.name.set(model.name);
		device.payable.set(model.payable);
		device.platform.set(model.platform);
		return device;
	}

	async get(id: number): Promise<Device> {
		return await context.devices.where((d) => {
			return d.id.eq(id);
		}).unique();
	}

	async save(model): Promise<Device> {
		let device: Device = null
		if (model instanceof Device) {
			device = model;
		} else if (model.id) {
			device = await context.devices.get(model.id);
			device = this.copyProperties(device, model);
		} else {
			device = context.devices.getEntity();
			device = this.copyProperties(device, model);
			device.userId.set(model.userId);
		}
		if (model.platform) {
			device.platform.set(DevicePlatform[<string>model.platform]);
		}
		device = await context.devices.insertOrUpdate(device);
		return device;
	}

	async delete(id: number) {
		let device: Device = await context.devices.where((a) => {
			return a.id.eq(id);
		}).unique();
		await context.devices.delete(device);
	}

	async list(params): Promise<Array<Device>> {
		let criteria = this.getExpression(params);
		return await context.devices.where(criteria).list();
	}

	async single(params): Promise<Device> {
		let criteria = this.getExpression(params);
		return await context.devices.where(criteria).unique();
	}

	getExpression(params) {
		if (params) {
			let e = context.devices.getEntity();
			let c = context.getCriteria();
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