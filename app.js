const express = require('express');
const mongodb = require('mongodb');

const app = express();
const port = process.env.PORT || 8080;
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

app.use(express.static(__dirname));

app.get('/', (req, res) => {
	res.render('index');
});

app.get('/api/currentEvents', async (req, res) => {
	const now = Date.now();
	const documents = await db.collection('events').find({dates: {$elemMatch: {end: {$gt: now}, start: {$lt: now}}}}).project({_id: 1, name: 1, dates: 1}).toArray();
	const events = [];
	documents.forEach(document => {
		for (let date of document.dates) {
			if (date.end > now && date.start < now) {
				events.push({
					_id: document._id,
					dates: `${getDate(date.start)} - ${getDate(date.end)}`,
					location: getLocation(date.city, date.region, date.country),
					name: document.name
				});
				break;
			}
		}
	});
	res.json(events);
});

const getDate = ms => {
	const date = new Date(ms);
	return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
};

const getLocation = (city, region, country) => {
	let location = [city];
	if (region) {
		location.push(region);
	}
	if (country) {
		location.push(country);
	}
	return location.join(', ');
};

app.listen(port);
console.log('Running');
