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

app.use("/words", words);
app.use("/units", units);
app.use("/api", nubes);
app.use("/", nubes);
app.listen(APP_PORT, () => console.log(`listening on port: ${APP_PORT}`));
