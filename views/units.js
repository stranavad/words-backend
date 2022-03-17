const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();

const pool = require("../app");
router.get("/", getAllUnits);
router.get("/detailed", getAllUnitsExtended);
router.post("/", jsonParser, createUnit);
router.put("/", jsonParser, updateUnit);
router.get("/words", jsonParser, getWordsInUnit);
router.delete("/", jsonParser, deleteUnit);

module.exports = router;

function getAllUnits(_, reshttp) {
	pool.getConnection((err, connection) => {
		if (err) throw err;
		connection.query(
			`select id,name from units order by id desc`,
			(err, units) => {
				connection.release();
				if (err) throw err;
				reshttp.status(200);
				reshttp.end(
					JSON.stringify({
						message: "units",
						units,
					})
				);
			}
		);
	});
}

function createUnit(req, reshttp) {
	const unit = req.body.unit;
	pool.getConnection((err, connection) => {
		if (err) throw err;
		connection.query(
			`select id from units where name = '${unit}'`,
			(err, res) => {
				if (err) throw err;
				if (res.length === 0) {
					connection.query(
						`insert into units (name) values ('${unit}')`,
						(err) => {
							if (err) throw err;
							connection.release();
							reshttp.status(200);
							reshttp.end(
								JSON.stringify({
									message: "created new unit",
								})
							);
						}
					);
				} else {
					connection.release();
					reshttp.status(200);
					reshttp.end(
						JSON.stringify({
							message: "This unit already exists",
						})
					);
				}
			}
		);
	});
}

function getWordsInUnit(req, reshttp) {
	const cz = req.query.cz.trim();
	const en = req.query.en.trim();
	const unit = req.query.unit.trim();
	if (unit) {
		pool.getConnection((err, connection) => {
			if (err) throw err;
			// get unit id
			connection.query(
				`select id from units where name = '${unit}'`,
				(err, res) => {
					if (err) throw err;
					const unitId = res[0].id;
					connection.query(
						`select id,cz,en from unitwords where unit = ${unitId} order by id desc`,
						(err, res) => {
							connection.release();
							if (err) throw err;
							const czExists = res.map((w) => w.cz).includes(cz);
							const enExists = res.map((w) => w.en).includes(en);
							reshttp.status(200);
							reshttp.end(
								JSON.stringify({
									message: "exists?",
									czExists,
									enExists,
								})
							);
						}
					);
				}
			);
		});
	} else {
		reshttp.status(200);
		reshttp.end(
			JSON.stringify({
				message: "fine",
				data: [],
			})
		);
	}
}

function deleteUnit(req, reshttp) {
	const id = req.query.id;
	pool.getConnection((err, connection) => {
		if (err) throw err;
		connection.query(`delete from unitwords where unit = ${id}`, (err) => {
			if (err) throw err;
			connection.query(`delete from units where id = ${id}`, (err) => {
				if (err) throw err;
				connection.release();
				reshttp.status(200);
				reshttp.end(
					JSON.stringify({
						message: "Vymazano adios",
					})
				);
			});
		});
	});
}

function getAllUnitsExtended(_, reshttp) {
	pool.getConnection((err, connection) => {
		if (err) throw err;
		connection.query(
			`select units.id as id, units.name as name, unitwords.id as wordId from units left join unitwords on units.id = unitwords.unit`,
			(err, res) => {
				if (err) throw err;
				connection.release();
				let returnData = {};
				res.forEach((item) => {
					if (returnData[item.id]) {
						returnData[item.id].wordCount += 1;
					} else {
						returnData[item.id] = {
							id: item.id,
							name: item.name,
							wordCount: item.wordId ? 1 : 0,
						};
					}
				});
				reshttp.status(200);
				reshttp.end(
					JSON.stringify({
						message: "units detailed",
						data: Object.values(returnData),
					})
				);
			}
		);
	});
}

function updateUnit(req, reshttp) {
	const { id, name } = req.body;
	pool.getConnection((err, connection) => {
		if (err) throw err;
		connection.query(
			`select id from units where id = ${id}`,
			(err, res) => {
				if (err) throw err;
				if (res.length > 0) {
					connection.query(
						`update units set name = '${name}' where id = ${id}`,
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
				} else {
					connection.release();
					reshttp.status(200);
					reshttp.end(
						JSON.stringify({
							message: "warning",
						})
					);
				}
			}
		);
	});
}
