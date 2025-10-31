# Примеры использования WSNotify

## Базовая инициализация

```html
<!-- В шаблоне MODX -->
[[!wsnotify_init]]
```

## Инициализация с параметрами

```html
<!-- Только определенные каналы -->
[[!wsnotify_init? &channels=`news,alerts`]]

<!-- С отладкой -->
[[!wsnotify_init? &debug=`1`]]

<!-- Без автоматического подключения -->
[[!wsnotify_init? &autoConnect=`0`]]
```

## Отправка уведомлений в PHP

### Уведомление конкретным пользователям

```php
<?php
$wsnotify = $modx->getService('wsnotify', 'WSNotify', MODX_CORE_PATH . 'components/wsnotify/model/');

// Простое уведомление
$wsnotify->sendToUsers([123, 456], [
    'type' => 'notification',
    'event' => 'new_message',
    'message' => 'У вас новое сообщение!'
]);

// Уведомление с дополнительными данными
$wsnotify->sendToUsers([123], [
    'type' => 'progress',
    'event' => 'task_progress',
    'message' => 'Обработка файлов...',
    'data' => [
        'progress' => 45,
        'task_id' => 123
    ]
]);
```

### Уведомление группам пользователей

```php
<?php
// Уведомление администраторам
$wsnotify->sendToGroups(['Administrator', 'Manager'], [
    'type' => 'notification',
    'event' => 'system_alert',
    'message' => 'Критическая ошибка в системе',
    'data' => [
        'level' => 'error',
        'timestamp' => time()
    ]
]);
```

### Уведомление в каналы

```php
<?php
// Уведомление в канал новостей
$wsnotify->sendToChannels(['news'], [
    'type' => 'notification',
    'event' => 'news_update',
    'message' => 'Опубликована новая статья',
    'data' => [
        'article_id' => 456,
        'title' => 'Заголовок статьи'
    ]
]);
```

### Уведомление анонимным пользователям

```php
<?php
// Обновление цен для всех посетителей
$wsnotify->sendToAnonymous([
    'type' => 'data',
    'event' => 'price_update',
    'message' => 'Цены обновлены',
    'data' => [
        'product_id' => 789,
        'new_price' => 1500
    ]
]);
```

## Обработка уведомлений в JavaScript

### Регистрация обработчиков событий

```javascript
// Обработка конкретного события
const result = WSNotifyHelpers.on('new_message', function(data) {
    console.log('Новое сообщение:', data.message);
    // Показать уведомление
    alert(data.message);
});

// Проверка успешности регистрации
if (!result.success) {
    console.error('Ошибка регистрации обработчика:', result.error);
}

// Обработка прогресса задачи
WSNotifyHelpers.on('task_progress', function(data) {
    console.log('Прогресс:', data.data.progress + '%');
    // Обновить прогресс-бар
    const progressBar = document.getElementById('progress-' + data.data.task_id);
    if (progressBar) {
        progressBar.style.width = data.data.progress + '%';
    }
});

// Обработка всех уведомлений
WSNotifyHelpers.on('notification', function(data) {
    console.log('Получено уведомление:', data);
});
```

### Проверка состояния подключения

```javascript
// Проверить подключение
if (WSNotifyHelpers.isConnected()) {
    console.log('WebSocket подключен');
} else {
    console.log('WebSocket не подключен');
}

// Переподключиться
WSNotifyHelpers.reconnect();
```

### Показ уведомлений

```javascript
// Показать простое уведомление
WSNotifyHelpers.showMessage('Операция выполнена успешно', 'success');

// Показать ошибку
WSNotifyHelpers.showMessage('Произошла ошибка', 'error');

// Показать предупреждение
WSNotifyHelpers.showMessage('Внимание!', 'warning');
```

## Интеграция с процессами MODX

### Уведомление о завершении импорта

