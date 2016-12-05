#! /usr/bin/env node
"use strict";
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const controller = require('es-controller');
const morgan = require('morgan');
const mysql = require("mysql");
const cors = require('cors');
const DbContext_1 = require("./Model/DbContext");
var config = JSON.parse(fs.readFileSync(process.env["HEAP_HOME"] + '/config/walle/config.json', 'utf8'));
var app = express();
exports.app = app;
app.use(morgan(':date[iso] :remote-addr :remote-user :method :url HTTP/:http-version :status :res[content-length] - :response-time ms'));
app.use(cors({ origin: "*" }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
var router = new controller.Router();
router.load(__dirname + "/routeconfig.json", __dirname);
router.set('app', app);
router.set('config', config);
config.dbConfig.driver = mysql;
var context = new DbContext_1.default(config.dbConfig);
exports.context = context;
context.init();
router.set("Context", context);
router.setApp(app);
app.use([function (err, req, res, next) {
        console.error(err);
        res.status(400);
        if (err.message)
            res.send(err.message);
        else if (err)
            res.send(err);
        else
            res.send("Something Broke!");
    }]);
var server = app.listen(3003, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log("Example app listening at http://%s:%s", host, port);
});
