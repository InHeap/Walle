import * as es from "es-entity";
import { types } from "es-entity";

export default class Device {
	constructor() {
	}

	id = new types.Number();
	userId = new types.Number();
	balance = new types.Number();
	name = new types.String();
	secret = new types.String();
	platform = new types.Number();
	expireAt = new types.Date();
	payable = new types.Boolean();
	lastToken = new types.String();
	active = new types.Boolean();
	crtdAt = new types.Date();
	uptdAt = new types.Date();
}
