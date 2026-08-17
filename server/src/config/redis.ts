import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);

export const redisClient = new Redis({
  host: redisHost,
  port: redisPort,
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
