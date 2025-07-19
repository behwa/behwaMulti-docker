const { createClient } = require('redis');
const keys = require('./keys');

console.log('Connecting to Redis at', keys.redisHost, keys.redisPort);

// Create Redis client with TLS
const redisClient = createClient({
  url: `rediss://${keys.redisHost}:${keys.redisPort}`, // rediss:// enables TLS
  socket: {
    reconnectStrategy: () => 1000,
  },
});

redisClient.on('error', (err) => {
  console.error('❌ Redis connection error in worker:', err);
});

redisClient.on('connect', () => {
  console.log('✅ Redis connected successfully in worker');
});

await redisClient.connect();

// Duplicate client for subscriber
const sub = redisClient.duplicate();

sub.on('error', (err) => {
  console.error('❌ Redis SUB error:', err);
});

await sub.connect();

// Fibonacci logic
function fib(index) {
  if (index < 2) return 1;
  return fib(index - 1) + fib(index - 2);
}

// Subscribe and respond
await sub.subscribe('insert', async (message) => {
  console.log(`📨 Received message ${message} on 'insert' channel`);
  await redisClient.hSet('values', message, fib(parseInt(message)));
});
