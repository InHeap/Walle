import * as es from 'es-controller';
import * as entity from "es-entity";
import UserService from "../Service/UserService";
import AuthFilter from '../AuthFilter';

export default class User extends es.Controller {
	userId: number = 0;
	userService: UserService = null;

	$init() {
		this.userService = new UserService();
		let request = this.$get('request');
		if (request.user) {
			this.userId = request.user.id;
		}
		this.filters.push(AuthFilter);
	}

	async get(params: any) {
		return await this.userService.get(this.userId);
	}

	async post(params, entity) {
		entity.id = this.userId;
		return await this.userService.save(entity);
	}

}