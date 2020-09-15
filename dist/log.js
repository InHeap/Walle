"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bunyan = require("bunyan");
const bunyanFormat = require("bunyan-format");
const log = bunyan.createLogger({
    name: 'fantasy-api',
    stream: bunyanFormat({ outputMode: 'short' })
});
exports.default = log;
//# sourceMappingURL=log.js.map