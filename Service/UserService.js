"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const entity = require("es-entity");
const index_1 = require("../index");
const User_1 = require("../Model/User");
var userPropertyTrans = new entity.Util.PropertyTransformer();
userPropertyTrans.fields.push('email', 'firstName', 'lastName', 'phoneNo');
class UserService {
    constructor() {
    }
    copyProperties(user, entity) {
        user = userPropertyTrans.assignEntity(user, entity);
        return user;
    }
    get(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield index_1.context.users.where((u) => {
                return u.id.eq(id);
            }).unique();
        });
    }
    save(model) {
        return __awaiter(this, void 0, void 0, function* () {
            let user = null;
            if (model instanceof User_1.default) {
                user = model;
            }
            else if (model.id) {
                user = yield index_1.context.users.get(model.id);
                user = this.copyProperties(user, model);
            }
            else {
                user = index_1.context.users.getEntity();
                user = this.copyProperties(user, model);
                user.userName.set(model.userName);
                user.password.set(model.password);
            }
            user = yield index_1.context.users.insertOrUpdate(user);
            return user;
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            let user = yield index_1.context.users.where((a) => {
                return a.id.eq(id);
            }).unique();
            yield index_1.context.users.delete(user);
        });
    }
    getByUserName(userName) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield index_1.context.users.where((u) => {
                return u.userName.eq(userName);
            }).unique();
        });
    }
    list(params) {
        return __awaiter(this, void 0, void 0, function* () {
            let criteria = this.getExpression(params);
            return yield index_1.context.users.where(criteria).list();
        });
    }
    single(params) {
        return __awaiter(this, void 0, void 0, function* () {
            let criteria = this.getExpression(params);
            return yield index_1.context.users.where(criteria).unique();
        });
    }
    getExpression(params) {
        if (params) {
            let e = index_1.context.users.getEntity();
            let c = index_1.context.getCriteria();
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
        }
        else {
            throw 'No Parameter Found';
        }
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = UserService;