```php
<?php
// В процессоре импорта
class ImportProcessor extends modProcessor {
    public function process() {
        // ... логика импорта ...
        
        // Отправляем уведомление о завершении
        $wsnotify = $this->modx->getService('wsnotify', 'WSNotify', MODX_CORE_PATH . 'components/wsnotify/model/');
        $wsnotify->sendToUsers([$this->modx->user->get('id')], [
            'type' => 'notification',
            'event' => 'import_complete',
            'message' => 'Импорт завершен успешно',
            'data' => [
                'imported_count' => $importedCount,
                'duration' => $duration
            ]
        ]);
        
        return $this->success();
    }
}
```

### Уведомление о новых комментариях

```php
<?php
// В плагине на событие OnCommentSave
$wsnotify = $modx->getService('wsnotify', 'WSNotify', MODX_CORE_PATH . 'components/wsnotify/model/');

// Уведомляем модераторов
$wsnotify->sendToGroups(['Moderator'], [
    'type' => 'notification',
    'event' => 'new_comment',
    'message' => 'Новый комментарий требует модерации',
    'data' => [
        'comment_id' => $comment->get('id'),
        'resource_id' => $comment->get('resource_id')
    ]
]);
```

## Прямая отправка уведомлений (без каналов)

Методы `sendToUsers`, `sendToGroups`, `sendToAnonymous` и `sendToAll` работают напрямую с WebSocket сервером и не требуют предварительного создания каналов.

### Отправка конкретным пользователям

```php
<?php
$wsnotify = $modx->getService('wsnotify', 'WSNotify', MODX_CORE_PATH . 'components/wsnotify/model/');

// Простое уведомление пользователям
$wsnotify->sendToUsers([1, 5, 10], [
    'type' => 'notification',
    'event' => 'direct_notification',
    'message' => 'Это прямое уведомление без использования каналов'
]);

// Уведомление с дополнительными данными
$wsnotify->sendToUsers([123], [
    'type' => 'success',
    'event' => 'payment_received',
    'message' => 'Платеж успешно получен',
    'data' => [
        'amount' => 1500,
        'order_id' => 456,
        'timestamp' => time()
    ]
]);

// Критическое уведомление
$wsnotify->sendToUsers([$modx->user->id], [
    'type' => 'error',
    'event' => 'account_security',
    'message' => 'Обнаружена подозрительная активность',
    'data' => [
        'ip' => $_SERVER['REMOTE_ADDR'],
        'action' => 'login_attempt'
    ],
    'duration' => 10000 // Показывать 10 секунд
]);
```

### Отправка группам пользователей

```php
<?php
// Уведомление администраторам
$wsnotify->sendToGroups(['Administrator'], [
    'type' => 'alert',
    'event' => 'system_alert',
    'message' => 'Требуется внимание администратора',
    'data' => [
        'severity' => 'high',
        'module' => 'security'
    ]
]);

// Уведомление нескольким группам
$wsnotify->sendToGroups(['Administrator', 'Manager', 'Editor'], [
    'type' => 'info',
    'event' => 'system_update',
    'message' => 'Запланировано обновление системы',
    'data' => [
        'scheduled_time' => '2024-12-01 02:00:00',
        'duration' => '30 минут'
    ]
]);
```

### Отправка анонимным пользователям

```php
<?php
// Уведомление всем неавторизованным посетителям
$wsnotify->sendToAnonymous([
    'type' => 'info',
    'event' => 'promo_announcement',
    'message' => 'Специальное предложение для новых пользователей!',
    'data' => [
        'discount' => 20,
        'promo_code' => 'WELCOME20'
    ]
]);

// Техническое уведомление
$wsnotify->sendToAnonymous([
    'type' => 'warning',
    'event' => 'maintenance_warning',
    'message' => 'Сайт будет недоступен с 02:00 до 03:00',
    'duration' => 15000
]);
```

### Отправка всем пользователям

