const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();
const pool = require("../app");

router.get("/initial", getInitialData);

module.exports = router;

function getInitialData(_, reshttp) {
	pool.getConnection((err, connection) => {
		if (err) throw err;
		connection.query(
			`select units.id as unitId, units.name as unitName, unitwords.id as id, unitwords.cz as cz, unitwords.en as en, units.color as color, unitwords.unit as unit from units left join unitwords on units.id = unitwords.unit`,
			(err, res) => {
				if (err) throw err;
				connection.release();
				let words = [];
				let units = {};
				res.forEach((item) => {
					if (item.id !== null) {
						words.push({
							id: item.id,
							cz: item.cz,
							en: item.en,
							unit: item.unit,
							primary: item.en,
							secondary: item.cz,
						});
					}
					if (!units[item.unitId]) {
						units[item.unitId] = {
							name: item.unitName,
							id: item.unitId,
							color: item.color,
						};
					}
				});
				console.log(Object.values(units));
				reshttp.status(200);
				reshttp.end(
					JSON.stringify({
						words,
						units: Object.values(units),
					})
				);
			}
		);
	});
}
