import http from 'http';
import express from 'express';
import { Server } from 'socket.io';
import 'dotenv/config';

import { trackCoverController } from './controllers/trackCoverController.js';
import { radioStreamController } from './controllers/radioStreamController.js';
import { postersController } from './controllers/postersController.js';

import { startStreamSync } from './models/RadioStreamManager.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.EXPRESS_PORT || 3000;

// Запуск синхронизации потоков с Icecast
startStreamSync(io);

// Подключение WebSocket
io.on('connection', (socket) => {
	console.log('Новый клиент подключился:', socket.id);

	socket.on('disconnect', () => {
		console.log('Клиент отключился:', socket.id);
	});
});

// Маршруты API
app.use('/api', trackCoverController);
app.use('/api', radioStreamController);
app.use('/api', postersController);

// Запуск сервера
server.listen(PORT, () => {
	console.log(`Промежуточный сервер запущен на порту ${PORT}`);
});

export default app;