```php
<?php
// Глобальное объявление для всех (авторизованных и анонимных)
$wsnotify->sendToAll([
    'type' => 'warning',
    'event' => 'global_announcement',
    'message' => 'Важное объявление: изменение условий использования',
    'data' => [
        'effective_date' => '2024-12-01',
        'details_url' => '/terms'
    ],
    'duration' => 20000
]);

// Экстренное уведомление
$wsnotify->sendToAll([
    'type' => 'error',
    'event' => 'emergency',
    'message' => 'Экстренное техническое обслуживание через 5 минут',
    'data' => [
        'estimated_duration' => '15 минут'
    ]
]);
```

## Создание и использование каналов

### Создание каналов программно

```php
<?php
$wsnotify = $modx->getService('wsnotify', 'WSNotify', MODX_CORE_PATH . 'components/wsnotify/model/');

// Создать канал новостей
$channel = $modx->newObject('WSNotifyChannel');
$channel->set('name', 'news');
$channel->set('description', 'Канал новостей и обновлений');
$channel->set('active', 1);
$channel->set('default', 1); // Автоматически подключается для всех
$channel->save();

// Создать канал для VIP пользователей
$vipChannel = $modx->newObject('WSNotifyChannel');
$vipChannel->set('name', 'vip_offers');
$vipChannel->set('description', 'Эксклюзивные предложения для VIP');
$vipChannel->set('active', 1);
$vipChannel->set('default', 0); // Требует ручной подписки
$vipChannel->save();

// Синхронизировать каналы с WebSocket сервером
$wsnotify->syncChannelsToWebSocket();
```

### Создание каналов через админку

1. Откройте админку MODX
2. Перейдите в раздел **WSNotify > Каналы** (таб WSNotifyChannel)
3. Нажмите "Создать"
4. Заполните поля:
   - **Название канала**: `alerts`
   - **Описание**: `Важные уведомления и предупреждения`
   - **Активен**: ✓
   - **Канал по умолчанию**: ✓
5. Сохраните
6. Нажмите кнопку **"Синхронизировать с WebSocket"**

### Отправка в каналы

```php
<?php
// ВАЖНО: Канал должен быть создан перед отправкой!

// Отправка в канал новостей
$wsnotify->sendToChannels(['news'], [
    'type' => 'notification',
    'event' => 'news_published',
    'message' => 'Опубликована новая статья',
    'data' => [
        'article_id' => 123,
        'title' => 'Заголовок статьи',
        'url' => '/news/article-123'
    ]
]);

// Отправка в несколько каналов
$wsnotify->sendToChannels(['news', 'alerts'], [
    'type' => 'alert',
    'event' => 'important_update',
    'message' => 'Важное обновление системы',
    'data' => [
        'version' => '2.0.0',
        'changes' => ['Новая функция', 'Исправления']
    ]
]);
```

## Когда использовать каналы vs прямую отправку

### Используйте КАНАЛЫ когда:

```php
<?php
// Пример: Система подписок на новости
// Пользователи могут подписаться/отписаться от категорий новостей

// Создаем каналы для категорий
$categories = ['tech', 'business', 'sports', 'entertainment'];
foreach ($categories as $cat) {
    $channel = $modx->newObject('WSNotifyChannel');
    $channel->set('name', 'news_' . $cat);
    $channel->set('description', 'Новости: ' . $cat);
    $channel->set('active', 1);
    $channel->set('default', 0); // Пользователь выбирает сам
    $channel->save();
}

// Отправка новости в конкретную категорию
$wsnotify->sendToChannels(['news_tech'], [
    'type' => 'notification',
    'event' => 'new_article',
    'message' => 'Новая статья в категории Технологии'
]);
```

### Используйте ПРЯМУЮ ОТПРАВКУ когда:

```php
<?php
// Пример: Системные уведомления и персональные сообщения

// Уведомление о завершении задачи конкретному пользователю
$wsnotify->sendToUsers([$userId], [
    'type' => 'success',
    'event' => 'task_completed',
    'message' => 'Ваша задача выполнена'
]);

// Критическое уведомление администраторам
$wsnotify->sendToGroups(['Administrator'], [
    'type' => 'error',
    'event' => 'critical_error',
    'message' => 'Критическая ошибка в системе'
]);

// Объявление для всех посетителей
$wsnotify->sendToAll([
    'type' => 'info',
    'event' => 'announcement',
    'message' => 'Сайт работает в тестовом режиме'
]);
```

