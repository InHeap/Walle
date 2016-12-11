import * as es from 'es-controller';
import * as entity from "es-entity";
import * as rq from 'request-promise-native';


import User from '../Model/User';
import UserService from "../Service/UserService";

export default class Topup extends es.Controller {
	user: User = null;
	userService: UserService = new UserService();

	$init() {
		let request = this.$get('request');
		if (request.user) {
			this.user = request.user;
		}
	}

	async post(params, body) {
		let id = params.id;
		let amount = body.amount;
		let key = 'rzp_test_BJD78hX868UODl';
		let secret = 'LvNUnyzFO9tuDqadpQrdYr2o';
		try {
			let q = await rq({
				method: 'POST',
				url: 'https://' + key + ':' + secret + '@api.razorpay.com/v1/payments/' + id + '/capture',
				form: {
					amount: amount
				}
			});
			console.log(q);
		} catch (error) {
			console.log(error);
		}
	}

}