const express = require("express");
const app = express();
const mysql = require("mysql");
// const bodyParser = require('body-parser');
// const jsonParser = bodyParser.json();

// Mysql connection
const pool = mysql.createPool({
	host: "127.0.0.1",
	user: "admin",
	password: "password",
	database: "words",
	connectionLimit: 8,
});

module.exports = pool;

const words = require("./views/words");
const units = require("./views/units");
const nubes = require("./vies/nubes");

app.use("/words", words);
app.use("/units", units);
app.use("/api", nubes);
app.use("/", nubes);
app.listen(3000);
