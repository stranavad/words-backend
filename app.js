const express = require("express");
const app = express();
const mysql = require("mysql");
const path = require('path');
const dotenv = require("dotenv").config({
	path: path.join(__dirname, ".env"),
});

const { APP_PORT, DB_USER, DB_PASSWORD, DB_URL } = process.env;

// const bodyParser = require('body-parser');
// const jsonParser = bodyParser.json();

// Mysql connection
const pool = mysql.createPool({
	host: DB_URL,
	user: DB_USER,
	password: DB_PASSWORD,
	database: "words",
	connectionLimit: 8,
});

module.exports = pool;

const words = require("./views/words");
const units = require("./views/units");
const nubes = require("./views/nubes");
const utils = require("./views/utils");

app.use(function (req, res, next) {
	res.append("Access-Control-Allow-Origin", ["*"]);
	res.append("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
	res.append("Access-Control-Allow-Headers", "Content-Type");
	next();
});

app.use("/words", words);
app.use("/units", units);
app.use("/utils", utils);
app.use("/api", nubes);
app.use("/", nubes);
app.listen(APP_PORT, () => console.log(`listening on port: ${APP_PORT}`));
