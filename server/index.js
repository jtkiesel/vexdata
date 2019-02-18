const express = require('express');
const { MongoClient } = require('mongodb');
const path = require('path');

const app = express();
const router = express.Router();
const port = process.env.PORT || 5000;
const dbUri = process.env.WEBSITE_DB || '';
const mongoOptions = {
  reconnectTries: Number.MAX_VALUE,
  keepAlive: true,
  useNewUrlParser: true
};

let db, teams, events, skills, matches, rankings, maxSkills;

//const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

const badQuery = (res, msg) => res.status(400).send(`Query Error: ${msg}`);

const badId = res => badQuery(res, 'id requires a TeamId');
const badProgram = res => badQuery(res, 'program requires a ProgramId');
const badSkip = res => badQuery(res, 'skip requires a positive integer');
const badLimit = res => badQuery(res, `limit requires an integer between 1 and ${maxLimit}`);

const teamHideSensitive = {address: 0, emergPhone: 0, contact: 0, contact2: 0, finance: 0};

const validateId = id => isValidTeamId(id) ? new RegExp(`^${id}$`, 'i') : undefined;

const validateProgram = program => {
  const programNum = Number(program);
  return isValidProgramId(programNum) ? programNum : encodeProgram(program.toLowerCase());
};

const validateSkip = skip => {
  const skipNum = Number(skip);
  return (Number.isInteger(skipNum) && skipNum >= 0) ? skipNum : undefined;
};

const maxLimit = 1000;
const validateLimit = limit => {
  const limitNum = Number(limit);
  return (Number.isInteger(limitNum) && limitNum >= 1 && limitNum <= maxLimit) ? limitNum : undefined;
};

app.use('/api', router);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../build')));
  app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../build/index.html')));
}

router.get('/teams', (req, res) => {
  const query = {};
  if (req.query.id !== undefined) {
    const id = validateId(req.query.id);
    if (id === undefined) {
      return badId(res);
    }
    query['_id.id'] = id;
  }
  if (req.query.program !== undefined) {
    const program = validateProgram(req.query.program);
    if (program === undefined) {
      return badProgram(res);
    }
    query['_id.prog'] = program;
  }
  const sort = {};
  if (req.query.sort !== undefined) {
    const fields = req.query.sort.split(',');
    for (let field of fields) {
      const order = field.charAt(0);
      if (order === '-') {
        field = field.slice(1);
      }
      if (!['season'].includes(field)) {
        return badQuery(res, `invalid sort field "${field}"`);
      }
      if (field === 'season') {
        field = '_id.season';
      }
      sort[field] = (order === '-') ? -1 : 1;
    }
  }
  let skip = 0;
  if (req.query.skip !== undefined) {
    skip = validateSkip(req.query.skip);
    if (skip === undefined) {
      return badSkip(res);
    }
  }
  let limit = 1000;
  if (req.query.limit !== undefined) {
    limit = validateLimit(req.query.limit);
    if (limit === undefined) {
      return badLimit(res);
    }
  }
  teams.find(query).project(teamHideSensitive).sort(sort).skip(skip).limit(limit).toArray()
    .then(teams => res.json(teams))
    .catch(err => {
      console.error(err);
      res.sendStatus(500);
    });
});
/*
app.get('/api/teams/:program/:id', (req, res) => {
  const program = encodeProgram(req.params.program.toLowerCase());
  const id = req.params.id;
  if (program === undefined) {
    return badProgram(res);
  }
  if (!isValidTeamId(id)) {
    return badId(res);
  }
  teams.find({'_id.prog': program, '_id.id': new RegExp(`^${id}$`, 'i')}).project(teamHideSensitive).sort({'_id.season': -1}).limit(1).toArray()
    .then(teams => {
      res.json(teams[0]);
    }).catch(err => {
      console.error(err);
      res.sendStatus(500);
    });
});

app.get('/api/program/:program/team/:id/stats', (req, res) => {
  const {program, id} = req.params;
  if (program != null && id != null) {
    const prog = encodeProgram(program.toLowerCase());
    if (prog && isValidTeamId(id)) {
      rankings.aggregate()
        .match({'_id.team.prog': prog, '_id.team.id': new RegExp(`^${id}$`, 'i'), opr: {$exists: true}})
        .lookup({from: 'events', localField: '_id.event', foreignField: '_id', as: 'event'})
        .unwind('$event')
        .sort({'event.end': -1, '_id.event': -1})
        .limit(1)
        .exec().then(rankings => {
          res.json(rankings[0]);
        });
    } else {
      res.sendStatus(404);
    }
  } else {
    res.sendStatus(400);
  }
});

app.get('/api/program/:program/season/:season/grade/:grade/skills', (req, res) => {
  let {program, season, grade} = req.params;
  if (program != null && season != null && grade != null) {
    program = encodeProgram(program.toLowerCase());
    season = encodeSeason(decodeURIComponent(season).toLowerCase());
    grade = encodeGrade(decodeURIComponent(grade).toLowerCase());
    if (program != null && season != null && grade > 0) {
      maxSkills.find({'team.prog': program, '_id.season': season, '_id.grade': grade})
        .populate('event.sku')
        .sort('_id.rank')
        .limit(50)
        .exec().then(maxSkills => {
          res.json(maxSkills);
        });
    } else {
      res.sendStatus(404);
    }
  } else {
    res.sendStatus(400);
  }
});
*/
MongoClient.connect(dbUri, mongoOptions).then(mongoClient => {
  db = mongoClient.db('heroku_x9cnpcwf');

  teams = db.collection('teams');
  events = db.collection('events');
  skills = db.collection('skills');
  matches = db.collection('matches');
  rankings = db.collection('rankings');
  maxSkills = db.collection('maxSkills');

  app.listen(port, () => console.info(`Listening on port ${port}`));
}).catch(console.error);

const programs = {
  vrc: 1,
  vexu: 4,
  viqc: 41
};

const programIds = Object.values(programs);

const encodeProgram = program => programs[program];

const seasons = {
  'bridge battle': -4,
  'elevation': -3,
  'clean sweep': 1,
  'round up': 7,
  'gateway': 73,
  'sack attack': 85,
  'toss up': 92,
  'skyrise': 102,
  'nothing but net': 110,
  'starstruck': 115,
  'in the zone': 119,
  'turning point': 125
};

const encodeSeason = season => seasons[season];

const grades = [
  'all',
  'elementary',
  'middle school',
  'high school',
  'college'
];

const encodeGrade = grade => grades.indexOf(grade);

const isValidTeamId = id => /^([0-9]{1,5}[A-Z]?|[A-Z]{2,5}[0-9]{0,2})$/i.test(id);

const isValidProgramId = program => programIds.includes(program);
