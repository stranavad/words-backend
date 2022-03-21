const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();
const pool = require("../app");

router.get("/", getAllWords);
router.post("/", jsonParser, createWords);
router.put("/", jsonParser, updateWord);
router.delete("/", jsonParser, deleteWord);
router.post("/export", jsonParser, exportWords);

module.exports = router;

function getAllWords(_, reshttp) {
	pool.getConnection((err, connection) => {
		if (err) throw err;
		connection.query(
			`select id,en,cz,unit from unitwords order by unitwords.id desc`,
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
			`insert into unitwords (cz,en,unit) values("${cz}", "${en}", ${unit})`,
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

function exportWords(req, reshttp) {
	const units = req.body.units.map(u => u.id);
	console.log(req.body);
	pool.getConnection((err, connection) => {
		if (err) throw err;
		if (units.length > 0) {
			// getting units ids
			connection.query(
				`select cz,en from unitwords where unit in (${units
					.join(",")})`,
				(err, res) => {
					if (err) throw err;
					connection.release();
					let returnData = res
						.map(({ cz, en }) => `${en} -- ${cz}\n`)
						.join("");
					reshttp.status(200);
					reshttp.end(JSON.stringify({data: returnData}));
				}
			);
		} else {
			connection.query(`select cz,en from unitwords`, (err, res) => {
				if (err) throw err;
				connection.release();
				let returnData = res
					.map(({ cz, en }) => `${en} -- ${cz}\n`)
					.join("");
				reshttp.status(200);
				reshttp.end(returnData);
			});
		}
	});
}

function updateWord(req, reshttp) {
	console.log(req.body);
	console.log(req);
	const { id, en, cz } = req.body;
	pool.getConnection((err, connection) => {
		if (err) throw err;
		connection.query(
			`update unitwords set cz = "${cz}", en = "${en}" where id = ${id}`,
			(err) => {
				if (err) throw err;
				connection.release();
				reshttp.status(200);
				reshttp.end(
					JSON.stringify({
						message: "updated",
					})
				);
			}
		);
	});
}
