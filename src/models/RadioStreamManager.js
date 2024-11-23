import {
	getRadioStreamData,
	updateRadioStream,
	createRadioStream,
} from '../services/directusService.js';
import { fetchIcecastData } from '../services/icecastService.js';
import { decodeWithFallback } from '../utils/decoder.js';

class RadioStreamManager {
	constructor(io) {
		this.streams = [];
		this.icecastUrl = 'https://stream.vyshka24.ru/status-json.xsl';
		this.io = io; // Экземпляр socket.io
		this.startUpdating();
	}

	async fetchStreams() {
		try {
			// Получаем данные с Icecast
			const icecastData = await fetchIcecastData(this.icecastUrl);

			// Получаем существующие записи в Directus
			const existingStreams = await getRadioStreamData();

			const icecastSources = icecastData.icestats.source;

			// Добавляем недостающие записи в Directus
			const missingCount = icecastSources.length - existingStreams.length;
			if (missingCount > 0) {
				for (let i = 0; i < missingCount; i++) {
					await createRadioStream({
						listenUrl: null,
						listeners: 0,
						serverUrl: null,
						artist: null,
						title: null,
					});
				}
			}

			// Обновляем записи
			const updatedStreams = await Promise.all(
				icecastSources.map(async (stream, index) => {
					const decodedTitle = stream.title
						? decodeWithFallback(Buffer.from(stream.title, 'binary'))
						: 'Прямой эфир';
					const [artist, title] = decodedTitle
						? decodedTitle.split(' - ')
						: ['Прямой', 'эфир'];

					// Подготовка данных для обновления
					const radioStreamData = {
						id: existingStreams[index]?.id || null,
						listenUrl: stream.listenurl,
						listeners: stream.listeners,
						serverUrl: stream.server_url,
						artist: artist?.trim(),
						title: title?.trim(),
					};

					// Обновляем запись в Directus
					if (existingStreams[index]) {
						await updateRadioStream(existingStreams[index].id, radioStreamData);
					}

					return radioStreamData;
				})
			);

			// Обновляем локальное состояние
			this.streams = updatedStreams;

			// Уведомляем всех клиентов через WebSocket
			this.io?.emit('radio-streams', this.streams);
		} catch (error) {
			console.error('Ошибка при запросе данных с Icecast:', error);
		}
	}

	startUpdating() {
		this.fetchStreams();
		setInterval(() => this.fetchStreams(), 5000); // Обновление данных каждые 5 секунд
	}
}

export default RadioStreamManager;
