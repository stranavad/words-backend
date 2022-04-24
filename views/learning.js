const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();
const pool = require("../app");

router.post("/", jsonParser, getWord);
router.post("/correct", jsonParser, isCorrect);
router.post("/count", jsonParser, countWords);

module.exports = router;

function multi(array) {
	return `(${array.join(",")})`;
}

// get word
function getWord(req, reshttp) {
	const { words, units } = req.body;
	const language = req.body.language || "en";
	pool.getConnection((err, connection) => {
		if (err) throw err;
		// query builder start
		let query = `select id,en,cz from unitwords `;
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
			query += " order by rand() limit 1";
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
					`select id,${language} from unitwords where id != ${word[0].id} order by rand() limit 3`,
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
										...resWords.map((word) => word[language]),
										word[0][language],
									]),
									word: { id: word[0].id, word: word[0][language === 'en' ? 'cz' : 'en'], mistakes: 0 },
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

	while (currentIndex != 0) {
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;

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
	const language = req.body.language || 'en';
	pool.getConnection((err, connection) => {
		if (err) throw err;
		connection.query(
			`select ${language} from unitwords where id = ${id}`,
			(err, res) => {
				if (err) throw err;
				connection.release();
				reshttp.status(200);
				reshttp.end(
					JSON.stringify({
						message: "something",
						correct: answer === res[0][language],
					})
				);
			}
		);
	});
}

function countWords(req, reshttp) {
	const { units } = req.body;
	pool.getConnection((err, connection) => {
		if (err) throw err;
		let query = `select count(id) from unitwords`;
		if (units?.length) {
			query += ` where unit in ${multi(units)}`;
		}
		connection.query(query, (err, res) => {
			if (err) throw err;
			connection.release();
			reshttp.status(200);
			reshttp.end(JSON.stringify({
				message: 'count',
				count: res[0]['count(id)']
			}))
		})
	})
}
