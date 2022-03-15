const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();
const fs = require("fs");
const path = require("path");
const pool = require("../app");

router.get("/", getAllWords);
router.post("/", jsonParser, createWords);
router.delete("/", jsonParser, deleteWord);
router.post("/export", jsonParser, exportWords);

module.exports = router;

function getAllWords(_, reshttp) {
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

function exportWords(req, reshttp) {
	const units = req.body.units;
	pool.getConnection((err, connection) => {
		if (err) throw err;
		if (units.length > 0) {
			// getting units ids
			connection.query(
				`select id from units where name in (${units
					.map((u) => `'${u}'`)
					.join(",")})`,
				(err, res) => {
					if (err) throw err;
					// getting words
					connection.query(
						`select cz,en from unitwords where unit in (${res
							.map(({ id }) => id)
							.join(",")})`,
						(err, res) => {
							if (err) throw err;
							connection.release();
							let returnData = res
								.map(({ cz, en }) => `${en} -- ${cz}\n`)
								.join("");
							reshttp.status(200);
							reshttp.end(returnData);
						}
					);
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