## Обработка ошибок

```javascript
// Обработка ошибок подключения
WSNotifyHelpers.on('auth_error', function(error) {
    console.error('Ошибка аутентификации:', error);
});

WSNotifyHelpers.on('max_reconnect_attempts', function() {
    console.error('Превышено максимальное количество попыток переподключения');
    WSNotifyHelpers.showMessage('Потеряно соединение с сервером', 'error');
});
```

## Структура клиентских файлов

WSNotify использует отдельную папку `client/` для клиентских файлов, которая не очищается при сборке проекта:

```
assets/components/wsnotify/
├── client/                      # Клиентские файлы (не очищаются при сборке)
│   ├── css/
│   │   └── websocket-client.css # Стили для уведомлений
│   └── js/
│       ├── websocket-client.js  # WebSocket клиент
│       └── main.js              # Основной файл и UI
└── web/                         # Ресурсы сборки (очищаются при npm run build)
    ├── css/
    │   └── main.css             # Стили основного приложения
    └── js/
        └── main.js              # Собранное приложение
```

Это позволяет безопасно использовать `npm run build` без потери файлов WebSocket клиента.

## Тестирование уведомлений

### Использование тестового сниппета

Для быстрого тестирования системы уведомлений используйте сниппет `wsnotify_test`:

```html
<!-- Отправить уведомление текущему пользователю -->
[[!wsnotify_test? &message=`Тестовое уведомление`]]

<!-- Отправить уведомление конкретному пользователю -->
[[!wsnotify_test? 
    &action=`send_to_user` 
    &target=`1` 
    &message=`Привет, администратор!`
    &type=`success`
]]

<!-- Отправить уведомление группе -->
[[!wsnotify_test? 
    &action=`send_to_group` 
    &target=`Administrator` 
    &message=`Сообщение для администраторов`
    &type=`alert`
]]

<!-- Отправить уведомление в канал -->
[[!wsnotify_test? 
    &action=`send_to_channel` 
    &target=`news` 
    &message=`Новость в канале`
    &type=`info`
]]

<!-- Отправить уведомление всем -->
[[!wsnotify_test? 
    &action=`send_to_all` 
    &message=`Общее объявление`
    &type=`warning`
    &title=`Важное объявление`
    &duration=`10000`
]]
```

### Параметры тестового сниппета

- `action` - Тип отправки: `send_to_user`, `send_to_group`, `send_to_channel`, `send_to_anonymous`, `send_to_all`
- `target` - Цель (ID пользователя, название группы, канала)
- `message` - Текст сообщения
- `type` - Тип уведомления: `notification`, `alert`, `info`, `success`, `warning`, `error`
- `event` - Название события (по умолчанию `test_notification`)
- `title` - Заголовок уведомления
- `duration` - Длительность показа в миллисекундах (по умолчанию 5000)

### Тестирование в разработке

```html
<!-- Создайте тестовую страницу с различными типами уведомлений -->
<h2>Тестирование WSNotify</h2>

<h3>Уведомление себе</h3>
[[!wsnotify_test? &message=`Тест для текущего пользователя` &type=`info`]]

<h3>Успешное уведомление</h3>
[[!wsnotify_test? &message=`Операция выполнена успешно` &type=`success`]]

<h3>Предупреждение</h3>
[[!wsnotify_test? &message=`Внимание! Проверьте настройки` &type=`warning`]]

<h3>Ошибка</h3>
[[!wsnotify_test? &message=`Произошла ошибка` &type=`error`]]

<h3>Длительное уведомление</h3>
[[!wsnotify_test? 
    &message=`Это уведомление показывается 15 секунд` 
    &type=`info` 
    &duration=`15000`
]]
```

## API для сторонних разработчиков

### Подписка на события WebSocket

