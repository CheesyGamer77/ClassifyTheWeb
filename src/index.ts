import express from 'express';
import { addCategoryType, upsertSiteClassification, checkAdminAuth, fetchCategoryTypes, isValidCategoryId, fetchSiteClassification, bulkUpdateSiteClassification } from './db';

const app = express().use(express.json({ limit: '50mb' }));

app.get('/check', async (_, res) => {
    res.sendStatus(200);
});

app.route('/categories')
    .get(async (_, res) => {
        const body = await fetchCategoryTypes();
        await res.status(200).json(body);
    })
    .post(async (req, res) => {
        const is_admin = await checkAdminAuth(req.headers.authorization);
        if (!is_admin) return await res.sendStatus(401);

        const add_results = await addCategoryType(req.body.name);
        const res_body = { id: add_results.id, name: req.body.name };
        if (!add_results.is_new) return await res.status(409).json(res_body);

        await res.status(200).json(res_body);
    });

app.route('/sites')
    .get(async (req, res) => {
        const results = await fetchSiteClassification(req.query.domain as string);
        const { exists, data } = results;
        if (!exists) return await res.sendStatus(404);

        await res.status(200).json(data);
    })
    .post(async (req, res) => {
        const is_admin = await checkAdminAuth(req.headers.authorization);
        if (!is_admin) return await res.sendStatus(401);

        // ensure the provided category is valid
        const category_id = parseInt(req.body.category);
        if (isNaN(category_id)) return await res.sendStatus(400);

        const exists = await isValidCategoryId(category_id);
        if (!exists) return await res.sendStatus(400);

        const results = await upsertSiteClassification(req.body.domain, category_id);
        if (!results.is_new) return await res.status(409).json(results.data);

        await res.status(200).json(results.data);
    })
    .put(async (req, res) => {
        const is_admin = await checkAdminAuth(req.headers.authorization);
        if (!is_admin) return await res.sendStatus(401);

        const category_id = parseInt(req.body.category);
        if (isNaN(category_id)) return await res.sendStatus(400);

        const is_valid_category = await isValidCategoryId(category_id);
        if (!is_valid_category) return await res.sendStatus(400);

        const results = await bulkUpdateSiteClassification(req.body.domains, category_id);

        await res.status(200).json(results);
    });

app.listen(3000, () => console.log('Server started'));
