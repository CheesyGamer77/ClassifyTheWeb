import express from 'express';
import { addCategoryType, upsertSiteClassification, checkAdminAuth, fetchCategoryTypes, isValidCategoryId, fetchSiteClassification } from './db';

const app = express().use(express.json());

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
        if (!is_admin) {
            return await res.sendStatus(401);
        }

        const add_results = await addCategoryType(req.body.name);
        const res_body = { id: add_results.id, name: req.body.name };
        if (!add_results.is_new) {
            return await res.status(409).json(res_body);
        }

        await res.status(200).json(res_body);
    });

app.route('/sites')
    .get(async (req, res) => {
        const results = await fetchSiteClassification(req.body.domain);
        const { exists, data } = results;
        if (!exists) {
            return await res.sendStatus(404);
        }

        return await res.status(200).json(data);
    })
    .post(async (req, res) => {
        const is_admin = await checkAdminAuth(req.headers.authorization);
        if (!is_admin) {
            return await res.sendStatus(401);
        }

        // ensure the provided category is valid
        const category_id = req.body.category;
        const exists = await isValidCategoryId(category_id);
        if (!exists) {
            return await res.sendStatus(400);
        }

        const results = await upsertSiteClassification(req.body.domain, category_id);
        if (!results.is_new) {
            return await res.status(409).json(results.data);
        }
    });

app.listen(3000, () => console.log('Server started'));