Сторонние скрипты могут подписываться на события WSNotify через глобальный объект `WSNotifyHelpers`:

```javascript
// Дождаться инициализации WSNotify
document.addEventListener('DOMContentLoaded', function() {
    // Проверить, что WSNotify загружен
    if (typeof WSNotifyHelpers !== 'undefined') {
        setupWSNotifyHandlers();
    } else {
        // Подождать загрузки
        setTimeout(function() {
            if (typeof WSNotifyHelpers !== 'undefined') {
                setupWSNotifyHandlers();
            }
        }, 1000);
    }
});

function setupWSNotifyHandlers() {
    // Подписка на конкретное событие
    WSNotifyHelpers.on('new_order', function(data) {
        console.log('Новый заказ:', data);
        updateOrdersCounter(data.data.order_id);
    });
    
    // Подписка на все уведомления
    WSNotifyHelpers.on('notification', function(data) {
        console.log('Получено уведомление:', data);
        handleNotification(data);
    });
    
    // Подписка на события подключения
    WSNotifyHelpers.on('connected', function() {
        console.log('WebSocket подключен');
        showConnectionStatus(true);
    });
    
    WSNotifyHelpers.on('disconnected', function() {
        console.log('WebSocket отключен');
        showConnectionStatus(false);
    });
}
```

### Проверка доступности API

```javascript
// Функция для безопасной работы с WSNotify
function withWSNotify(callback) {
    if (typeof WSNotifyHelpers !== 'undefined' && WSNotifyHelpers.isConnected()) {
        callback(WSNotifyHelpers);
    } else {
        console.warn('WSNotify не доступен или не подключен');
    }
}

// Использование
withWSNotify(function(wsnotify) {
    wsnotify.on('custom_event', function(data) {
        // Обработка события
    });
});
```

### Отправка пользовательских уведомлений

```javascript
// Показать пользовательское уведомление
function showCustomNotification(message, type = 'info') {
    if (typeof WSNotifyHelpers !== 'undefined') {
        WSNotifyHelpers.showMessage(message, type);
    } else {
        // Fallback для случая, когда WSNotify недоступен
        alert(message);
    }
}

// Примеры использования
showCustomNotification('Данные сохранены', 'success');
showCustomNotification('Ошибка валидации', 'error');
showCustomNotification('Проверьте введенные данные', 'warning');
```

### Интеграция с формами

```javascript
// Обработка отправки формы с уведомлениями
document.getElementById('myForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    
    fetch('/path/to/processor', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showCustomNotification('Форма отправлена успешно', 'success');
        } else {
            showCustomNotification('Ошибка: ' + data.message, 'error');
        }
    })
    .catch(error => {
        showCustomNotification('Ошибка сети', 'error');
    });
});
```

### Обработка событий в реальном времени

```javascript
// Обновление счетчиков в реальном времени
WSNotifyHelpers.on('cart_update', function(data) {
    const cartCounter = document.getElementById('cart-counter');
    if (cartCounter) {
        cartCounter.textContent = data.data.items_count;
        cartCounter.classList.add('updated');
        setTimeout(() => cartCounter.classList.remove('updated'), 1000);
    }
});

// Обновление статуса заказа
WSNotifyHelpers.on('order_status_changed', function(data) {
    const statusElement = document.getElementById('order-status-' + data.data.order_id);
    if (statusElement) {
        statusElement.textContent = data.data.new_status;
        statusElement.className = 'status status-' + data.data.new_status.toLowerCase();
    }
});

// Уведомления о новых сообщениях
WSNotifyHelpers.on('new_message', function(data) {
    const messagesCounter = document.getElementById('messages-counter');
    if (messagesCounter) {
        const currentCount = parseInt(messagesCounter.textContent) || 0;
        messagesCounter.textContent = currentCount + 1;
        messagesCounter.style.display = 'inline';
    }
    
    // Показать уведомление
    showCustomNotification(`Новое сообщение от ${data.data.sender_name}`, 'info');
});
```

### Создание собственных обработчиков

