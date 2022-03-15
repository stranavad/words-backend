const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();

const pool = require("../app");

router.get("/", getAllWords);
router.post("/", jsonParser, createWords);
router.delete("/", jsonParser, deleteWord);

module.exports = router;

function getAllWords(req, reshttp) {
	pool.getConnection((err, connection) => {
		if (err) throw err;
		connection.query(
			`select unitwords.id as id, unitwords.cz as cz, unitwords.en as en, unitwords.unit as unit_id, units.name as unit from unitwords left join units on unitwords.unit = units.id order by unitwords.id desc`,
			(err, words) => {
				connection.release();
				if (err) throw err;
				reshttp.status(200);
				reshttp.end(
					JSON.stringify({
						message: "words",
						words,
					})
				);
			}
		);
	});
}

function createWords(req, reshttp) {
	const cz = req.body.cz;
	const en = req.body.en;
	const unit = req.body.unit;

	pool.getConnection((err, connection) => {
		if (err) throw err;
		connection.query(
			`select id from units where name = '${unit}'`,
			(err, res) => {
				if (err) throw err;
				connection.query(
					`insert into unitwords (cz,en,unit) values('${cz}', '${en}', ${res[0].id})`,
					(err) => {
						if (err) throw err;
						connection.release();
						reshttp.status(200);
						reshttp.end(
							JSON.stringify({
								message: "Inserted",
							})
						);
					}
				);
			}
		);
	});
}

function deleteWord(req, reshttp) {
	const id = req.query.id;
	pool.getConnection((err, connection) => {
		if (err) throw err;
		connection.query(`delete from unitwords where id = ${id}`, (err) => {
			if (err) throw err;
			connection.release();
			reshttp.status(200);
			reshttp.end(
				JSON.stringify({
					message: "deleted",
				})
			);
		});
	});
}
