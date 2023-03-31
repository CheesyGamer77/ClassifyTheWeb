import express from 'express';
import { fetchCategoryTypes } from './db';

const app = express();

app.get('/check', async (_, res) => {
    res.sendStatus(200);
});

app.route('/categories')
    .get(async (_, res) => {
        const body = await fetchCategoryTypes();
        await res.status(200).json(body);
    });

app.listen(3000, () => console.log('Server started'));
