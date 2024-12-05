import {
	getRadioStreamData,
	updateRadioStream,
} from '../services/directusService.js';
import { fetchIcecastData } from '../services/icecastService.js';
import { decodeWithFallback } from '../utils/decoder.js';

const icecastUrl = 'https://stream.vyshka24.ru/status-json.xsl';

// Извлечение окончания URL
function extractStreamKey(listenUrl) {
	const urlParts = listenUrl.split('/');
	return urlParts[urlParts.length - 1]; // Возвращает последний сегмент
}

// Функция синхронизации данных
export async function syncStreamsWithIcecast() {
	try {
		// Получаем данные с Icecast
		const icecastData = await fetchIcecastData(icecastUrl);

		// Получаем существующие записи из Directus
		const existingStreams = await getRadioStreamData();

		const icecastSources = icecastData.icestats.source;

		// Извлекаем все listen_url из Icecast
		const icecastStreamKeys = icecastSources.map((stream) =>
			extractStreamKey(stream.listenurl)
		);

		// Сопоставляем данные с Icecast с записями в Directus
		for (const record of existingStreams) {
			const streamKey = extractStreamKey(record.listen_url);

			// Проверяем, есть ли поток в Icecast
			const isStreamed = icecastStreamKeys.includes(streamKey);

			// Обновляем поле isStreamed
			await updateRadioStream(record.listen_url, {
				isStreamed,
			});

			// Если поток есть, обновляем остальные поля
			if (isStreamed) {
				const matchingSource = icecastSources.find(
					(stream) => extractStreamKey(stream.listenurl) === streamKey
				);

				const decodedTitle = matchingSource.title
					? decodeWithFallback(Buffer.from(matchingSource.title, 'binary'))
					: null;
				const [artist, title] = decodedTitle
					? decodedTitle.split(' - ')
					: ['Прямой эфир', null];

				await updateRadioStream(record.listen_url, {
					listeners: matchingSource.listeners,
					artist: artist?.trim(),
					title: title?.trim(),
					date_updated: new Date().toISOString(),
				});
			}
		}
	} catch (error) {
		console.error('Ошибка при синхронизации данных с Icecast:', error);
	}
}

// Функция для запуска цикла синхронизации
export function startStreamSync(io, interval = 5000) {
	const syncAndNotify = async () => {
		await syncStreamsWithIcecast();
		let updatedStreams = await getRadioStreamData(); // Получаем актуальные данные из Directus
		updatedStreams = updatedStreams.filter((stream) => stream.isStreamed);
		updatedStreams = updatedStreams.map((stream) => {
			return {
				...stream,
				listen_url: `http://stream.vyshka24.ru:80/${stream.listen_url}`,
			};
		});
		io?.emit('radio-streams', updatedStreams);
	};

	syncAndNotify(); // Первый запуск
	setInterval(syncAndNotify, interval); // Повторный запуск каждые 5 секунд
}
