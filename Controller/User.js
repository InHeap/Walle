"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const es = require('es-controller');
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
    get(params) {
        return __awaiter(this, void 0, void 0, function* () {
            let user = yield this.userService.get(this.userId);
            return user;
        });
    }
    post(params, entity) {
        return __awaiter(this, void 0, void 0, function* () {
            entity.id = this.userId;
            return yield this.userService.save(entity);
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = User;
