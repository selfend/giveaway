import express from 'express';
import { join } from 'path';
import { WebSocket, WebSocketServer } from 'ws';
import mongoose from 'mongoose';
import { WinnerHistory } from './models/WinnerHistory';

const app = express();
const port = 3000;

mongoose.connect('mongodb+srv://mod:sakoemin_A52@moderation.j8fns.mongodb.net/')
    .then(() => console.log('MongoDB подключена для веб-сайта'))
    .catch(err => console.error('Ошибка подключения к MongoDB:', err));

const wss = new WebSocketServer({ port: 8080 });
const clients = new Set<WebSocket>();

app.get('/api/history', async (req, res) => {
    try {
        const history = await WinnerHistory.find().sort({ createdAt: -1 }).limit(100);
        res.json(history);
    } catch (error) {
        console.error('Ошибка получения истории:', error);
        res.status(500).json({ error: 'Ошибка получения истории' });
    }
});

wss.on('connection', async (ws) => {
    console.log('Новое WebSocket подключение');
    clients.add(ws);
    
    try {
        const history = await WinnerHistory.find().sort({ createdAt: -1 }).limit(100);
        ws.send(JSON.stringify({ type: 'history', data: history }));
        console.log('История отправлена новому клиенту')
    } catch (error) {
        console.error('Ошибка отправки истории:', error);
    }
    
    ws.on('close', () => {
        console.log('WebSocket клиент отключился');
        clients.delete(ws);
    });
});

export async function broadcastGiveawayWinner(data: {
    giveawayName: string;
    winners: string[];
    guildName: string;
    prize: string;
    endedAt: string;
    totalParticipants: number;
}) {
    console.log('Получены данные о победителе:', data);
    
    try {
        const winnerRecord = new WinnerHistory(data);
        await winnerRecord.save();
        console.log('Победитель сохранен в базе данных');
        
        const jsonData = JSON.stringify({ type: 'winner', data });
        let sentCount = 0;
        
        clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(jsonData);
                sentCount++;
            }
        });
        
        console.log(`Данные отправлены ${sentCount} из ${clients.size} клиентам`);
    } catch (error) {
        console.error('Ошибка в broadcastGiveawayWinner:', error);
    }
}

app.use(express.static(join(__dirname, 'public')));

app.listen(port, () => {
    console.log(`Веб-сайт запущен на http://localhost:${port}`);
    console.log(`WebSocket сервер запущен на ws://localhost:8080`);
}); 