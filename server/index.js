const keys = require('./keys');

// Express App Setup
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
  port: keys.pgPort,
  ssl: { rejectUnauthorized: false },
});

pgClient.on('connect', (client) => {
  client
    .query('CREATE TABLE IF NOT EXISTS values (number INT)')
    .catch((err) => console.error(err));
});

// Redis Client Setup
const { createClient } = require('redis');

console.log('🔧 Redis config Server:', {
  host: keys.redisHost,
  port: keys.redisPort,
  tls: true
});

const redisClient = createClient({
  socket: {
    host: keys.redisHost,
    port: keys.redisPort,
    tls: true, 
    reconnectStrategy: () => 1000,
  },
});

redisClient.on('connect', () => console.log('✅ Redis Server socket connected'));
redisClient.on('ready', () => console.log('🚀 Redis Server client ready'));
redisClient.on('reconnecting', () => console.log('♻️ Redis Server reconnecting...'));
redisClient.on('error', (err) => console.error('❌ Redis Server error:', err));

let redisPublisher;

async function startServer() {
  await redisClient.connect();
  console.log(`✅ Connected to Redis at ${keys.redisHost}:${keys.redisPort}`);

  redisPublisher = redisClient.duplicate();
  await redisPublisher.connect();

  // Express route handlers

  app.get('/', (req, res) => {
    res.send('Hi');
  });

  app.get('/values/all', async (req, res) => {
    const values = await pgClient.query('SELECT * from values');
    res.send(values.rows);
  });

  app.get('/values/current', async (req, res) => {
    console.log('Received request to /values/current');
    try {
      const values = await redisClient.hGetAll('values');
      console.log('Redis values:', values);
      res.send(values);
    } catch (err) {
      console.error('Redis error:', err);
      res.status(500).send('Redis error');
    }
  });

  app.post('/values', async (req, res) => {
    const index = req.body.index;

    if (parseInt(index) > 40) {
      return res.status(422).send('Index too high');
    }

    await redisClient.hSet('values', index, 'Nothing yet!');
    await redisPublisher.publish('insert', index);
    pgClient.query('INSERT INTO values(number) VALUES($1)', [index]);

    res.send({ working: true });
  });

  app.get('/redis-test', async (req, res) => {
    try {
      const result = await redisClient.ping();
      console.log('✅ Redis ping success:', result);
      res.send(`Redis is working: ${result}`);
    } catch (err) {
      console.error('❌ Redis ping failed:', err);
      res.status(500).send('Redis is not connected');
    }
  });

  app.listen(5000, (err) => {
    console.log('Listening');
  });
}

startServer().catch((err) => {
  console.error('❌ Failed to start server:', err);
});
