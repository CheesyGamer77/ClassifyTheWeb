import { createClient } from 'redis';

// define and connect redis client
const redis = createClient();
redis.on('error', err => console.error('Encountered a redis client error:', err));
await redis.connect();
