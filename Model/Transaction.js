"use strict";
const es_entity_1 = require("es-entity");
class Transaction {
    constructor() {
        this.id = new es_entity_1.Type.Number();
        this.senderId = new es_entity_1.Type.Number();
        this.senderDeviceId = new es_entity_1.Type.Number();
        this.receiverId = new es_entity_1.Type.Number();
        this.receiverDeviceId = new es_entity_1.Type.Number();
        this.amount = new es_entity_1.Type.Number();
        this.status = new es_entity_1.Type.Number();
        this.crtdAt = new es_entity_1.Type.Date();
        this.uptdAt = new es_entity_1.Type.Date();
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Transaction;
