import * as entity from "es-entity";
import { context } from "../index";
import DbContext from "../Model/DbContext";
import Transaction from '../Model/Transaction';

var transactionPropertyTrans = new entity.Util.PropertyTransformer();
transactionPropertyTrans.fields.push('email', 'firstName', 'lastName');

export default class DeviceService {

	constructor() {
	}

	copyProperties(transaction: Transaction, entity: any): Transaction {
		transaction = transactionPropertyTrans.assignEntity(transaction, entity);
		return transaction;
	}

	async get(id: number): Promise<Transaction> {
		return await context.transactions.where((d) => {
			return d.id.eq(id);
		}).unique();
	}

	async save(model): Promise<Transaction> {
		let transaction: Transaction = null;
		if (model instanceof Transaction) {
			transaction = model;
		} else if (model.id) {
			transaction = await context.transactions.get(model.id);
			transaction = this.copyProperties(transaction, model);
		} else {
			transaction = context.transactions.getEntity();
			transaction = this.copyProperties(transaction, model);
		}
		transaction = await context.transactions.insertOrUpdate(transaction);
		return transaction;
	}

	async delete(id: number) {
		let transaction: Transaction = await context.transactions.where((a) => {
			return a.id.eq(id);
		}).unique();
		await context.transactions.delete(transaction);
	}

	async list(params): Promise<Transaction[]> {
		let criteria = this.getExpression(params);
		return await context.transactions.where(criteria).list();
	}

	async single(params): Promise<Transaction> {
		let criteria = this.getExpression(params);
		return await context.transactions.where(criteria).unique();
	}

	getExpression(params) {
		if (params) {
			let e = context.transactions.getEntity();
			let c = context.getCriteria();
			return c;
		} else {
			throw 'No Parameter Found';
		}
	}

	async getUserTransactions(params): Promise<Transaction[]> {
		let e = context.transactions.getEntity();
		let c = context.getCriteria();
		if (params.userId) {
			c.add(e.senderId.eq(params.userId).or(e.receiverId.eq(params.userId)));
		}
		if (params.fromDate) {
			c.add(e.crtdAt.gt(params.fromDate));
		}
		if (params.toDate) {
			c.add(e.crtdAt.lteq(params.toDate));
		}
		let q = context.transactions.where(c);
		if (params.index || params.limit) {
			q = q.limit(params.limit, params.index)
		}
		return await q.list();
	}

}