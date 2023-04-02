import { createClient } from 'redis';

type SiteCategory = {
    id: number,
    name: string
}

type AddCategoryResults = {
    is_new: boolean,
    id: number
}

// define and connect redis client
const redis = createClient({
    url: 'redis://redis:6379'
});
redis.on('error', err => console.error('Encountered a redis client error:', err));
redis.connect();

async function fetchNextCategoryId() {
    let next_id = await redis.get('next_category_id');
    if (next_id == null) {
        await redis.set('next_category_id', 0);
        next_id = '0';
    }
    return parseInt(next_id);
}

/**
 * Adds a new category type to redis.
 *
 * If the category already exists, this does nothing.
 *
 * This operation runs in O(1) time complexity.
 * @param name The name to use for the category.
 */
export async function addCategoryType(name: string): Promise<AddCategoryResults> {
    // check if the category name actually exists so that
    // we don't accidentally override the id value
    const existing_id = await redis.zScore('categories', name);
    if (existing_id == null) {
        const id = await fetchNextCategoryId();
        await redis.multi()
            .zAdd('categories', {
                score: id,
                value: name
            })
            .incr('next_category_id')
            .exec();

        return {
            is_new: true,
            id
        };
    }

    return {
        is_new: false,
        id: existing_id
    };
}

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

/**
 * Returns whether a given authorization header value is a valid admin key or not.
 * @param authorization The authorization header value.
 * @returns Whether the given header value is a valid admin key.
 */
export async function checkAdminAuth(authorization?: string) {
    if (!authorization) return false;

    return await redis.sIsMember('admin_keys', authorization);
}
