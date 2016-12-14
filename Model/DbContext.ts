import * as es from "es-entity";
import User from "./User";
import Device from './Device';
import Transaction from './Transaction';
import TransactionMeta from './TransactionMeta';
import Master from './Master';

export default class DbContext extends es.Context {
	constructor(config?: es.ConnectionConfig, entityPath?: string) {
		super(config, entityPath);
	}

	users: es.DBSet<User> = new es.DBSet<User>(User);
	devices: es.DBSet<Device> = new es.DBSet<Device>(Device);
	transactions: es.DBSet<Transaction> = new es.DBSet<Transaction>(Transaction);
	transactionMetas: es.DBSet<TransactionMeta> = new es.DBSet<TransactionMeta>(TransactionMeta);
	masters: es.DBSet<Master> = new es.DBSet<Master>(Master);
}
