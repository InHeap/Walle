"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
var config = JSON.parse(fs.readFileSync(process.env["HEAP_HOME"] + '/config/walle/config.json', 'utf8'));
exports.default = config;
//# sourceMappingURL=config.js.map