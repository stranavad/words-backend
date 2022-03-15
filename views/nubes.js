const express = require("express");
const router = express.Router();
const fs = require('fs');
const path = require('path');


router.get("/", getData);
module.exports = router;

function getData(req, res) {
	fs.readFile(path.resolve(__dirname, "data.json"), (err, data) => {
		let dataToReturn = JSON.parse(data);
		res.setHeader("Content-Type", "application/json");
		res.status(200);
		res.end(JSON.stringify(dataToReturn));
	});
}
