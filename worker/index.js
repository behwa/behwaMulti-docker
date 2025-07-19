const keys = require('./keys');
const { createClient } = require('redis');

const redisClient = createClient({
  socket: {
    host: keys.redisHost,
    port: keys.redisPort,
    tls: true, 
    reconnectStrategy: () => 1000,
  }
});

const sub = redisClient.duplicate();

function fib(index) {
  if (index < 2) return 1;
  return fib(index - 1) + fib(index - 2);
}

(async () => {
  try {
    await redisClient.connect();
    await sub.connect();

    console.log('✅ Connected to Redis');

    await sub.subscribe('insert', async (message) => {
      const value = fib(parseInt(message));
      await redisClient.hSet('values', message, value);
      console.log(`Calculated fib(${message}) = ${value}`);
    });
  } catch (err) {
    console.error('❌ Redis connection error:', err);
  }
})();
