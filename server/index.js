import compression from 'compression';
import express from 'express';
import { MongoClient } from 'mongodb';
import path from 'path';

const app = express();
const router = express.Router();
const port = process.env.PORT || 5000;
const dbUri = process.env.WEBSITE_DB || '';
const mongoOptions = {
  retryWrites: true,
  useNewUrlParser: true,
  useUnifiedTopology: true
};

let db, teams, events, skills, matches, rankings, awards, maxSkills;

const badQuery = (res, msg) => res.status(400).send(`Query Error: ${msg}`);
const notFound = (res, msg) => res.status(404).send(`Not Found: ${msg}`);
const serverError = (res, err) => {
  console.error(err);
  res.status(500).send(`Server Error: ${err}`);
};

const badId = res => badQuery(res, 'id requires a TeamId');
const badProgram = res => badQuery(res, 'program requires a ProgramId');
const badSeason = res => badQuery(res, 'season requires a SeasonId');
const badSku = res => badQuery(res, 'sku requires an EventSku');
const badSkip = res => badQuery(res, 'skip requires a positive integer');
const badLimit = res => badQuery(res, `limit requires an integer between 1 and ${maxLimit}`);

const teamHideSensitive = {address: 0, emergPhone: 0, contact: 0, contact2: 0, finance: 0};

const validateId = id => isValidTeamId(id) ? new RegExp(`^${id}$`, 'i') : undefined;

const validateProgram = program => {
  const programNum = Number(program);
  return isValidProgramId(programNum) ? programNum : encodeProgram(program.toLowerCase());
};

const validateSeason = season => {
  const seasonNum = Number(season);
  return isValidSeasonId(seasonNum) ? seasonNum : encodeSeason(season.toLowerCase());
};

const validateSku = sku => isValidEventSku(sku) ? sku.toUpperCase() : undefined;

const validateSkip = skip => {
  const skipNum = Number(skip);
  return (Number.isInteger(skipNum) && skipNum >= 0) ? skipNum : undefined;
};

const maxLimit = 1000;
const validateLimit = limit => {
  const limitNum = Number(limit);
  return (Number.isInteger(limitNum) && limitNum >= 1 && limitNum <= maxLimit) ? limitNum : undefined;
};

app.use(compression());
app.use('/api', router);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '..')));
  app.get('*', (_, res) => res.sendFile(path.join(__dirname, '../index.html')));
}

