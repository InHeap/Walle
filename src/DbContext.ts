import * as es from "es-entity";
import User from "./model/User";
import Device from './model/Device';
import Transaction from './model/Transaction';
import TransactionMeta from './model/TransactionMeta';
import Master from './model/Master';

export default class DbContext extends es.Context {
	constructor(config: es.bean.IConnectionConfig, entityPath?: string) {
		super({ dbConfig: config, entityPath: entityPath });
	}

	users = new es.collection.DBSet<User>(User);
	devices = new es.collection.DBSet<Device>(Device);
	transactions = new es.collection.DBSet<Transaction>(Transaction);
	transactionMetas = new es.collection.DBSet<TransactionMeta>(TransactionMeta);
	masters = new es.collection.DBSet<Master>(Master);
}
