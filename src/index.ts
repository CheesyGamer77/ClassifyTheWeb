import express from 'express';

const app = express();

app.get('/check', async (_, res) => {
    res.sendStatus(200);
});

app.listen(3000, () => console.log('Server started'));
