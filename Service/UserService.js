"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const es_cache_1 = require("es-cache");
const index_1 = require("../index");
const User_1 = require("../Model/User");
var userCache = new es_cache_1.default({
    valueFunction: function (key) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield index_1.globalContext.users.where((u) => {
                return u.userName.eq(key);
            }).unique();
        });
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
    get(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.context.users.where((u) => {
                return u.id.eq(id);
            }).unique();
        });
    }
    getByUserName(userName) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield userCache.get(userName);
        });
    }
    save(model) {
        return __awaiter(this, void 0, void 0, function* () {
            let user = null;
            if (model instanceof User_1.default) {
                user = model;
            }
            else if (model.id) {
                user = yield this.context.users.get(model.id);
                user = this.copyProperties(user, model);
            }
            else {
                user = this.context.users.getEntity();
                user = this.copyProperties(user, model);
                user.userName.set(model.userName);
                user.password.set(model.password);
            }
            user = yield this.context.users.insertOrUpdate(user);
            userCache.del(user.userName.get());
            return user;
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            let user = yield this.context.users.where((a) => {
                return a.id.eq(id);
            }).unique();
            yield this.context.users.delete(user);
        });
    }
}
exports.default = UserService;
