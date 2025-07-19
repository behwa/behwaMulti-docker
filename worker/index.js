const key = require('./keys');
const redis = require('redis');

console.log('Connecting to Redis at', key.redisHost, key.redisPort);

const redisClient = redis.createClient({
  host: key.redisHost,
  port: key.redisPort,
  retry_strategy: (options) => {
    console.error('Redis retry strategy called. Error:', options.error);
    return 1000;
  }
});

redisClient.on('connect', () => {
  console.log('✅ Redis connected successfully in worker');
});

redisClient.on('error', (err) => {
  console.error('❌ Redis connection error in worker:', err);
});

const sub = redisClient.duplicate();

function fib(index) {
  if (index < 2) return 1;
  return fib(index - 1) + fib(index - 2);
}

sub.on('message', (channel, message) => {
  console.log(`Received message ${message} on channel ${channel}`);
  redisClient.hset('values', message, fib(parseInt(message)));
});

sub.subscribe('insert', () => {
  console.log('Subscribed to insert channel');
});