```javascript
// Класс для управления уведомлениями в приложении
class AppNotificationManager {
    constructor() {
        this.handlers = {};
        this.init();
    }
    
    init() {
        if (typeof WSNotifyHelpers !== 'undefined') {
            this.setupHandlers();
        } else {
            // Повторить попытку через секунду
            setTimeout(() => this.init(), 1000);
        }
    }
    
    setupHandlers() {
        // Подписка на все уведомления
        WSNotifyHelpers.on('notification', (data) => {
            this.handleNotification(data);
        });
        
        // Подписка на события подключения
        WSNotifyHelpers.on('connected', () => {
            this.onConnected();
        });
        
        WSNotifyHelpers.on('disconnected', () => {
            this.onDisconnected();
        });
    }
    
    handleNotification(data) {
        // Вызвать зарегистрированные обработчики
        if (this.handlers[data.event]) {
            this.handlers[data.event].forEach(handler => {
                try {
                    handler(data);
                } catch (error) {
                    console.error('Ошибка в обработчике уведомления:', error);
                }
            });
        }
        
        // Общий обработчик
        if (this.handlers['*']) {
            this.handlers['*'].forEach(handler => {
                try {
                    handler(data);
                } catch (error) {
                    console.error('Ошибка в общем обработчике:', error);
                }
            });
        }
    }
    
    on(event, handler) {
        if (!this.handlers[event]) {
            this.handlers[event] = [];
        }
        this.handlers[event].push(handler);
    }
    
    off(event, handler) {
        if (this.handlers[event]) {
            const index = this.handlers[event].indexOf(handler);
            if (index > -1) {
                this.handlers[event].splice(index, 1);
            }
        }
    }
    
    onConnected() {
        console.log('Приложение подключено к WebSocket');
        this.showConnectionStatus(true);
    }
    
    onDisconnected() {
        console.log('Приложение отключено от WebSocket');
        this.showConnectionStatus(false);
    }
    
    showConnectionStatus(connected) {
        const indicator = document.getElementById('connection-indicator');
        if (indicator) {
            indicator.className = connected ? 'connected' : 'disconnected';
            indicator.title = connected ? 'Подключено' : 'Отключено';
        }
    }
}

// Инициализация менеджера уведомлений
const appNotifications = new AppNotificationManager();

// Регистрация обработчиков
appNotifications.on('new_order', function(data) {
    updateOrdersList(data.data);
});

appNotifications.on('user_online', function(data) {
    updateUserStatus(data.data.user_id, 'online');
});

// Обработчик для всех событий
appNotifications.on('*', function(data) {
    console.log('Получено событие:', data.event, data);
});
```

### Интеграция с Vue.js/React

```javascript
// Vue.js компонент
Vue.component('notification-listener', {
    mounted() {
        this.setupWSNotify();
    },
    
    methods: {
        setupWSNotify() {
            if (typeof WSNotifyHelpers !== 'undefined') {
                WSNotifyHelpers.on('notification', this.handleNotification);
                WSNotifyHelpers.on('cart_update', this.updateCart);
            }
        },
        
        handleNotification(data) {
            this.$emit('notification', data);
        },
        
        updateCart(data) {
            this.$store.commit('updateCart', data.data);
        }
    },
    
    beforeDestroy() {
        if (typeof WSNotifyHelpers !== 'undefined') {
            WSNotifyHelpers.off('notification', this.handleNotification);
            WSNotifyHelpers.off('cart_update', this.updateCart);
        }
    },
    
    template: '<div></div>'
});

// React Hook
function useWSNotify() {
    const [connected, setConnected] = useState(false);
    
    useEffect(() => {
        if (typeof WSNotifyHelpers !== 'undefined') {
            const handleConnected = () => setConnected(true);
            const handleDisconnected = () => setConnected(false);
            
            WSNotifyHelpers.on('connected', handleConnected);
            WSNotifyHelpers.on('disconnected', handleDisconnected);
            
            setConnected(WSNotifyHelpers.isConnected());
            
            return () => {
                WSNotifyHelpers.off('connected', handleConnected);
                WSNotifyHelpers.off('disconnected', handleDisconnected);
            };
        }
    }, []);
    
    const subscribe = useCallback((event, handler) => {
        if (typeof WSNotifyHelpers !== 'undefined') {
            WSNotifyHelpers.on(event, handler);
            return () => WSNotifyHelpers.off(event, handler);
        }
    }, []);
    
    return { connected, subscribe };
}
```

