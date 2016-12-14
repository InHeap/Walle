import * as es from "es-entity";
import { Type } from "es-entity";

export default class Transaction {
	constructor() {
	}

	id: Type.Number = new Type.Number();
	senderId: Type.Number = new Type.Number();
	senderDeviceId: Type.Number = new Type.Number();
	receiverId: Type.Number = new Type.Number();
	receiverDeviceId: Type.Number = new Type.Number();
	amount: Type.Number = new Type.Number();
	status: Type.Number = new Type.Number();
	crtdAt: Type.Date = new Type.Date();
	uptdAt: Type.Date = new Type.Date();
}
