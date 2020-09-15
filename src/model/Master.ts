import * as es from "es-entity";
import { Type } from "es-entity";

export default class Master {
	constructor() {
	}

	id: Type.Number = new Type.Number();
	domain: Type.String = new Type.String();
	key: Type.String = new Type.String();
	value: Type.String = new Type.String();
	active: Type.Boolean = new Type.Boolean();
	crtdAt: Type.Date = new Type.Date();
	uptdAt: Type.Date = new Type.Date();
}
