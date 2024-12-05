import express from 'express';
import { getPosters } from '../services/directusService.js';

const router = express.Router();

router.get('/posters', async (req, res) => {
	try {
		const posters = await getPosters();
		res.json(posters);
	} catch (error) {
		console.error('Ошибка при получении данных из Directus:', error);
		res.status(500).json({ error: 'Внутренняя ошибка сервера.' });
	}
});

export const postersController = router;
