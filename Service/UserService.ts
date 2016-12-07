import * as entity from "es-entity";
import { context } from "../index";
import DbContext from "../Model/DbContext";
import User from '../Model/User';

var userPropertyTrans = new entity.Util.PropertyTransformer();
userPropertyTrans.fields.push('email', 'firstName', 'lastName', 'phoneNo');

export default class UserService {

	constructor() {
	}

	copyProperties(user: User, entity: any): User {
		user = userPropertyTrans.assignEntity(user, entity);
		return user;
	}

	async get(id: number): Promise<User> {
		return await context.users.where((u) => {
			return u.id.eq(id);
		}).unique();
	}

	async save(model): Promise<User> {
		let user: User = null;
		if (model instanceof User) {
			user = model;
		} else if (model.id) {
			user = await context.users.get(model.id);
			user = this.copyProperties(user, model);
		} else {
			user = context.users.getEntity();
			user = this.copyProperties(user, model);
			user.userName.set(model.userName);
			user.password.set(model.password);
		}
		user = await context.users.insertOrUpdate(user);
		return user;
	}

	async delete(id: number) {
		let user: User = await context.users.where((a) => {
			return a.id.eq(id);
		}).unique();
		await context.users.delete(user);
	}

	async getByUserName(userName: string): Promise<User> {
		return await context.users.where((u) => {
			return u.userName.eq(userName);
		}).unique();
	}

	async list(params): Promise<Array<User>> {
		let criteria = this.getExpression(params);
		return await context.users.where(criteria).list();
	}

	async single(params): Promise<User> {
		let criteria = this.getExpression(params);
		return await context.users.where(criteria).unique();
	}

	getExpression(params) {
		if (params) {
			let e = context.users.getEntity();
			let c = context.getCriteria();
			if (params.userName) {
				c = c.add(e.userName.eq(params.userName));
			}
			if (params.password) {
				c = c.add(e.password.eq(params.password));
			}
			if (params.accessToken) {
				c = c.add(e.accessToken.eq(params.accessToken));
			}
			return c;
		} else {
			throw 'No Parameter Found';
		}
	}

}