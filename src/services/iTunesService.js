import axios from 'axios';

const ITUNES_API_URL = 'https://itunes.apple.com/search';

// Поиск трека в iTunes
export const fetchTrackCover = async (artist, title) => {
	try {
		// Формируем запрос к iTunes API
		const response = await axios.get(ITUNES_API_URL, {
			params: {
				term: `${artist} ${title}`, // Запрос: артист + название
				media: 'music', // Тип контента: музыка
				limit: 1, // Ограничение на количество результатов
			},
		});

		// Проверяем, есть ли результаты
		const track = response.data.results[0];
		if (!track || !track.artworkUrl100) {
			return null; // Обложка не найдена
		}

		// Возвращаем URL обложки
		return track.artworkUrl100.replace('100x100', '600x600'); // Больше разрешение
	} catch (error) {
		console.error('Ошибка при запросе обложки через iTunes API:', error);
		return null;
	}
};
