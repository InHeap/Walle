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
const Transaction_1 = require("../Model/Transaction");
var transactionPropertyTrans = new entity.Util.PropertyTransformer();
transactionPropertyTrans.fields.push('email', 'firstName', 'lastName');
class DeviceService {
    constructor() {
    }
    copyProperties(transaction, entity) {
        transaction = transactionPropertyTrans.assignEntity(transaction, entity);
        return transaction;
    }
    get(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield index_1.context.transactions.where((d) => {
                return d.id.eq(id);
            }).unique();
        });
    }
    save(model) {
        return __awaiter(this, void 0, void 0, function* () {
            let transaction = null;
            if (model instanceof Transaction_1.default) {
                transaction = model;
            }
            else if (model.id) {
                transaction = yield index_1.context.transactions.get(model.id);
                transaction = this.copyProperties(transaction, model);
            }
            else {
                transaction = index_1.context.transactions.getEntity();
                transaction = this.copyProperties(transaction, model);
            }
            transaction = yield index_1.context.transactions.insertOrUpdate(transaction);
            return transaction;
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            let transaction = yield index_1.context.transactions.where((a) => {
                return a.id.eq(id);
            }).unique();
            yield index_1.context.transactions.delete(transaction);
        });
    }
    list(params) {
        return __awaiter(this, void 0, void 0, function* () {
            let criteria = this.getExpression(params);
            return yield index_1.context.transactions.where(criteria).list();
        });
    }
    single(params) {
        return __awaiter(this, void 0, void 0, function* () {
            let criteria = this.getExpression(params);
            return yield index_1.context.transactions.where(criteria).unique();
        });
    }
    getExpression(params) {
        if (params) {
            let e = index_1.context.transactions.getEntity();
            let c = index_1.context.getCriteria();
            return c;
        }
        else {
            throw 'No Parameter Found';
        }
    }
    getUserTransactions(params) {
        return __awaiter(this, void 0, void 0, function* () {
            let e = index_1.context.transactions.getEntity();
            let c = index_1.context.getCriteria();
            if (params.userId) {
                c.add(e.senderId.eq(params.userId).or(e.receiverId.eq(params.userId)));
            }
            if (params.fromDate) {
                c.add(e.crtdAt.gt(params.fromDate));
            }
            if (params.toDate) {
                c.add(e.crtdAt.lteq(params.toDate));
            }
            let q = index_1.context.transactions.where(c);
            if (params.index || params.limit) {
                q = q.limit(params.limit, params.index);
            }
            return yield q.list();
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DeviceService;
