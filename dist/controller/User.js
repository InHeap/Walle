"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const es = require("es-controller");
const UserService_1 = require("../Service/UserService");
class User extends es.Controller {
    constructor() {
        super(...arguments);
        this.userId = 0;
        this.userService = new UserService_1.default();
    }
    $init() {
        let request = this.$get('request');
        if (request.user) {
            this.userId = request.user.id.get();
        }
    }
    async get(params) {
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
exports.default = User;
//# sourceMappingURL=User.js.map