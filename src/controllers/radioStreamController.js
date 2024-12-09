import express from 'express';
import { getRadioStreamData } from '../services/directusService.js';

const router = express.Router();

router.get('/radio-streams', async (req, res) => {
	let streams = await getRadioStreamData();
	streams = streams.filter((stream) => stream.isStreamed);
	res.json(streams);
});

export const radioStreamController = router;
