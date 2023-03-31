import { createClient } from 'redis';

type SiteCategory = {
    id: number,
    name: string
}

// define and connect redis client
const redis = createClient({
    url: 'redis://redis:6379'
});
redis.on('error', err => console.error('Encountered a redis client error:', err));
redis.connect();

/**
 * Returns all of the valid category types.
 *
 * This operation runs in O(log(N)+M) time complexity.
 */
export async function fetchCategoryTypes(): Promise<SiteCategory[]> {
    return (await redis.zRangeWithScores('categories', 0, -1))
        .map(obj => {
            return { id: obj.score, name: obj.value };
        });
}