### Отладка и мониторинг

```javascript
// Включить подробную отладку для разработки
function enableWSNotifyDebug() {
    if (typeof WSNotifyHelpers !== 'undefined') {
        // Логировать все события
        WSNotifyHelpers.on('*', function(data) {
            console.group('WSNotify Event: ' + data.event);
            console.log('Data:', data);
            console.log('Timestamp:', new Date().toISOString());
            console.groupEnd();
        });
        
        // Мониторинг состояния подключения
        WSNotifyHelpers.on('connected', () => {
            console.log('%c WebSocket Connected ', 'background: green; color: white');
        });
        
        WSNotifyHelpers.on('disconnected', () => {
            console.log('%c WebSocket Disconnected ', 'background: red; color: white');
        });
        
        WSNotifyHelpers.on('auth_error', (error) => {
            console.error('WSNotify Auth Error:', error);
        });
    }
}

// Включить в режиме разработки
if (window.location.hostname === 'localhost' || window.location.hostname.includes('dev')) {
    enableWSNotifyDebug();
}
```

## Подписка на дополнительные каналы

### Каналы по умолчанию vs дополнительные каналы

По умолчанию WSNotify подписывается только на каналы с флагом `default = 1` в базе данных. Это позволяет контролировать, какие каналы загружаются автоматически для всех пользователей.

### Подписка на дополнительные каналы из JavaScript

```javascript
// Подписаться на дополнительный канал
WSNotifyHelpers.subscribeToChannel('special_offers');

// Подписаться на несколько каналов
WSNotifyHelpers.subscribeToChannels(['vip_notifications', 'admin_alerts']);

// Отписаться от канала
WSNotifyHelpers.unsubscribeFromChannel('special_offers');

// Отписаться от нескольких каналов
WSNotifyHelpers.unsubscribeFromChannels(['vip_notifications', 'admin_alerts']);
```

### Условная подписка на каналы

```javascript
// Подписаться на канал в зависимости от роли пользователя
document.addEventListener('DOMContentLoaded', function() {
    if (typeof WSNotifyHelpers !== 'undefined') {
        // Дождаться подключения
        WSNotifyHelpers.on('connected', function() {
            // Проверить роль пользователя и подписаться на соответствующие каналы
            if (window.wsnotifyConfig.userGroups.includes('Administrator')) {
                WSNotifyHelpers.subscribeToChannel('admin_notifications');
                WSNotifyHelpers.subscribeToChannel('system_alerts');
            }
            
            if (window.wsnotifyConfig.userGroups.includes('Manager')) {
                WSNotifyHelpers.subscribeToChannel('manager_reports');
            }
            
            // Подписка для VIP пользователей
            if (window.wsnotifyConfig.userId && isVipUser(window.wsnotifyConfig.userId)) {
                WSNotifyHelpers.subscribeToChannel('vip_offers');
            }
        });
    }
});

function isVipUser(userId) {
    // Логика определения VIP пользователя
    return userId > 0; // Пример
}
```

### Динамическая подписка на каналы

```javascript
// Подписка на канал при выполнении определенного действия
function subscribeToProductUpdates(productId) {
    const channelName = 'product_' + productId;
    WSNotifyHelpers.subscribeToChannel(channelName);
    
    // Обработка уведомлений для этого продукта
    WSNotifyHelpers.on('product_update', function(data) {
        if (data.data.product_id === productId) {
            updateProductInfo(data.data);
        }
    });
}

// Отписка при уходе со страницы продукта
function unsubscribeFromProductUpdates(productId) {
    const channelName = 'product_' + productId;
    WSNotifyHelpers.unsubscribeFromChannel(channelName);
}
```

