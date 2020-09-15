import * as entity from "es-entity";
import Cache from 'es-cache';

import DbContext from "../model/DbContext";
import User from '../model/User';

var userCache = new Cache({
	valueFunction: async function (key) {
		return await globalContext.users.where((u) => {
			return u.userName.eq(key);
		}).unique();
	},
	limit: 65536
});

export default class UserService {
	context: DbContext = null;

	constructor(context?: DbContext) {
		if (context)
			this.context = context;
		else
			this.context = globalContext;
	}

	copyProperties(user: User, entity: any): User {
		user.email.set(entity.email);
		user.firstName.set(entity.firstName);
		user.lastName.set(entity.lastName);
		user.phoneNo.set(entity.phoneNo);
		return user;
	}

	async get(id: number): Promise<User> {
		return await this.context.users.where((u) => {
			return u.id.eq(id);
		}).unique();
	}

	async getByUserName(userName: string): Promise<User> {
		return await userCache.get(userName);
	}

	async save(model): Promise<User> {
		let user: User = null;
		if (model instanceof User) {
			user = model;
		} else if (model.id) {
			user = await this.context.users.get(model.id);
			user = this.copyProperties(user, model);
		} else {
			user = this.context.users.getEntity();
			user = this.copyProperties(user, model);
			user.userName.set(model.userName);
			user.password.set(model.password);
		}
		user = await this.context.users.insertOrUpdate(user);
		userCache.del(user.userName.get());
		return user;
	}

	async delete(id: number) {
		let user: User = await this.context.users.where((a) => {
			return a.id.eq(id);
		}).unique();
		await this.context.users.delete(user);
	}

	/*
	async list(params): Promise<Array<User>> {
		let criteria = this.getExpression(params);
		return await this.context.users.where(criteria).list();
	}

	async single(params): Promise<User> {
		let criteria = this.getExpression(params);
		return await this.context.users.where(criteria).unique();
	}

	getExpression(params) {
		if (params) {
			let e = this.context.users.getEntity();
			let c = this.context.getCriteria();
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
	*/

}