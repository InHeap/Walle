import * as es from "es-entity";
import { Type } from "es-entity";

export default class TransactionMeta {
	constructor() {
	}

	id: Type.Number = new Type.Number();
	transactionId: Type.Number = new Type.Number();
	key: Type.String = new Type.String();
	value: Type.String = new Type.String();
	crtdAt: Type.Date = new Type.Date();
	uptdAt: Type.Date = new Type.Date();
}