router.get('/teams', (req, res) => {
  const aggregate = [];
  const match = {};
  const sort = {};
  const collation = {locale: 'en', numericOrdering: true};
  const group = {};
  const project = teamHideSensitive;
  let skip = 0;
  let limit = 1000;

  if (req.query.program !== undefined) {
    const program = validateProgram(req.query.program);
    if (program === undefined) {
      return badProgram(res);
    }
    match['_id.program'] = program;
  }
  if (req.query.id !== undefined) {
    const id = validateId(req.query.id);
    if (id === undefined) {
      return badId(res);
    }
    match['_id.id'] = id;
  }
  if (req.query.season !== undefined) {
    const season = validateSeason(req.query.season);
    if (season === undefined) {
      return badSeason(res);
    }
    match['_id.season'] = season;
  }
  if (req.query.sort !== undefined) {
    const fields = req.query.sort.split(',');
    for (let field of fields) {
      const sign = field.charAt(0);
      let order = 1;
      if (sign === '-') {
        field = field.slice(1);
        order = -1;
      }
      if (!['program', 'id', 'season'].includes(field)) {
        return badQuery(res, `invalid sort field "${field}"`);
      }
      if (['program', 'id', 'season'].includes(field)) {
        field = `_id.${field}`;
      }
      sort[field] = order;
    }
  }
  if (req.query.search !== undefined) {
    match['_id.id'] = new RegExp(`^${req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i');
    group._id = {program: '$_id.program', id: '$_id.id'};
    group.data = {$first: '$$ROOT'};
    if (req.query.sort !== undefined) {
      aggregate.push({$sort: sort});
    }
    aggregate.push({$match: match}, {$group: group});
    if (req.query.sort !== undefined) {
      aggregate.push({$sort: sort});
    }
    aggregate.push({$replaceRoot: {newRoot: '$data'}});
    /*query.$text = {$search: req.query.search};
    projection.score = {$meta: 'textScore'};
    sort.score = {$meta: 'textScore'};*/
  } else {
    aggregate.push({$match: match});
    if (req.query.sort !== undefined) {
      aggregate.push({$sort: sort});
    }
  }
  if (req.query.skip !== undefined) {
    skip = validateSkip(req.query.skip);
    if (skip === undefined) {
      return badSkip(res);
    }
  }
  if (req.query.limit !== undefined) {
    limit = validateLimit(req.query.limit);
    if (limit === undefined) {
      return badLimit(res);
    }
  }
  aggregate.push({$project: project}, {$skip: skip}, {$limit: limit});
  teams.aggregate(aggregate, {collation}).toArray()
    .then(teams => res.json(teams))
    .catch(err => serverError(res, err));
});

router.get('/teams/:program/:id/:season', (req, res) => {
  const program = validateProgram(req.params.program);
  if (program === undefined) {
    return badProgram(res);
  }
  const id = validateId(req.params.id);
  if (id === undefined) {
    return badId(res);
  }
  const season = validateSeason(req.params.season);
  if (season === undefined) {
    return badSeason(res);
  }
  teams.find({_id: {program, id, season}}).project(teamHideSensitive).limit(1).toArray()
    .then(teams => {
      if (teams.length === 0) {
        return notFound(res);
      }
      res.json(teams[0]);
    }).catch(err => serverError(res, err));
});

router.get('/events', (req, res) => {
  const query = {};
  const projection = {};
  const sort = {};
  let skip = 0;
  let limit = 1000;

  if (req.query.sku !== undefined) {
    const sku = validateSku(req.query.sku);
    if (sku === undefined) {
      return badSku(res);
    }
    query._id = sku;
  }
  if (req.query.program !== undefined) {
    const program = validateProgram(req.query.program);
    if (program === undefined) {
      return badProgram(res);
    }
    query.program = program;
  }
  if (req.query.season !== undefined) {
    const season = validateSeason(req.query.season);
    if (season === undefined) {
      return badSeason(res);
    }
    query.season = season;
  }
  if (req.query.teams !== undefined) {
    const teams = [];
    for (const team of req.query.teams.split(',')) {
      const id = validateId(team);
      if (id === undefined) {
        return badId(res);
      }
      teams.push(id);
    }
    query.teams = {$all: teams};
  }
  if (req.query.search !== undefined) {
    query.$text = req.query.search;
    projection.score = {$meta: 'textScore'};
    sort.score = {$meta: 'textScore'};
  }
  if (req.query.sort !== undefined) {
    const fields = req.query.sort.split(',');
    for (let field of fields) {
      const sign = field.charAt(0);
      let order = 1;
      if (sign === '-') {
        field = field.slice(1);
        order = -1;
      }
      if (!['sku', 'start', 'end'].includes(field)) {
        return badQuery(res, `invalid sort field "${field}"`);
      }
      if (field === 'sku') {
        field = '_id';
      }
      sort[field] = order;
    }
  }
  if (req.query.skip !== undefined) {
    skip = validateSkip(req.query.skip);
    if (skip === undefined) {
      return badSkip(res);
    }
  }
  if (req.query.limit !== undefined) {
    limit = validateLimit(req.query.limit);
    if (limit === undefined) {
      return badLimit(res);
    }
  }
  events.find(query).project(projection).sort(sort).skip(skip).limit(limit).toArray()
    .then(events => res.json(events))
    .catch(err => serverError(res, err));
});

router.get('/events/:sku', (req, res) => {
  const sku = validateSku(req.params.sku);
  if (sku === undefined) {
    return badSku(res);
  }
  events.find({_id: sku}).limit(1).toArray()
    .then(events => {
      if (events.length === 0) {
        return notFound(res, 'SKU not found');
      }
      res.json(events[0]);
    }).catch(err => serverError(res, err));
});

router.get('/matches', (req, res) => {
  const query = {};
  const projection = {};
  const sort = {};
  let skip = 0;
  let limit = 1000;

  if (req.query.event !== undefined) {
    const event = validateSku(req.query.event);
    if (event === undefined) {
      return badSku(res);
    }
    query['_id.event'] = event;
  }
  if (req.query.program !== undefined) {
    const program = validateProgram(req.query.program);
    if (program === undefined) {
      return badProgram(res);
    }
    query.program = program;
  }
  if (req.query.season !== undefined) {
    const season = validateSeason(req.query.season);
    if (season === undefined) {
      return badSeason(res);
    }
    query.season = season;
  }
  if (req.query.teams !== undefined) {
    const teams = [];
    for (const team of req.query.teams.split(',')) {
      const id = validateId(team);
      if (id === undefined) {
        return badId(res);
      }
      teams.push(id);
    }
    query.$or = [
      {red: {$in: teams}},
      {blue: {$in: teams}}
    ];
  }
  if (req.query.search !== undefined) {
    query.$text = req.query.search;
    projection.score = {$meta: 'textScore'};
    sort.score = {$meta: 'textScore'};
  }
  if (req.query.sort !== undefined) {
    const fields = req.query.sort.split(',');
    for (let field of fields) {
      const sign = field.charAt(0);
      let order = 1;
      if (sign === '-') {
        field = field.slice(1);
        order = -1;
      }
      if (!['event', 'start', 'end'].includes(field)) {
        return badQuery(res, `invalid sort field "${field}"`);
      }
      if (['event'].includes(field)) {
        field = `_id.${field}`;
      }
      sort[field] = order;
    }
  }
  if (req.query.skip !== undefined) {
    skip = validateSkip(req.query.skip);
    if (skip === undefined) {
      return badSkip(res);
    }
  }
  if (req.query.limit !== undefined) {
    limit = validateLimit(req.query.limit);
    if (limit === undefined) {
      return badLimit(res);
    }
  }
  matches.find(query).project(projection).sort(sort).skip(skip).limit(limit).toArray()
    .then(teams => res.json(teams))
    .catch(err => serverError(res, err));
});

router.get('/rankings', (req, res) => {
  const query = {};
  const projection = {};
  const sort = {};
  let skip = 0;
  let limit = 1000;

  if (req.query.event !== undefined) {
    const event = validateSku(req.query.event);
    if (event === undefined) {
      return badSku(res);
    }
    query['_id.event'] = event;
  }
  if (req.query.program !== undefined) {
    const program = validateProgram(req.query.program);
    if (program === undefined) {
      return badProgram(res);
    }
    query['_id.team.program'] = program;
  }
  if (req.query.season !== undefined) {
    const season = validateSeason(req.query.season);
    if (season === undefined) {
      return badSeason(res);
    }
    query['_id.team.season'] = season;
  }
  if (req.query.sort !== undefined) {
    const fields = req.query.sort.split(',');
    for (let field of fields) {
      const sign = field.charAt(0);
      let order = 1;
      if (sign === '-') {
        field = field.slice(1);
        order = -1;
      }
      if (!['opr', 'dpr', 'ccwm'].includes(field)) {
        return badQuery(res, `invalid sort field "${field}"`);
      }
      sort[field] = order;
    }
  }
  if (req.query.skip !== undefined) {
    skip = validateSkip(req.query.skip);
    if (skip === undefined) {
      return badSkip(res);
    }
  }
  if (req.query.limit !== undefined) {
    limit = validateLimit(req.query.limit);
    if (limit === undefined) {
      return badLimit(res);
    }
  }
  rankings.find(query).project(projection).sort(sort).skip(skip).limit(limit).toArray()
    .then(teams => res.json(teams))
    .catch(err => serverError(res, err));
});

router.get('/rankings/:event/:team', (req, res) => {
  const event = validateSku(req.params.event);
  if (event === undefined) {
    return badSku(res);
  }
  const id = validateId(req.params.team);
  if (id === undefined) {
    return badId(res);
  }
  rankings.find({'_id.event': event, 'team.id': id}).limit(1).toArray()
    .then(rankings => {
      if (rankings.length === 0) {
        return notFound(res, 'Ranking not found');
      }
      res.json(rankings[0]);
    }).catch(err => serverError(res, err));
});

router.get('/awards', (req, res) => {
  const query = {};
  const projection = {};
  const sort = {};
  let skip = 0;
  let limit = 1000;

  if (req.query.event !== undefined) {
    const event = validateSku(req.query.event);
    if (event === undefined) {
      return badSku(res);
    }
    query['_id.event'] = event;
  }
  if (req.query.teams !== undefined) {
    const teams = [];
    for (const team of req.query.teams.split(',')) {
      const id = validateId(team);
      if (id === undefined) {
        return badId(res);
      }
      teams.push(id);
    }
    query['team.id'] = {$in: teams};
  }
  awards.find(query).project(projection).sort(sort).skip(skip).limit(limit).toArray()
    .then(teams => res.json(teams))
    .catch(err => serverError(res, err));
});

router.get('*', (_, res) => notFound(res, 'no such endpoint'));
/*
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
  db = mongoClient.db('vexdata');

  teams = db.collection('teams');
  events = db.collection('events');
  skills = db.collection('skills');
  matches = db.collection('matches');
  rankings = db.collection('rankings');
  awards = db.collection('awards');
  maxSkills = db.collection('maxSkills');

  app.listen(port, () => console.info(`Listening on port ${port}`));
}).catch(console.error);

const programs = {
  vrc: 1,
  vexu: 4,
  viqc: 41
};

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
  'turning point': 125,
  'tower takeover': 130
};

const grades = [
  'all',
  'elementary',
  'middle school',
  'high school',
  'college'
];

const programIds = Object.values(programs);
const seasonIds = Object.values(seasons);

const encodeProgram = program => programs[program];
const encodeSeason = season => seasons[season];
const encodeGrade = grade => grades.indexOf(grade);

const isValidTeamId = id => /^([0-9]{1,5}[A-Z]?|[A-Z]{2,5}[0-9]{0,2})$/i.test(id);
const isValidProgramId = program => programIds.includes(program);
const isValidSeasonId = season => seasonIds.includes(season);
const isValidEventSku = sku => /^RE-(?:VRC|VEXU|VIQC|TSA)-[0-9]{2}-[0-9]{4}$/i.test(sku);
