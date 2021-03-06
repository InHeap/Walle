"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const es_entity_1 = require("es-entity");
class Device {
    constructor() {
        this.id = new es_entity_1.Type.Number();
        this.userId = new es_entity_1.Type.Number();
        this.balance = new es_entity_1.Type.Number();
        this.name = new es_entity_1.Type.String();
        this.secret = new es_entity_1.Type.String();
        this.platform = new es_entity_1.Type.Number();
        this.expireAt = new es_entity_1.Type.Date();
        this.payable = new es_entity_1.Type.Boolean();
        this.lastToken = new es_entity_1.Type.String();
        this.active = new es_entity_1.Type.Boolean();
        this.crtdAt = new es_entity_1.Type.Date();
        this.uptdAt = new es_entity_1.Type.Date();
    }
}
exports.default = Device;
//# sourceMappingURL=Device.js.map