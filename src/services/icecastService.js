import axios from 'axios';
import { decodeWithFallback } from '../utils/decoder.js';

export async function fetchIcecastData(url) {
	try {
		const response = await axios.get(url, { responseType: 'arraybuffer' });
		const buffer = Buffer.from(response.data, 'binary');
		let decodedData = decodeWithFallback(buffer);

		// Коррекция данных JSON
		let correctedData = decodedData.replace(/:\s*-\s*([,}])/g, ':""$1');
		correctedData = correctedData.replace(/:\s*-\s*]/g, ':""]');

		return JSON.parse(correctedData);
	} catch (error) {
		console.error('Ошибка при запросе данных с Icecast:', error);
		throw error;
	}
}
