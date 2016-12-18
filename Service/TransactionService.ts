import * as entity from "es-entity";
import Cache from 'es-cache';

import { globalContext } from "../index";
import DbContext from "../Model/DbContext";
import Transaction from '../Model/Transaction';

export enum TransactionStatus {
	INITIATED,
	PROCESSED
}

export interface TransferPxy {
	id?: number
	senderId?: number;
	senderDeviceId?: number;
	receiverId?: number;
	receiverDeviceId?: number;
	amount?: number;
	status?: string;
	data?: any;
}

var transactionCache = new Cache({
	valueFunction: async function (id) {
		return await globalContext.transactions.where((t) => {
			return t.id.eq(id);
		}).unique();
	},
	limit: 65536
});

var transactionMetaCache = new Cache({
	valueFunction: async function (transactionId) {
		return await globalContext.transactionMetas.where((e) => {
			return e.transactionId.eq(transactionId);
		}).list();
	},
	limit: 65536
});

export default class TransactionService {
	context: DbContext = null;

	constructor(context?: DbContext) {
		if (context)
			this.context = context;
		else
			this.context = globalContext;
	}

	private copyProperties(transaction: Transaction, model: TransferPxy): Transaction {
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
			transaction.status.set(TransactionStatus[<string>model.status]);
		}
		return transaction;
	}

	async get(id: number): Promise<Transaction> {
		return await transactionCache.get(id);
	}

	async save(model: Transaction | TransferPxy): Promise<Transaction> {
		let transaction: Transaction = null;
		if (model instanceof Transaction) {
			transaction = model;
		} else if (model.id) {
			transaction = await this.context.transactions.get(model.id);
			transaction = this.copyProperties(transaction, model);
		} else {
			transaction = this.context.transactions.getEntity();
			transaction = this.copyProperties(transaction, model);
		}
		transaction = await this.context.transactions.insertOrUpdate(transaction);
		transactionCache.del(transaction.id.get());

		// Transaction Metadata
		if ((<TransferPxy>model).data) {
			let keys = Reflect.ownKeys((<TransferPxy>model).data);
			keys.forEach((key) => {
				let value = Reflect.get((<TransferPxy>model).data, key);
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

	// async delete(id: number) {
	// 	let transaction: Transaction = await this.context.transactions.where((a) => {
	// 		return a.id.eq(id);
	// 	}).unique();
	// 	await this.context.transactions.delete(transaction);
	// }

	async list(params): Promise<Transaction[]> {
		let criteria = this.getExpression(params);
		return await this.context.transactions.where(criteria).list();
	}

	async single(params): Promise<Transaction> {
		let criteria = this.getExpression(params);
		return await this.context.transactions.where(criteria).unique();
	}

	getExpression(params) {
		if (params) {
			let e = this.context.transactions.getEntity();
			let c = this.context.getCriteria();
			return c;
		} else {
			throw 'No Parameter Found';
		}
	}

	async getUserTransactions(params): Promise<Transaction[]> {
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
			q = q.limit(params.limit, params.index)
		}
		return await q.list();
	}

	async getMetadatas(transactionId) {
		return await transactionMetaCache.get(transactionId);
	}

}