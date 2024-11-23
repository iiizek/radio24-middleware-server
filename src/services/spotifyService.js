import axios from 'axios';

const SPOTIFY_API_URL = 'https://api.spotify.com/v1';
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

let accessToken = null;

// Получение токена Spotify
const fetchSpotifyAccessToken = async () => {
	try {
		const response = await axios.post(
			'https://accounts.spotify.com/api/token',
			'grant_type=client_credentials',
			{
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
					Authorization: `Basic ${Buffer.from(
						`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
					).toString('base64')}`,
				},
			}
		);
		accessToken = response.data.access_token;
	} catch (error) {
		console.error(
			'Ошибка при получении токена Spotify:',
			error.response?.data || error.message
		);
		throw error;
	}
};

// Поиск трека в Spotify
export const fetchTrackCover = async (artist, title) => {
	if (!accessToken) {
		await fetchSpotifyAccessToken();
	}

	try {
		const response = await axios.get(`${SPOTIFY_API_URL}/search`, {
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
			params: {
				q: `artist:${artist} track:${title}`,
				type: 'track',
				limit: 1,
			},
		});

		const track = response.data.tracks.items[0];
		return track?.album?.images[0]?.url || null; // URL обложки трека
	} catch (error) {
		console.error(
			'Ошибка при запросе данных из Spotify API:',
			error.response?.data || error.message
		);

		// Если токен просрочен, обновляем и повторяем запрос
		if (error.response?.status === 401) {
			accessToken = null;
			return await fetchTrackCover(artist, title);
		}

		return null;
	}
};
