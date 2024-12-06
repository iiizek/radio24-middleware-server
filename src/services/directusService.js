import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const directusBaseUrl = 'http://localhost:8055'; // URL Directus
const apiToken = process.env.DIRECTUS_ACCESS_TOKEN; // Замените на ваш токен

// Функция для получения данных из Directus
export async function getRadioStreamData() {
	try {
		const response = await axios.get(`${directusBaseUrl}/items/radio_streams`, {
			headers: { Authorization: `Bearer ${apiToken}` },
		});
		return response.data.data;
	} catch (error) {
		console.error('Ошибка при получении данных из Directus:', error);
		throw error;
	}
}

// Функция для обновления данных
export async function updateRadioStream(id, data) {
	try {
		const response = await axios.patch(
			`${directusBaseUrl}/items/radio_streams/${id}`,
			data,
			{
				headers: { Authorization: `Bearer ${apiToken}` },
			}
		);
		return response.data.data;
	} catch (error) {
		console.error('Ошибка при обновлении данных в Directus:', error);
		throw error;
	}
}

export const getPosters = async () => {
	try {
		const response = await axios.get(`${directusBaseUrl}/items/posters`, {
			headers: { Authorization: `Bearer ${apiToken}` },
		});
		return response.data.data;
	} catch (error) {
		console.error('Ошибка при получении данных из Directus:', error);
		throw error;
	}
};
