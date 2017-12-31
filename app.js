const express = require('express');
const mongodb = require('mongodb');

const app = express();
const MongoClient = mongodb.MongoClient;
const mongodbUri = process.env.WEBSITE_DB;
const mongodbOptions = {
	keepAlive: 1,
	connectTimeoutMS: 30000,
	reconnectTries: 30,
	reconnectInterval: 5000
};

let db;
MongoClient.connect(mongodbUri, mongodbOptions).then(database => {
	db = database.db('heroku_x9cnpcwf');
}).catch(console.log);

app.get('/api/currentEvents', async (req, res) => {
	const now = Date.now();
	const documents = await db.collection('events').find({dates: {$elemMatch: {end: {$gt: now}, start: {$lt: now}}}}).project({_id: 1, name: 1, dates: 1}).toArray();
	const events = [];
	documents.forEach(document => {
		for (let date of document.dates) {
			if (date.end > now && date.start < now) {
				events.push({
					_id: document._id,
					name: document.name,
					start: date.start,
					end: date.end,
					city: date.city,
					region: date.region,
					country: date.country
				});
				break;
			}
		}
	});
	res.json(events);
});

app.listen(process.env.PORT || 8080);
console.log('Running');
