"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const es_entity_1 = require("es-entity");
class Master {
    constructor() {
        this.id = new es_entity_1.Type.Number();
        this.domain = new es_entity_1.Type.String();
        this.key = new es_entity_1.Type.String();
        this.value = new es_entity_1.Type.String();
        this.active = new es_entity_1.Type.Boolean();
        this.crtdAt = new es_entity_1.Type.Date();
        this.uptdAt = new es_entity_1.Type.Date();
    }
}
exports.default = Master;
