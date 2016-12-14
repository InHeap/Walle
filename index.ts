#! /usr/bin/env node

/// <reference path="/usr/local/lib/typings/index.d.ts" />

import * as fs from 'fs';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as controller from 'es-controller';
import * as entity from "es-entity";
import * as morgan from 'morgan';
import * as mysql from "mysql";
import * as helmet from 'helmet';
import * as cors from 'cors';

import DbContext from "./Model/DbContext";
import AuthFilter from './AuthFilter';

var config = JSON.parse(fs.readFileSync(process.env["HEAP_HOME"] + '/config/walle/config.json', 'utf8'));

var app = express();

// Logger
app.use(morgan(':date[iso] :remote-addr :remote-user :method :url HTTP/:http-version :status :res[content-length] - :response-time ms'));

app.use(cors({ origin: "*" }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// app.use(helmet());

app.use('/user', AuthFilter);
app.use('/pay', AuthFilter);
app.use('/device', AuthFilter);

var router = new controller.Router();
router.load(__dirname + "/routeconfig.json", __dirname);

router.set('app', app);
router.set('config', config);

// Set Database Context
config.dbConfig.driver = mysql;
var context: DbContext = new DbContext(config.dbConfig);
context.init();
// router.set("Context", context);

router.setApp(app);

// Error Handler
app.use([function (err, req, res, next) {
	console.error(err);
	res.status(err.status ? err.status : 400);
	if (err.message) res.json(err.message);
	else if (err) res.json(err);
	else res.json("Something Broke!");
}]);

// Start Server
var server = app.listen(3003, function () {
	var host = server.address().address
	var port = server.address().port
	console.log("Example app listening at http://%s:%s", host, port);
});

export { context };
export { app };