### Управление каналами через gtsapipackages

Каналы управляются через систему gtsapipackages. Для создания и настройки каналов:

1. **Создание канала в базе данных:**
```sql
INSERT INTO wsnotify_channels (name, description, active, `default`) 
VALUES ('special_offers', 'Специальные предложения', 1, 0);
```

2. **Установка канала как канал по умолчанию:**
```sql
UPDATE wsnotify_channels SET `default` = 1 WHERE name = 'news';
```

3. **Отключение канала по умолчанию:**
```sql
UPDATE wsnotify_channels SET `default` = 0 WHERE name = 'old_channel';
```

### Примеры использования каналов

```javascript
// Подписка на канал уведомлений о заказах для менеджеров
if (window.wsnotifyConfig.userGroups.includes('Manager')) {
    WSNotifyHelpers.subscribeToChannel('order_notifications');
    
    WSNotifyHelpers.on('new_order', function(data) {
        showOrderNotification(data);
    });
    
    WSNotifyHelpers.on('order_status_changed', function(data) {
        updateOrderStatus(data);
    });
}

// Подписка на канал технических уведомлений для администраторов
if (window.wsnotifyConfig.userGroups.includes('Administrator')) {
    WSNotifyHelpers.subscribeToChannel('system_monitoring');
    
    WSNotifyHelpers.on('system_error', function(data) {
        showCriticalAlert(data);
    });
    
    WSNotifyHelpers.on('backup_complete', function(data) {
        showBackupStatus(data);
    });
}

// Подписка на персональные уведомления
if (window.wsnotifyConfig.userId > 0) {
    const personalChannel = 'user_' + window.wsnotifyConfig.userId;
    WSNotifyHelpers.subscribeToChannel(personalChannel);
    
    WSNotifyHelpers.on('personal_message', function(data) {
        showPersonalMessage(data);
    });
}
```

### Отправка уведомлений в дополнительные каналы

```php
<?php
// Отправка уведомления в канал, который не является каналом по умолчанию
$wsnotify = $modx->getService('wsnotify', 'WSNotify', MODX_CORE_PATH . 'components/wsnotify/model/');

// Уведомление для VIP клиентов
$wsnotify->sendToChannels(['vip_offers'], [
    'type' => 'notification',
    'event' => 'vip_offer',
    'message' => 'Эксклюзивное предложение только для VIP клиентов!',
    'data' => [
        'offer_id' => 123,
        'discount' => 50,
        'expires_at' => '2024-12-31'
    ]
]);

// Техническое уведомление для администраторов
$wsnotify->sendToChannels(['system_monitoring'], [
    'type' => 'alert',
    'event' => 'system_error',
    'message' => 'Критическая ошибка в системе',
    'data' => [
        'error_code' => 'DB_CONNECTION_FAILED',
        'timestamp' => time(),
        'server' => $_SERVER['SERVER_NAME']
    ]
]);
```

### Лучшие практики

1. **Используйте каналы по умолчанию** для общих уведомлений, которые должны получать все пользователи
2. **Создавайте специализированные каналы** для уведомлений определенных групп пользователей
3. **Подписывайтесь динамически** на каналы в зависимости от контекста (страница, роль пользователя)
4. **Отписывайтесь от каналов** когда они больше не нужны, чтобы избежать лишнего трафика
5. **Используйте осмысленные имена каналов** для легкой идентификации

### Структура каналов

Рекомендуемая структура именования каналов:

- `news` - общие новости (канал по умолчанию)
- `alerts` - важные уведомления (канал по умолчанию)
- `admin_notifications` - уведомления для администраторов
- `manager_reports` - отчеты для менеджеров
- `vip_offers` - предложения для VIP клиентов
- `product_{id}` - уведомления о конкретном продукте
- `user_{id}` - персональные уведомления пользователя
- `system_monitoring` - системные уведомления
