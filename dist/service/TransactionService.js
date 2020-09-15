"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionStatus = void 0;
const es_cache_1 = require("es-cache");
const index_1 = require("../index");
const Transaction_1 = require("../model/Transaction");
var TransactionStatus;
(function (TransactionStatus) {
    TransactionStatus[TransactionStatus["INITIATED"] = 0] = "INITIATED";
    TransactionStatus[TransactionStatus["PROCESSED"] = 1] = "PROCESSED";
})(TransactionStatus = exports.TransactionStatus || (exports.TransactionStatus = {}));
var transactionCache = new es_cache_1.default({
    valueFunction: async function (id) {
        return await index_1.globalContext.transactions.where((t) => {
            return t.id.eq(id);
        }).unique();
    },
    limit: 65536
});
var transactionMetaCache = new es_cache_1.default({
    valueFunction: async function (transactionId) {
        return await index_1.globalContext.transactionMetas.where((e) => {
            return e.transactionId.eq(transactionId);
        }).list();
    },
    limit: 65536
});
class TransactionService {
    constructor(context) {
        this.context = null;
        if (context)
            this.context = context;
        else
            this.context = index_1.globalContext;
    }
    copyProperties(transaction, model) {
        if (model.senderId) {
            transaction.senderId.set(model.senderId);
        }
        if (model.senderDeviceId) {
            transaction.senderDeviceId.set(model.senderDeviceId);
        }
        if (model.receiverId) {
            transaction.receiverId.set(model.receiverId);
        }
        if (model.receiverDeviceId) {
            transaction.receiverDeviceId.set(model.receiverDeviceId);
        }
        if (model.amount) {
            transaction.amount.set(model.amount);
        }
        if (model.status) {
            transaction.status.set(TransactionStatus[model.status]);
        }
        return transaction;
    }
    async get(id) {
        return await transactionCache.get(id);
    }
    async save(model) {
        let transaction = null;
        if (model instanceof Transaction_1.default) {
            transaction = model;
        }
        else if (model.id) {
            transaction = await this.context.transactions.get(model.id);
            transaction = this.copyProperties(transaction, model);
        }
        else {
            transaction = this.context.transactions.getEntity();
            transaction = this.copyProperties(transaction, model);
        }
        transaction = await this.context.transactions.insertOrUpdate(transaction);
        transactionCache.del(transaction.id.get());
        if (model.data) {
            let keys = Reflect.ownKeys(model.data);
            keys.forEach((key) => {
                let value = Reflect.get(model.data, key);
                if (!(value && typeof value == 'string'))
                    throw 'Invalid Transaction Metadata for key: ' + key.toString();
                let tm = this.context.transactionMetas.getEntity();
                tm.transactionId.set(transaction.id.get());
                tm.key.set(key.toString());
                tm.value.set(value);
                this.context.transactionMetas.insertOrUpdate(tm);
                transactionMetaCache.del(tm.transactionId.get());
            });
        }
        return transaction;
    }
    async list(params) {
        let criteria = this.getExpression(params);
        return await this.context.transactions.where(criteria).list();
    }
    async single(params) {
        let criteria = this.getExpression(params);
        return await this.context.transactions.where(criteria).unique();
    }
    getExpression(params) {
        if (params) {
            let e = this.context.transactions.getEntity();
            let c = this.context.getCriteria();
            return c;
        }
        else {
            throw 'No Parameter Found';
        }
    }
    async getUserTransactions(params) {
        let e = this.context.transactions.getEntity();
        let c = this.context.getCriteria();
        if (params.userId) {
            c.add(e.senderId.eq(params.userId).or(e.receiverId.eq(params.userId)));
        }
        if (params.fromDate) {
            c.add(e.crtdAt.gt(params.fromDate));
        }
        if (params.toDate) {
            c.add(e.crtdAt.lteq(params.toDate));
        }
        let q = this.context.transactions.where(c);
        if (params.index || params.limit) {
            q = q.limit(params.limit, params.index);
        }
        return await q.list();
    }
    async getMetadatas(transactionId) {
        return await transactionMetaCache.get(transactionId);
    }
}
exports.default = TransactionService;
//# sourceMappingURL=TransactionService.js.map