import express from 'express';
import { addCategoryType, fetchCategoryTypes } from './db';

const app = express().use(express.json());

app.get('/check', async (_, res) => {
    res.sendStatus(200);
});

app.route('/categories')
    .get(async (_, res) => {
        const body = await fetchCategoryTypes();
        await res.status(200).json(body);
    })
    // TODO: Require admin auth
    .post(async (req, res) => {
        const add_results = await addCategoryType(req.body.name);
        const res_body = { id: add_results.id, name: req.body.name };
        if (!add_results.is_new) {
            return await res.status(409).json(res_body);
        }

        await res.status(200).json(res_body);
    });

app.listen(3000, () => console.log('Server started'));
