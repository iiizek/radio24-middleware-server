import { io } from 'socket.io-client';

const socket = io('http://localhost:8054');

socket.on('connect', () => {
	console.log('Подключено:', socket.id);
});

socket.on('radio-streams', (updatedStreams) => {
	console.log('Новые данные:', updatedStreams);
});

socket.on('message', (data) => {
	console.log('Сообщение от сервера:', data);
});

socket.on('disconnect', () => {
	console.log('Соединение разорвано');
});

socket.on('error', (err) => {
	console.error('Ошибка:', err);
});
