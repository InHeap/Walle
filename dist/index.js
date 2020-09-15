#! /usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const koa = require("koa");
const bodyParser = require("koa-bodyparser");
const helmet = require("koa-helmet");
const morgan = require("koa-morgan");
const cors = require("kcors");
const AuthFilter_1 = require("../AuthFilter");
const config_1 = require("./config");
const log_1 = require("./log");
var app = new koa();
app.use(bodyParser());
app.use(helmet());
app.use(cors({ origin: '*' }));
app.use(morgan(':date[iso] :remote-addr :remote-user :method :url :status :res[content-length] - :response-time ms'));
app.use(async (ctx, next) => {
    try {
        await next();
    }
    catch (err) {
        log_1.default.error(err);
        ctx.status = err.status || 400;
        ctx.body = {
            status: 'FAIL',
            message: typeof err == 'string' ? err : err.message || 'Something Broke!'
        };
    }
});
app.on('error', (err, ctx) => {
    log_1.default.error(err);
    ctx.status = err.status ? err.status : 400;
    let msg = '';
    if (err.message)
        msg = err.message;
    else if (err)
        msg = err;
    else
        msg = 'Something Broke!';
    ctx.body = {
        status: 'FAIL',
        message: msg
    };
});
app.use('/user', AuthFilter_1.default);
app.use('/pay', AuthFilter_1.default);
app.use('/device', AuthFilter_1.default);
app.use('/auth/logout', AuthFilter_1.default);
var server = app.listen(config_1.default.port, function () {
    let addr = server.address();
    console.log("Example app listening at http://%s:%s", addr.address, addr.port);
});
//# sourceMappingURL=index.js.map