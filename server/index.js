// all logic need to redis connect to PostgreSQL
const keys = require('./keys');

// express app setup
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Postgres Client Setup
const { Pool } = require('pg');
const pgClient = new Pool({
  user: keys.pgUser,
  host: keys.pgHost,
  database: keys.pgDatabase,
  password: keys.pgPassword,
  port: keys.pgPort
});

pgClient.on('error', () => console.log('Lost PG Connection') );

// create a table store all value.
// pgClient
//   .query('CREATE TABLE IF NOT EXISTS values (number INT)')
//   .then(() => console.log('Postgres table ensured'))
//   .catch((err) => console.log('Error creating table:', err));

// Redis client setup
const redis = require('redis');
const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000
});

const redisPublisher = redisClient.duplicate();

//Express route handlers
app.get('/', (req, res) => {
  res.send('Hi');
})

app.get('/values/all', async (req, res) => {
  const xvalues = await pgClient.query("CREATE TABLE IF NOT EXISTS values(number INT)");
  const values = await pgClient.query('SELECT * from "values"');

  res.send(values.rows);

});

app.post('/values', async (req, res) => {
  const index = req.body.index;

  if (parseInt(index) > 40) {
    return res.status(422).send('Index too high');
  }

  redisClient.hset('values', index, 'Nothing yet!');
  redisPublisher.publish('insert', index);

  try {
    await pgClient.query('INSERT INTO "values"(number) VALUES($1)', [index]);
  } catch (err) {
    console.error('Error inserting into Postgres:', err);
    return res.status(500).send('Database error');
  }

  res.send({ working: true });
});

app.get('/values/current', async (req, res) => {
  redisClient.hgetall('values', (err, values) => {
    if (err) {
      console.error('Error fetching from Redis:', err);
      return res.status(500).send('Redis error');
    }
    res.send(values);
  });
});


app.listen(5000, err => {
  console.log('Listening')
})




