const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const axios = require('axios');

const app = express();
const server = http.createServer(app);

// Загрузка конфигурации сайтов
const config = require('./config.json');

// Генерация списка разрешенных доменов из конфига сайтов
const allowedOrigins = Object.values(config.sites)
    .filter(site => site.enabled)
    .map(site => site.url);

console.log('Разрешенные домены CORS:', allowedOrigins);

// Настройка CORS
app.use(cors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : '*',
    credentials: true
}));

app.use(express.json());

// Инициализация Socket.IO с CORS
const io = socketIo(server, {
    cors: {
        origin: allowedOrigins.length > 0 ? allowedOrigins : '*',
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Хранилище подключений
const connections = new Map();
const siteNamespaces = new Map();

// Создание пространств имен для каждого сайта
Object.keys(config.sites).forEach(siteKey => {
    const siteConfig = config.sites[siteKey];
    const namespace = io.of(`/${siteKey}`);
    siteNamespaces.set(siteKey, namespace);
    
    console.log(`Создано пространство имен для сайта: /${siteKey}`);
    
    // Обработка подключений для конкретного сайта
    namespace.on('connection', (socket) => {
        console.log(`Новое подключение к сайту ${siteKey}: ${socket.id}`);
        
        // Аутентификация пользователя
        socket.on('authenticate', async (data) => {
            try {
                const authResult = await authenticateUser(siteKey, data);
                
                if (authResult.success) {
                    // Сохраняем информацию о пользователе
                    socket.userId = authResult.user.id;
                    socket.userGroups = authResult.user.groups;
                    socket.siteKey = siteKey;
                    socket.isAuthenticated = true;
                    
                    // Добавляем в хранилище подключений
                    if (!connections.has(siteKey)) {
                        connections.set(siteKey, new Map());
                    }
                    connections.get(siteKey).set(socket.id, socket);
                    
                    // Подписываемся на каналы
                    if (data.channels && Array.isArray(data.channels)) {
                        data.channels.forEach(channel => {
                            socket.join(`channel:${channel}`);
                        });
                    }
                    
                    // Подписываемся на группы пользователя
                    if (authResult.user.groups) {
                        authResult.user.groups.forEach(group => {
                            socket.join(`group:${group}`);
                        });
                    }
                    
                    // Подписываемся на личные уведомления
                    if (authResult.user.id > 0) {
                        socket.join(`user:${authResult.user.id}`);
                    } else {
                        socket.join('anonymous');
                    }
                    
                    socket.emit('authenticated', {
                        success: true,
                        user: authResult.user
                    });
                    
                    console.log(`Пользователь ${authResult.user.id} аутентифицирован на сайте ${siteKey}`);
                } else {
                    socket.emit('auth_error', {
                        success: false,
                        message: authResult.message
                    });
                }
            } catch (error) {
                console.error('Ошибка аутентификации:', error);
                socket.emit('auth_error', {
                    success: false,
                    message: 'Ошибка сервера при аутентификации'
                });
            }
        });
        
        // Обработка отключения
        socket.on('disconnect', () => {
            console.log(`Отключение от сайта ${siteKey}: ${socket.id}`);
            
            if (connections.has(siteKey)) {
                connections.get(siteKey).delete(socket.id);
            }
        });
        
        // Обработка подписки на каналы
        socket.on('subscribe_channels', (channels) => {
            if (socket.isAuthenticated && Array.isArray(channels)) {
                channels.forEach(channel => {
                    socket.join(`channel:${channel}`);
                });
                socket.emit('subscribed', { channels });
            }
        });
        
        // Обработка отписки от каналов
        socket.on('unsubscribe_channels', (channels) => {
            if (socket.isAuthenticated && Array.isArray(channels)) {
                channels.forEach(channel => {
                    socket.leave(`channel:${channel}`);
                });
                socket.emit('unsubscribed', { channels });
            }
        });
    });
});

// Функция аутентификации пользователя
async function authenticateUser(siteKey, data) {
    try {
        const siteConfig = config.sites[siteKey];
        if (!siteConfig) {
            return { success: false, message: 'Неизвестный сайт' };
        }
        
        const authUrl = `${siteConfig.url}/assets/components/wsnotify/api/auth.php`;
        
        const response = await axios.post(authUrl, {
            api_key: siteConfig.api_key,
            user_id: data.userId || 0,
            session_id: data.sessionId || null
        }, {
            timeout: 5000,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        return response.data;
    } catch (error) {
        console.error(`Ошибка аутентификации для сайта ${siteKey}:`, error.message);
        return { success: false, message: 'Ошибка подключения к сайту' };
    }
}

// API для отправки уведомлений
app.post('/api/notify/:siteKey', async (req, res) => {
    try {
        const { siteKey } = req.params;
        const { api_key, target_type, targets, data } = req.body;
        
        // Проверяем конфигурацию сайта
        const siteConfig = config.sites[siteKey];
        if (!siteConfig) {
            return res.status(404).json({ success: false, message: 'Сайт не найден' });
        }
        
        // Проверяем API ключ
        if (api_key !== siteConfig.api_key) {
            return res.status(401).json({ success: false, message: 'Неверный API ключ' });
        }
        
        const namespace = siteNamespaces.get(siteKey);
        if (!namespace) {
            return res.status(500).json({ success: false, message: 'Пространство имен не найдено' });
        }
        
        let sentCount = 0;
        
        switch (target_type) {
            case 'users':
                targets.forEach(userId => {
                    namespace.to(`user:${userId}`).emit('notification', data);
                    sentCount++;
                });
                break;
                
            case 'groups':
                targets.forEach(groupName => {
                    namespace.to(`group:${groupName}`).emit('notification', data);
                    sentCount++;
                });
                break;
                
            case 'channels':
                targets.forEach(channel => {
                    namespace.to(`channel:${channel}`).emit('notification', data);
                    sentCount++;
                });
                break;
                
            case 'anonymous':
                namespace.to('anonymous').emit('notification', data);
                sentCount = 1;
                break;
                
            case 'all':
                namespace.emit('notification', data);
                sentCount = 1;
                break;
                
            default:
                return res.status(400).json({ success: false, message: 'Неизвестный тип получателя' });
        }
        
        res.json({ 
            success: true, 
            message: `Уведомление отправлено`,
            sent_count: sentCount
        });
        
        console.log(`Отправлено уведомление для сайта ${siteKey}, тип: ${target_type}, получателей: ${sentCount}`);
        
    } catch (error) {
        console.error('Ошибка отправки уведомления:', error);
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

// API для получения статистики
app.get('/api/stats/:siteKey', (req, res) => {
    const { siteKey } = req.params;
    const { api_key } = req.query;
    
    const siteConfig = config.sites[siteKey];
    if (!siteConfig || api_key !== siteConfig.api_key) {
        return res.status(401).json({ success: false, message: 'Неверный API ключ' });
    }
    
    const siteConnections = connections.get(siteKey) || new Map();
    const connectedUsers = Array.from(siteConnections.values()).map(socket => ({
        id: socket.id,
        userId: socket.userId,
        userGroups: socket.userGroups,
        connected: new Date(socket.handshake.time)
    }));
    
    res.json({
        success: true,
        data: {
            site: siteKey,
            connected_count: siteConnections.size,
            connected_users: connectedUsers
        }
    });
});

// API для обновления каналов
app.post('/api/channels/:siteKey', async (req, res) => {
    try {
        const { siteKey } = req.params;
        const { api_key } = req.body;
        
        const siteConfig = config.sites[siteKey];
        if (!siteConfig || api_key !== siteConfig.api_key) {
            return res.status(401).json({ success: false, message: 'Неверный API ключ' });
        }
        
        // Получаем каналы с сайта
        const channelsUrl = `${siteConfig.url}/assets/components/wsnotify/api/channels.php`;
        const response = await axios.post(channelsUrl, {
            api_key: siteConfig.api_key
        });
        
        if (response.data.success) {
            // Сохраняем каналы в конфигурацию (можно расширить для сохранения в файл)
            siteConfig.channels = response.data.data;
            
            res.json({
                success: true,
                message: 'Каналы обновлены',
                channels: response.data.data
            });
            
            console.log(`Обновлены каналы для сайта ${siteKey}:`, response.data.data.length);
        } else {
            res.status(500).json({ success: false, message: 'Ошибка получения каналов с сайта' });
        }
        
    } catch (error) {
        console.error('Ошибка обновления каналов:', error);
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

// Базовый маршрут
app.get('/', (req, res) => {
    res.json({
        name: 'WSNotify Server',
        version: '1.0.0',
        status: 'running',
        sites: Object.keys(config.sites),
        uptime: process.uptime()
    });
});

// Запуск сервера
const PORT = config.server?.port || 3100;
server.listen(PORT, () => {
    console.log(`WSNotify сервер запущен на порту ${PORT}`);
    console.log(`Настроенные сайты: ${Object.keys(config.sites).join(', ')}`);
});

// Обработка ошибок
process.on('uncaughtException', (error) => {
    console.error('Необработанная ошибка:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Необработанное отклонение промиса:', reason);
});
