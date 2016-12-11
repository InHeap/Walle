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
		return {
			userName: user.userName.get(),
			firstName: user.firstName.get(),
			lastName: user.lastName.get(),
			email: user.email.get(),
			phoneNo: user.phoneNo.get(),
			balance: user.balance.get()
		};
	}

	async post(params, entity) {
		entity.id = this.userId;
		await this.userService.save(entity);
		return await this.get(params);
	}

}