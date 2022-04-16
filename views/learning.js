const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();
const pool = require("../app");

router.post("/", jsonParser, getWord);
router.post("/correct", jsonParser, isCorrect);

module.exports = router;

function multi(array) {
	return `(${array.join(",")})`;
}

// get word
function getWord(req, reshttp) {
	const { words, units } = req.body;
	pool.getConnection((err, connection) => {
		if (err) throw err;
		// query builder start
		let query = "select id,cz,en from unitwords ";
		if (words.length > 0 || units.length > 0) {
			query += "where";
			if (words.length > 0) {
				query += ` id not in ${multi(words)}`;
				if (units.length > 0) {
					query += " and";
				}
			}
			if (units.length > 0) {
				query += ` unit in ${multi(units)}`;
			}
			query += " limit 1";
		}
		// query builder end
		connection.query(query, (err, word) => {
			if (err) throw err;
			if (word.length === 0) {
				// all words are used
				connection.release();
				reshttp.status(200);
				reshttp.end(
					JSON.stringify({
						message: "empty",
					})
				);
			} else {
				// selecting other words
				connection.query(
					`select en from unitwords where id not in ${multi([
						...words,
						word[0].id,
					])} ORDER BY RAND() limit 3`,
					(err, resWords) => {
						if (err) throw err;
						connection.release();
						reshttp.status(200);
						if (resWords.length === 0) {
							reshttp.end(
								JSON.stringify({
									message: "empty",
								})
							);
						} else {
							reshttp.end(
								JSON.stringify({
									message: "word",
									guessWords: shuffle([
										...resWords.map((word) => word.en),
										word[0].en,
									]),
									word: { id: word[0].id, cz: word[0].cz },
								})
							);
						}
					}
				);
			}
		});
	});
}
function shuffle(array) {
	let currentIndex = array.length,
		randomIndex;

	// While there remain elements to shuffle.
	while (currentIndex != 0) {
		// Pick a remaining element.
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;

		// And swap it with the current element.
		[array[currentIndex], array[randomIndex]] = [
			array[randomIndex],
			array[currentIndex],
		];
	}

	return array;
}

// check if user's answer is correct
function isCorrect(req, reshttp) {
	const { id, answer } = req.body;
	pool.getConnection((err, connection) => {
		if (err) throw err;
		connection.query(
			`select en from unitwords where id = ${id}`,
			(err, res) => {
				if (err) throw err;
				connection.release();
				reshttp.status(200);
				reshttp.end(
					JSON.stringify({
						message: "something",
						correct: answer === res[0].en,
					})
				);
			}
		);
	});
}