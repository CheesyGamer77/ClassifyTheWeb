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
    const existing_id = await redis.zScore('categories', name);
    const is_new = existing_id == null;
    if (is_new) {
        const id = await fetchNextCategoryId();
        await redis.multi()
            .zAdd('categories', {
                score: id,
                value: name
            })
            .incr('next_category_id')
            .exec();

        return { is_new, id };
    }

    return {
        is_new,
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

/**
 * Returns whether a given category id exists or not.
 * @param category_id The id to test.
 * @returns Whether a site category is associated with the id.
 */
export async function isValidCategoryId(category_id: number) {
    return (await redis.zRange('categories', category_id, category_id, { BY: 'SCORE' })).length !== 0;
}

function getSiteKey(domain: string) {
    return `sites:${domain}` as const;
}

async function classificationExists(domain: string) {
    const key = getSiteKey(domain);
    const exists = await redis.exists(key);
    return exists !== 0;
}

/**
 * Returns the classification of a given site.
 *
 * If the provided domain does not have a classification associated with it,
 * this will only return a JSON object with `exists: false`.
 * @param domain The domain to check the classification of. Must be a valid domain.
 * @returns Whether the classification exists, and the classification data.
 */
export async function fetchSiteClassification(domain: string) {
    const key = getSiteKey(domain);
    const exists = await classificationExists(domain);
    if (!exists) {
        return { exists };
    }

    const existing_data = await redis.hGetAll(key);
    return {
        exists,
        data: {
            domain: existing_data['domain'],
            category: parseInt(existing_data['category']),
            added_at: parseInt(existing_data['added_at'])
        }
    };
}

/**
 * Upserts a site classification to the database.
 *
 * If the provided category id is invalid, this does nothing.
 *
 * If the provided domain already has a classification, this will do nothing unless `overwrite` is set to `true`.
 *
 * @param domain The domain to set the classification of.
 * @param category_id The category id to set the domain classification to.
 * @param overwrite Whether to overwrite the classification of the given domain or not.
 * @returns The classification stored, and whether the classification was overwriten or not.
 */
export async function upsertSiteClassification(domain: string, category_id: number, overwrite?: boolean) {
    const new_data = {
        domain,
        category: category_id,
        added_at: Date.now()
    };

    const key = getSiteKey(domain);
    const is_new = !(await classificationExists(domain));

    if (is_new || overwrite) {
        await redis.hSet(key, new_data);
        return {
            is_new,
            data: new_data
        };
    } else {
        const existing_data = await fetchSiteClassification(domain);
        return {
            is_new,
            data: existing_data.data
        };
    }
}
