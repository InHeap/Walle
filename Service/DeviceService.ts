import * as entity from "es-entity";
import { context } from "../index";
import DbContext from "../Model/DbContext";
import User from '../Model/User';
import Device from '../Model/Device';

var devicePropertyTrans = new entity.Util.PropertyTransformer();
devicePropertyTrans.fields.push('name', 'description', 'payable');

export default class DeviceService {

	constructor() {
	}

	copyProperties(device: Device, entity: any): Device {
		device = devicePropertyTrans.assignEntity(device, entity);
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
			return c;
		} else {
			throw 'No Parameter Found';
		}
	}

}