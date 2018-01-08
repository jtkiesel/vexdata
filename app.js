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

app.get('/team/:prog/:id', (req, res) => {
	res.redirect(`/team/index.html?prog=${req.params.prog}&id=${req.params.id}`);
});

app.get('/api/team', async (req, res) => {
	const prog = encodeProg(req.query.prog.toLowerCase());
	const id = req.query.id.toLowerCase();
	if (prog && validTeamId(id)) {
		const team = await db.collection('teams').find({'_id.prog': prog, '_id.id': new RegExp(`^${id}$`, 'i')}).sort({'_id.season': -1}).limit(1).next();
		res.json(team);
	}
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
					name: document.name,
					end: date.end
				});
				break;
			}
		}
	});
	res.json(events.sort((a, b) => a.end - b.end));
});

app.get('/api/topSkills', async (req, res) => {
	const season = parseInt(req.query.season || 119);
	const grade = parseInt(req.query.grade || 3);
	const skip = parseInt(req.query.skip || 0);
	const limit = parseInt(req.query.limit || 1000);
	const skills = await db.collection('maxSkills').find({'_id.season': season, '_id.grade': grade, '_id.rank': {$gt: skip}}).sort({'_id.rank': 1}).limit(limit).toArray();
	res.json(skills);
});

const progs = {
	vrc: 1,
	vexu: 4,
	viqc: 41
};

const encodeProg = prog => progs[prog];

const validTeamId = id => /^([0-9]{1,5}[A-Z]?|[A-Z]{2,6}[0-9]{0,2})$/i.test(id);

const getDate = ms => {
	const date = new Date(ms);
	return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
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
console.log(`Running on ${port}`);
