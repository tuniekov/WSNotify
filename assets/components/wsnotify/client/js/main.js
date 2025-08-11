/**
 * WSNotify Main JavaScript
 * Основной файл для инициализации и управления WebSocket уведомлениями
 */

// Глобальные переменные
let wsnotifyClient = null;
let wsnotifyContainer = null;

// Объект с хелперами для работы с уведомлениями
const WSNotifyHelpers = {
    // Инициализация клиента
    init: function(config) {
        if (wsnotifyClient) {
            console.warn('[WSNotify] Клиент уже инициализирован');
            return wsnotifyClient;
        }

        // Создаем контейнер для уведомлений
        this.createNotificationContainer();

        // Создаем клиент
        wsnotifyClient = new WSNotifyClient(config);

        // Настраиваем обработчики событий
        this.setupEventHandlers();

        if (config.debug) {
            console.log('[WSNotify] Клиент инициализирован');
        }
        return wsnotifyClient;
    },

    // Создание контейнера для уведомлений
    createNotificationContainer: function() {
        if (wsnotifyContainer) return;

        wsnotifyContainer = document.createElement('div');
        wsnotifyContainer.className = 'wsnotify-container';
        wsnotifyContainer.id = 'wsnotify-container';
        document.body.appendChild(wsnotifyContainer);
    },

    // Настройка обработчиков событий
    setupEventHandlers: function() {
        if (!wsnotifyClient) return;

        // Обработка подключения
        wsnotifyClient.on('connected', () => {
            if (wsnotifyClient.options.debug) {
                console.log('[WSNotify] Подключен к серверу');
            }
            this.showConnectionStatus('connected');
        });

        // Обработка отключения
        wsnotifyClient.on('disconnected', (data) => {
            if (wsnotifyClient.options.debug) {
                console.log('[WSNotify] Отключен от сервера:', data.reason);
            }
            this.showConnectionStatus('disconnected');
        });

        // Обработка ошибок подключения
        wsnotifyClient.on('connect_error', (data) => {
            console.error('[WSNotify] Ошибка подключения:', data.error);
            this.showConnectionStatus('error');
        });

        // Обработка аутентификации
        wsnotifyClient.on('authenticated', (data) => {
            if (wsnotifyClient.options.debug) {
                console.log('[WSNotify] Аутентификация успешна:', data);
            }
        });

        // Обработка ошибок аутентификации
        wsnotifyClient.on('auth_error', (error) => {
            console.error('[WSNotify] Ошибка аутентификации:', error);
        });

        // Обработка уведомлений
        wsnotifyClient.on('notification', (data) => {
            if (wsnotifyClient.options.debug) {
                console.log('[WSNotify] Получено уведомление:', data);
            }
            
            if (wsnotifyClient.options.showNotifications) {
                this.showNotification(data);
            }
        });

        // Обработка превышения лимита переподключений
        wsnotifyClient.on('max_reconnect_attempts', () => {
            console.error('[WSNotify] Превышено максимальное количество попыток переподключения');
            this.showMessage('Потеряно соединение с сервером уведомлений', 'error');
        });
    },

    // Показ уведомления
    showNotification: function(data) {
        const notification = this.createNotificationElement(data);
        wsnotifyContainer.appendChild(notification);

        // Анимация появления
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        // Автоматическое скрытие
        const duration = data.duration || 5000;
        if (duration > 0) {
            setTimeout(() => {
                this.hideNotification(notification);
            }, duration);
        }
    },

    // Создание элемента уведомления
    createNotificationElement: function(data) {
        const notification = document.createElement('div');
        notification.className = `wsnotify-notification ${data.type || 'notification'}`;
        
        if (data.pulse) {
            notification.classList.add('pulse');
        }

        const content = document.createElement('div');
        content.className = 'wsnotify-content';

        const textContainer = document.createElement('div');
        textContainer.className = 'wsnotify-text';

        // Заголовок
        if (data.title) {
            const title = document.createElement('div');
            title.className = 'wsnotify-title';
            title.textContent = data.title;
            textContainer.appendChild(title);
        }

        // Сообщение
        const message = document.createElement('div');
        message.className = 'wsnotify-message';
        message.textContent = data.message || '';
        textContainer.appendChild(message);

        content.appendChild(textContainer);

        // Кнопка закрытия
        const closeButton = document.createElement('button');
        closeButton.className = 'wsnotify-close';
        closeButton.innerHTML = '×';
        closeButton.onclick = () => this.hideNotification(notification);

        notification.appendChild(content);
        notification.appendChild(closeButton);

        // Прогресс-бар для таймера
        const duration = data.duration || 5000;
        if (duration > 0) {
            const progress = document.createElement('div');
            progress.className = 'wsnotify-progress';
            
            const progressBar = document.createElement('div');
            progressBar.className = 'wsnotify-progress-bar';
            progressBar.style.width = '100%';
            progressBar.style.transition = `width ${duration}ms linear`;
            
            progress.appendChild(progressBar);
            notification.appendChild(progress);

            // Запускаем анимацию прогресса
            setTimeout(() => {
                progressBar.style.width = '0%';
            }, 10);
        }

        return notification;
    },

    // Скрытие уведомления
    hideNotification: function(notification) {
        notification.classList.add('hide');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    },

    // Показ простого сообщения
    showMessage: function(message, type = 'notification', duration = 5000) {
        this.showNotification({
            message: message,
            type: type,
            duration: duration
        });
    },

    // Показ статуса подключения
    showConnectionStatus: function(status) {
        let statusElement = document.getElementById('wsnotify-connection-status');
        
        if (!statusElement) {
            statusElement = document.createElement('div');
            statusElement.id = 'wsnotify-connection-status';
            statusElement.className = 'wsnotify-connection-status';
            document.body.appendChild(statusElement);
        }

        const indicator = document.createElement('div');
        indicator.className = 'wsnotify-connection-indicator';

        const text = document.createElement('span');
        
        statusElement.innerHTML = '';
        statusElement.appendChild(indicator);
        statusElement.appendChild(text);

        statusElement.className = `wsnotify-connection-status ${status}`;

        switch (status) {
            case 'connected':
                text.textContent = 'Подключено';
                statusElement.classList.add('show');
                setTimeout(() => {
                    statusElement.classList.remove('show');
                }, 3000);
                break;
            case 'disconnected':
                text.textContent = 'Отключено';
                statusElement.classList.add('show');
                break;
            case 'connecting':
                text.textContent = 'Подключение...';
                statusElement.classList.add('show');
                break;
            case 'error':
                text.textContent = 'Ошибка подключения';
                statusElement.classList.add('show');
                setTimeout(() => {
                    statusElement.classList.remove('show');
                }, 5000);
                break;
        }
    },

    // Регистрация обработчика события
    on: function(event, handler) {
        if (wsnotifyClient) {
            wsnotifyClient.on(event, handler);
        } else {
            console.warn('[WSNotify] Клиент не инициализирован');
        }
    },

    // Удаление обработчика события
    off: function(event, handler) {
        if (wsnotifyClient) {
            wsnotifyClient.off(event, handler);
        }
    },

    // Отправка события
    emit: function(event, data) {
        if (wsnotifyClient) {
            return wsnotifyClient.emit(event, data);
        }
        return false;
    },

    // Проверка подключения
    isConnected: function() {
        return wsnotifyClient ? wsnotifyClient.connected : false;
    },

    // Проверка аутентификации
    isAuthenticated: function() {
        return wsnotifyClient ? wsnotifyClient.authenticated : false;
    },

    // Переподключение
    reconnect: function() {
        if (wsnotifyClient) {
            wsnotifyClient.reconnect();
        }
    },

    // Подписка на каналы
    subscribeToChannels: function(channels) {
        if (wsnotifyClient) {
            wsnotifyClient.subscribeToChannels(channels);
        }
    },

    // Отписка от каналов
    unsubscribeFromChannels: function(channels) {
        if (wsnotifyClient) {
            wsnotifyClient.unsubscribeFromChannels(channels);
        }
    },

    // Подписка на дополнительный канал
    subscribeToChannel: function(channelName) {
        if (wsnotifyClient) {
            wsnotifyClient.subscribeToChannels([channelName]);
        }
    },

    // Отписка от канала
    unsubscribeFromChannel: function(channelName) {
        if (wsnotifyClient) {
            wsnotifyClient.unsubscribeFromChannels([channelName]);
        }
    },

    // Получение клиента
    getClient: function() {
        return wsnotifyClient;
    }
};

// Функция инициализации (вызывается из сниппета)
function initWSNotify(config) {
    if (config.debug) {
        console.log('[WSNotify] Инициализация с конфигурацией:', config);
        console.log('[WSNotify] ID пользователя:', config.userId);
        console.log('[WSNotify] Группы пользователя:', config.userGroups);
    }
    return WSNotifyHelpers.init(config);
}

// Экспорт для глобального использования
window.WSNotifyHelpers = WSNotifyHelpers;
window.initWSNotify = initWSNotify;

// Автоматическая инициализация если есть конфигурация
document.addEventListener('DOMContentLoaded', function() {
    if (typeof window.wsnotifyConfig !== 'undefined' && window.wsnotifyConfig.autoConnect) {
        initWSNotify(window.wsnotifyConfig);
    }
});
