import express from 'express';
import { getRadioStreamData } from '../services/directusService.js';

const router = express.Router();

router.get('/radio-streams', async (req, res) => {
	let streams = await getRadioStreamData();
	streams = streams.filter((stream) => stream.isStreamed);
	streams = streams.map((stream) => {
		return {
			...stream,
			listen_url: `http://stream.vyshka24.ru:80/${stream.listen_url}`,
		};
	});
	res.json(streams);
});

export const radioStreamController = router;
