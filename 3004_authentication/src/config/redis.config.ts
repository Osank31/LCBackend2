import { createClient, RedisClientType } from 'redis';
import { InternalServerError } from '../utils/errors/AppError';

let client: RedisClientType;

export const redisConnect = async () => {
    client = createClient({
        socket: {
            host: 'localhost',
            port: 6379
        }
    });

    client.on('error', (err: Error) => {
        console.log('Redis Client Error', err);
    });

    await client.connect();

    console.log("Redis connected successfully");
};

export const getRedisClient = () => {
    if (!client) {
        throw new InternalServerError("Redis Client not found");
    }

    return client;
};