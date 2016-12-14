"use strict";
const es_entity_1 = require("es-entity");
class TransactionMeta {
    constructor() {
        this.id = new es_entity_1.Type.Number();
        this.transactionId = new es_entity_1.Type.Number();
        this.key = new es_entity_1.Type.String();
        this.value = new es_entity_1.Type.String();
        this.crtdAt = new es_entity_1.Type.Date();
        this.uptdAt = new es_entity_1.Type.Date();
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TransactionMeta;
