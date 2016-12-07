import * as es from 'es-controller';
import * as entity from "es-entity";
import UserService from "../Service/UserService";
import AuthFilter from '../AuthFilter';

export default class User extends es.Controller {
	userId: number = 0;
	userService: UserService = new UserService();
	
	$init() {
		let request = this.$get('request');
		if (request.user) {
			this.userId = request.user.id.get();
		}
	}

	async get(params: any) {
		let user = await this.userService.get(this.userId);
		return user;
	}

	async post(params, entity) {
		entity.id = this.userId;
		return await this.userService.save(entity);
	}

}