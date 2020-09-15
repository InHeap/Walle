#! /usr/bin/env node

import * as net from 'net';
import * as koa from 'koa';
import * as bodyParser from 'koa-bodyparser';
import * as helmet from 'koa-helmet';
import * as morgan from 'koa-morgan';
import * as cors from 'kcors';

import config from './config';
import log from './log';

var app = new koa();
app.use(bodyParser());
app.use(helmet());
app.use(cors({ origin: '*' }));
app.use(morgan(':date[iso] :remote-addr :remote-user :method :url :status :res[content-length] - :response-time ms'));

// Error Handler
app.use(async (ctx: koa.Context, next) => {
	try {
		await next();
	} catch (err) {
		log.error(err);
		ctx.status = err.status || 400;
		ctx.body = {
			status: 'FAIL',
			message: typeof err == 'string' ? err : err.message || 'Something Broke!'
		};
	}
});

app.on('error', (err, ctx: koa.Context) => {
	log.error(err);
	ctx.status = err.status ? err.status : 400;
	let msg = '';
	if (err.message) msg = err.message;
	else if (err) msg = err;
	else msg = 'Something Broke!';
	ctx.body = {
		status: 'FAIL',
		message: msg
	};
});

// Start Server
var server = app.listen(config.port, function () {
	let addr = <net.AddressInfo>server.address();
	console.log("Example app listening at http://%s:%s", addr.address, addr.port);
});
