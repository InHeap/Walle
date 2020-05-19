"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const es = require("es-entity");
const User_1 = require("./User");
const Device_1 = require("./Device");
const Transaction_1 = require("./Transaction");
const TransactionMeta_1 = require("./TransactionMeta");
const Master_1 = require("./Master");
class DbContext extends es.Context {
    constructor(config, entityPath) {
        super(config, entityPath);
        this.users = new es.DBSet(User_1.default);
        this.devices = new es.DBSet(Device_1.default);
        this.transactions = new es.DBSet(Transaction_1.default);
        this.transactionMetas = new es.DBSet(TransactionMeta_1.default);
        this.masters = new es.DBSet(Master_1.default);
    }
}
exports.default = DbContext;
