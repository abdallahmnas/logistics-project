import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redisUrl = process.env.REDIS_URL;
const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);
const redisUsername = process.env.REDIS_USERNAME || undefined;
const redisPassword = process.env.REDIS_PASSWORD || undefined;

export const redisClient = redisUrl
  ? new Redis(redisUrl, {
      lazyConnect: true,
      maxRetriesPerRequest: 3,
    })
  : new Redis({
      host: redisHost,
      port: redisPort,
      username: redisUsername,
      password: redisPassword,
      lazyConnect: true,
      maxRetriesPerRequest: 3,
    });

redisClient.on('connect', () => {
  console.log(' Redis client connected successfully.');
});

redisClient.on('error', (err) => {
  console.warn(' Redis connection warning:', err.message);
});

export const connectRedis = async (): Promise<boolean> => {
  try {
    await redisClient.connect();
    return true;
  } catch (error) {
    console.warn(' Could not connect to Redis (running in fallback mode):', (error as Error).message);
    return false;
  }
};
