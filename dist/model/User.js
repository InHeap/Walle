"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const es_entity_1 = require("es-entity");
class User {
    constructor() {
        this.id = new es_entity_1.Type.Number();
        this.userName = new es_entity_1.Type.String();
        this.password = new es_entity_1.Type.String();
        this.email = new es_entity_1.Type.String();
        this.firstName = new es_entity_1.Type.String();
        this.lastName = new es_entity_1.Type.String();
        this.phoneNo = new es_entity_1.Type.String();
        this.accessToken = new es_entity_1.Type.String();
        this.expireAt = new es_entity_1.Type.Date();
        this.balance = new es_entity_1.Type.Number();
        this.active = new es_entity_1.Type.Boolean();
        this.crtdAt = new es_entity_1.Type.Date();
        this.uptdAt = new es_entity_1.Type.Date();
    }
}
exports.default = User;
//# sourceMappingURL=User.js.map