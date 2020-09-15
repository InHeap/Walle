"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const es = require("es-entity");
const User_1 = require("./model/User");
const Device_1 = require("./model/Device");
const Transaction_1 = require("./model/Transaction");
const TransactionMeta_1 = require("./model/TransactionMeta");
const Master_1 = require("./model/Master");
class DbContext extends es.Context {
    constructor(config, entityPath) {
        super({ dbConfig: config, entityPath: entityPath });
        this.users = new es.collection.DBSet(User_1.default);
        this.devices = new es.collection.DBSet(Device_1.default);
        this.transactions = new es.collection.DBSet(Transaction_1.default);
        this.transactionMetas = new es.collection.DBSet(TransactionMeta_1.default);
        this.masters = new es.collection.DBSet(Master_1.default);
    }
}
exports.default = DbContext;
//# sourceMappingURL=DbContext.js.map