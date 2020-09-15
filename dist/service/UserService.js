"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const es_cache_1 = require("es-cache");
const index_1 = require("../index");
const User_1 = require("../model/User");
var userCache = new es_cache_1.default({
    valueFunction: async function (key) {
        return await index_1.globalContext.users.where((u) => {
            return u.userName.eq(key);
        }).unique();
    },
    limit: 65536
});
class UserService {
    constructor(context) {
        this.context = null;
        if (context)
            this.context = context;
        else
            this.context = index_1.globalContext;
    }
    copyProperties(user, entity) {
        user.email.set(entity.email);
        user.firstName.set(entity.firstName);
        user.lastName.set(entity.lastName);
        user.phoneNo.set(entity.phoneNo);
        return user;
    }
    async get(id) {
        return await this.context.users.where((u) => {
            return u.id.eq(id);
        }).unique();
    }
    async getByUserName(userName) {
        return await userCache.get(userName);
    }
    async save(model) {
        let user = null;
        if (model instanceof User_1.default) {
            user = model;
        }
        else if (model.id) {
            user = await this.context.users.get(model.id);
            user = this.copyProperties(user, model);
        }
        else {
            user = this.context.users.getEntity();
            user = this.copyProperties(user, model);
            user.userName.set(model.userName);
            user.password.set(model.password);
        }
        user = await this.context.users.insertOrUpdate(user);
        userCache.del(user.userName.get());
        return user;
    }
    async delete(id) {
        let user = await this.context.users.where((a) => {
            return a.id.eq(id);
        }).unique();
        await this.context.users.delete(user);
    }
}
exports.default = UserService;
//# sourceMappingURL=UserService.js.map