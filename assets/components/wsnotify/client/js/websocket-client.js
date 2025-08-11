/**
 * WSNotify WebSocket Client
 * Клиент для подключения к WebSocket серверу уведомлений
 */

class WSNotifyClient {
    constructor(options = {}) {
        this.options = {
            url: options.url || 'http://localhost:3100',
            siteKey: options.siteKey || 'default',
            autoConnect: options.autoConnect !== false,
            reconnectAttempts: options.reconnectAttempts || 5,
            reconnectDelay: options.reconnectDelay || 3000,
            debug: options.debug || false,
            ...options
        };
        
        this.socket = null;
        this.isConnected = false;
        this.isAuthenticated = false;
        this.reconnectCount = 0;
        this.eventHandlers = {};
        this.channels = options.channels || [];
        
        // Привязываем контекст методов
        this.connect = this.connect.bind(this);
        this.disconnect = this.disconnect.bind(this);
        this.reconnect = this.reconnect.bind(this);
        this.authenticate = this.authenticate.bind(this);
        this.on = this.on.bind(this);
        this.off = this.off.bind(this);
        this.emit = this.emit.bind(this);
        
        if (this.options.autoConnect) {
            this.connect();
        }
        
        this.log('WSNotify клиент инициализирован', this.options);
    }
    
    log(message, data = null) {
        if (this.options.debug) {
            console.log('[WSNotify]', message, data || '');
        }
    }
    
    error(message, data = null) {
        console.error('[WSNotify Error]', message, data || '');
    }
    
    connect() {
        if (this.socket && this.isConnected) {
            this.log('Уже подключен к серверу');
            return;
        }
        
        try {
            // Проверяем доступность Socket.IO
            if (typeof io === 'undefined') {
                this.error('Socket.IO библиотека не загружена');
                return;
            }
            
            const namespace = `/${this.options.siteKey}`;
            const socketUrl = this.options.url + namespace;
            
            this.log('Подключение к', socketUrl);
            
            this.socket = io(socketUrl, {
                transports: ['websocket', 'polling'],
                timeout: 10000,
                forceNew: true
            });
            
            this.setupEventHandlers();
            
        } catch (error) {
            this.error('Ошибка подключения', error);
            this.scheduleReconnect();
        }
    }
    
    setupEventHandlers() {
        if (!this.socket) return;
        
        this.socket.on('connect', () => {
            this.log('Подключен к WebSocket серверу');
            this.isConnected = true;
            this.reconnectCount = 0;
            this.authenticate();
            this.trigger('connected');
        });
        
        this.socket.on('disconnect', (reason) => {
            this.log('Отключен от сервера:', reason);
            this.isConnected = false;
            this.isAuthenticated = false;
            this.trigger('disconnected', { reason });
            
            if (reason === 'io server disconnect') {
                // Сервер принудительно отключил
                this.scheduleReconnect();
            }
        });
        
        this.socket.on('connect_error', (error) => {
            this.error('Ошибка подключения', error);
            this.trigger('connect_error', { error });
            this.scheduleReconnect();
        });
        
        this.socket.on('authenticated', (data) => {
            this.log('Аутентификация успешна', data);
            this.isAuthenticated = true;
            this.trigger('authenticated', data);
        });
        
        this.socket.on('auth_error', (error) => {
            this.error('Ошибка аутентификации', error);
            this.trigger('auth_error', error);
        });
        
        this.socket.on('notification', (data) => {
            this.log('Получено уведомление', data);
            this.trigger('notification', data);
            
            // Триггерим событие по типу
            if (data.event) {
                this.trigger(data.event, data);
            }
        });
        
        this.socket.on('subscribed', (data) => {
            this.log('Подписка на каналы', data);
            this.trigger('subscribed', data);
        });
        
        this.socket.on('unsubscribed', (data) => {
            this.log('Отписка от каналов', data);
            this.trigger('unsubscribed', data);
        });
    }
    
    authenticate() {
        if (!this.socket || !this.isConnected) {
            this.log('Нет подключения для аутентификации');
            return;
        }
        
        const authData = {
            userId: this.getUserId(),
            sessionId: this.getSessionId(),
            channels: this.channels
        };
        
        this.log('Отправка данных аутентификации', authData);
        this.socket.emit('authenticate', authData);
    }
    
    getUserId() {
        // Сначала проверяем переданные в конфигурации данные
        if (this.options.userId !== undefined) {
            return this.options.userId;
        }
        
        return 0; // Анонимный пользователь
    }
    
    getSessionId() {
        // Попытка получить ID сессии
        if (typeof MODx !== 'undefined' && MODx.session) {
            return MODx.session;
        }
        
        // Попытка получить из cookie
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'PHPSESSID' || name === 'modx_session') {
                return value;
            }
        }
        
        return null;
    }
    
    disconnect() {
        if (this.socket) {
            this.log('Отключение от сервера');
            this.socket.disconnect();
            this.socket = null;
        }
        this.isConnected = false;
        this.isAuthenticated = false;
    }
    
    reconnect() {
        this.log('Переподключение...');
        this.disconnect();
        setTimeout(() => {
            this.connect();
        }, 1000);
    }
    
    scheduleReconnect() {
        if (this.reconnectCount >= this.options.reconnectAttempts) {
            this.error('Превышено максимальное количество попыток переподключения');
            this.trigger('max_reconnect_attempts');
            return;
        }
        
        this.reconnectCount++;
        const delay = this.options.reconnectDelay * this.reconnectCount;
        
        this.log(`Переподключение через ${delay}ms (попытка ${this.reconnectCount}/${this.options.reconnectAttempts})`);
        
        setTimeout(() => {
            this.connect();
        }, delay);
    }
    
    on(event, handler) {
        if (!this.eventHandlers[event]) {
            this.eventHandlers[event] = [];
        }
        this.eventHandlers[event].push(handler);
    }
    
    off(event, handler) {
        if (!this.eventHandlers[event]) return;
        
        if (handler) {
            const index = this.eventHandlers[event].indexOf(handler);
            if (index > -1) {
                this.eventHandlers[event].splice(index, 1);
            }
        } else {
            this.eventHandlers[event] = [];
        }
    }
    
    trigger(event, data = null) {
        if (!this.eventHandlers[event]) return;
        
        this.eventHandlers[event].forEach(handler => {
            try {
                handler(data);
            } catch (error) {
                this.error(`Ошибка в обработчике события ${event}`, error);
            }
        });
    }
    
    emit(event, data) {
        if (!this.socket || !this.isConnected) {
            this.log('Нет подключения для отправки события');
            return false;
        }
        
        this.socket.emit(event, data);
        return true;
    }
    
    subscribeToChannels(channels) {
        if (!Array.isArray(channels)) {
            channels = [channels];
        }
        
        this.channels = [...new Set([...this.channels, ...channels])];
        
        if (this.isAuthenticated) {
            this.emit('subscribe_channels', channels);
        }
    }
    
    unsubscribeFromChannels(channels) {
        if (!Array.isArray(channels)) {
            channels = [channels];
        }
        
        this.channels = this.channels.filter(ch => !channels.includes(ch));
        
        if (this.isAuthenticated) {
            this.emit('unsubscribe_channels', channels);
        }
    }
    
    // Геттеры для проверки состояния
    get connected() {
        return this.isConnected;
    }
    
    get authenticated() {
        return this.isAuthenticated;
    }
}

// Экспорт для использования
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WSNotifyClient;
} else {
    window.WSNotifyClient = WSNotifyClient;
}
