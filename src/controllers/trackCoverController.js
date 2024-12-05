import express from 'express';
import { fetchTrackCover } from '../services/iTunesService.js';

const router = express.Router();

router.get('/track-cover', async (req, res) => {
	const { artist, title } = req.query;

	if (!artist || !title) {
		return res
			.status(400)
			.json({ error: 'Параметры artist и title обязательны.' });
	}

	try {
		const coverUrl = await fetchTrackCover(artist, title);

		if (!coverUrl) {
			return res.status(404).json({ error: 'Обложка для трека не найдена.' });
		}

		res.json({ coverUrl });
	} catch (error) {
		console.error('Ошибка при запросе обложки трека:', error);
		res.status(500).json({ error: 'Внутренняя ошибка сервера.' });
	}
});

export const trackCoverController = router;
