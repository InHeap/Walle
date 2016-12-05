import * as es from "es-entity";
import { Type } from "es-entity";

export default class Device {
	constructor() {
	}

	id: Type.Number = new Type.Number();
	userId: Type.Number = new Type.Number();
	balance: Type.Number = new Type.Number();
	name: Type.String = new Type.String();
	description: Type.String = new Type.String();
	secret: Type.String = new Type.String();
	expireAt: Type.Date = new Type.Date();
	payable: Type.Boolean = new Type.Boolean();
	active: Type.Boolean = new Type.Boolean();
	crtdAt: Type.Date = new Type.Date();
	uptdAt: Type.Date = new Type.Date();
}
