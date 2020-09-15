import * as es from "es-entity";
import { Type } from "es-entity";

export default class User {
	constructor() {
	}

	id: Type.Number = new Type.Number();
	userName: Type.String = new Type.String();
	password: Type.String = new Type.String();
	email: Type.String = new Type.String();
	firstName: Type.String = new Type.String();
	lastName: Type.String = new Type.String();
	phoneNo: Type.String = new Type.String();
	accessToken: Type.String = new Type.String();
	expireAt: Type.Date = new Type.Date();
	balance: Type.Number = new Type.Number();
	active: Type.Boolean = new Type.Boolean();
	crtdAt: Type.Date = new Type.Date();
	uptdAt: Type.Date = new Type.Date();
}
