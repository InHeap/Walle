"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const es = require("es-controller");
const rq = require("request-promise-native");
const UserService_1 = require("../Service/UserService");
class Topup extends es.Controller {
    constructor() {
        super(...arguments);
        this.user = null;
        this.userService = new UserService_1.default();
    }
    $init() {
        let request = this.$get('request');
        if (request.user) {
            this.user = request.user;
        }
    }
    post(params, body) {
        return __awaiter(this, void 0, void 0, function* () {
            let id = params.id;
            let amount = body.amount;
            let key = 'rzp_test_BJD78hX868UODl';
            let secret = 'LvNUnyzFO9tuDqadpQrdYr2o';
            try {
                let q = yield rq({
                    method: 'POST',
                    url: 'https://' + key + ':' + secret + '@api.razorpay.com/v1/payments/' + id + '/capture',
                    form: {
                        amount: amount
                    }
                });
                console.log(q);
            }
            catch (error) {
                console.log(error);
            }
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Topup;
