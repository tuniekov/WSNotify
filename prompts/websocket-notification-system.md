# Система WebSocket уведомлений для MODX (WSNotify)

## Описание задачи

Необходимо реализовать компонент **WSNotify** на основе **PVExtra** для системы отправки уведомлений из MODX в браузер без опроса браузером сервера (push-уведомления в реальном времени) с поддержкой множественных MODX серверов.

## Архитектура системы

### Общая схема:
- **Один WebSocket сервер на Node.js** обслуживает несколько MODX сайтов
- **Каждый MODX сайт** отправляет уведомления только своим пользователям
- **Управление каналами** через gtsapipackages на каждом MODX сайте
- **Конфигурация MODX сайтов** хранится в config.json на WebSocket сервере

## Требования

### Функциональные требования:
1. **Компонент на основе PVExtra:**
   - Стандартная структура MODX компонента
   - Схема базы данных в XML
   - Сервисный класс WSNotify
   - Конфигурация через gtsapipackages

2. **Отправка уведомлений для конкретных пользователей/групп** - не broadcast для всех
3. **Поддержка различных типов получателей:**
   - Массив конкретных пользователей
   - Массив групп пользователей  
   - Каналы (управляемые через MODX)
   - Анонимные пользователи
4. **Передача структурированных данных** - не только сообщения, но и данные для выполнения действий
5. **Примеры использования:**
   - Процент выполнения задачи процессом
   - Обновление данных в реальном времени
   - Выполнение действий сторонними JS скриптами

### Технические требования:
1. **Node.js доступен** на сервере
2. **Без использования jQuery** - только vanilla JavaScript
3. **Без процессоров MODX** - прямая интеграция
4. **Управление каналами через gtsapipackages** - создание в админке каждого MODX сайта

## Выбранное решение

**WebSocket сервер на Node.js + Socket.IO с поддержкой множественных MODX сайтов**

### Преимущества:
- Реальное время без задержек
- Поддержка комнат для групповых уведомлений
- Автоматический fallback на long polling
- Простая интеграция с MODX
- Масштабируемость для множественных сайтов

## Архитектура системы

### 1. Компоненты системы

#### Node.js WebSocket сервер (единый для всех MODX сайтов)
- **Порт:** 3000 (настраивается в конфиге)
- **Технология:** Socket.IO с пространствами имен
- **Функции:**
  - Управление подключениями пользователей по сайтам
  - Пространства имен Socket.IO для каждого MODX сайта
  - Комнаты для групп пользователей и каналов
  - HTTP API для отправки уведомлений из PHP
  - Синхронизация каналов с каждым MODX сайтом

#### Компонент WSNotify (на каждом MODX сайте)
- **Базируется на PVExtra**
- **Новые методы:**
  - `sendToUsers(array $userIds, array $data)`
  - `sendToGroups(array $groupNames, array $data)`
  - `sendToChannels(array $channels, array $data)`
  - `sendToAnonymous(array $data)`
- **Интеграция с Node.js** через HTTP API

#### Клиентская часть (JavaScript)
- **Vanilla JavaScript** (без jQuery)
- **WebSocket клиент** для подключения к серверу
- **Подключение к пространству имен** соответствующего MODX сайта
- **Система обработчиков событий** для различных типов уведомлений
- **Автоматическое выполнение действий** на основе полученных данных

### 2. База данных (на каждом MODX сайте)

#### Таблица каналов
```sql
CREATE TABLE `modx_wsnotify_channels` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text,
  `active` tinyint(1) DEFAULT 1,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
);
```

#### Таблица подписок (опционально)
```sql
CREATE TABLE `modx_wsnotify_subscriptions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `channel_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `user_group` varchar(255) DEFAULT NULL,
  `active` tinyint(1) DEFAULT 1,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `channel_id` (`channel_id`),
  KEY `user_id` (`user_id`)
);
```

### 3. Конфигурация WebSocket сервера

#### config.json (на Node.js сервере)
```json
{
  "port": 3000,
  "modx_sites": {
    "site1": {
      "name": "Основной сайт",
      "host": "https://site1.com",
      "api_key": "secret_key_1",
      "api_endpoints": {
        "channels": "/assets/components/wsnotify/api/channels.php",
        "auth": "/assets/components/wsnotify/api/auth.php"
      }
    },
    "site2": {
      "name": "Дополнительный сайт", 
      "host": "https://site2.com",
      "api_key": "secret_key_2",
      "api_endpoints": {
        "channels": "/assets/components/wsnotify/api/channels.php",
        "auth": "/assets/components/wsnotify/api/auth.php"
      }
    }
  },
  "auth": {
    "enabled": true,
    "timeout": 30000
  },
  "channels": {
    "sync_interval": 60000
  }
}
```

### 4. Структура данных уведомлений

```json
{
  "site": "site1",
  "type": "notification|progress|action|data",
  "event": "task_progress|new_message|reload_table",
  "target": "users|groups|channels|anonymous",
  "message": "Текст уведомления",
  "data": {
    "progress": 75,
    "task_id": 456,
    "action": "update_progress_bar",
    "selector": "#task-progress-456",
    "custom_data": "любые дополнительные данные"
  },
  "timestamp": 1641234567,
  "persistent": true
}
```

## Структура файлов

### Node.js сервер (единый)
```
/websocket-server/
├── wsnotifyserver.js         # Основной WebSocket сервер
├── package.json
├── config/
│   └── config.json          # Конфигурация MODX сайтов
├── lib/
│   ├── auth.js             # Аутентификация через MODX API
│   ├── channels.js         # Синхронизация каналов с сайтами
│   ├── sites.js            # Управление подключениями к сайтам
│   └── logger.js           # Логирование
└── api/
    └── notify.js           # HTTP API для приема уведомлений
```

### Компонент WSNotify (на каждом MODX сайте)
```
/core/components/wsnotify/
├── model/
│   ├── wsnotify.class.php           # Основной класс компонента
│   └── schema/
│       └── wsnotify.mysql.schema.xml # Схема базы данных
├── websocket/
│   ├── client.class.php             # HTTP клиент для Node.js
│   └── channels.class.php           # Управление каналами
└── elements/
    └── snippets/
        └── wsnotify_init.php        # Инициализация WebSocket на фронте
```

### API endpoints (на каждом MODX сайте)
```
/assets/components/wsnotify/api/
├── channels.php                     # HTTP API для получения каналов
└── auth.php                        # HTTP API для аутентификации
```

### Клиентские файлы (на каждом MODX сайте)
```
/assets/components/wsnotify/js/
├── websocket-client.js              # WebSocket клиент
├── notification-handlers.js        # Обработчики уведомлений
├── server-manager.js               # Управление подключением к серверу
└── main.js                         # Основной файл
```

### Конфигурация gtsapipackages (на каждом MODX сайте)
```
/_build/configs/gtsapipackages.js    # Настройка административного интерфейса
```

## Примеры использования

### 1. Отправка прогресса выполнения задачи конкретному пользователю
```php
$wsnotify->sendToUsers([123], [
    'type' => 'progress',
    'event' => 'task_progress',
    'message' => 'Обработка файлов...',
    'data' => [
        'progress' => 45,
        'task_id' => 123,
        'action' => 'update_progress',
        'selector' => '#upload-progress'
    ]
]);
```

### 2. Уведомление группе администраторов
```php
$wsnotify->sendToGroups(['Administrator', 'Manager'], [
    'type' => 'notification',
    'event' => 'system_alert',
    'message' => 'Критическая ошибка в системе',
    'data' => [
        'level' => 'error',
        'action' => 'show_modal',
        'modal_id' => 'error-modal'
    ]
]);
```

### 3. Отправка в канал
```php
$wsnotify->sendToChannels(['news', 'updates'], [
    'type' => 'data',
    'event' => 'content_updated',
    'data' => [
        'resource_id' => 123,
        'action' => 'reload_content'
    ]
]);
```

### 4. Обновление данных для анонимных пользователей
```php
$wsnotify->sendToAnonymous([
    'type' => 'data',
    'event' => 'price_update',
    'data' => [
        'product_id' => 456,
        'new_price' => 1500,
        'action' => 'update_price',
        'selector' => '.product-456 .price'
    ]
]);
```

## Клиентская обработка (JavaScript)

### Подключение к WebSocket серверу
```javascript
// Определяем ключ текущего сайта
const siteKey = wsnotifyConfig.siteKey; // Из PHP конфига

// Подключаемся к пространству имен сайта
const socket = io(`ws://localhost:3000/${siteKey}`);

socket.on('connect', () => {
    socket.emit('authenticate', {
        userId: wsnotifyConfig.userId,
        groups: wsnotifyConfig.userGroups,
        channels: wsnotifyConfig.channels
    });
});
```

### Обработка уведомлений
```javascript
// Регистрация обработчика
wsnotify.on('task_progress', function(data) {
    const element = document.querySelector(data.data.selector);
    if (element) {
        element.style.width = data.data.progress + '%';
    }
});

// Автоматическое выполнение действий
wsnotify.on('notification', function(data) {
    if (data.data && data.data.action) {
        executeAction(data.data);
    }
});
```

## Конфигурация gtsapipackages

### Управление каналами (на каждом MODX сайте)
```javascript
wsnotify: {
    name: 'wsnotify',
    gtsAPITables: {
        wsnotify_channels: {
            table: 'wsnotify_channels',
            version: 1,
            type: 1,
            authenticated: true,
            groups: 'Administrator',
            active: true,
            properties: {
                actions: {
                    read: {},
                    create: { groups: 'Administrator' },
                    update: { groups: 'Administrator' },
                    delete: { groups: 'Administrator' },
                    sync_to_websocket: {
                        action: 'wsnotify/sync_channels',
                        head: true,
                        icon: 'pi pi-refresh',
                        label: 'Синхронизировать с WebSocket',
                        groups: 'Administrator'
                    }
                },
                fields: {
                    id: { type: 'view' },
                    name: { label: 'Название канала', type: 'text' },
                    description: { label: 'Описание', type: 'textarea' },
                    active: { label: 'Активен', type: 'boolean' },
                    created_at: { label: 'Создан', type: 'view' },
                    updated_at: { label: 'Обновлен', type: 'view' }
                },
                autocomplete: {
                    tpl: '{$name}',
                    where: { "name:LIKE": "%query%" }
                }
            }
        }
    }
}
```

## Этапы реализации

### Этап 1: Компонент WSNotify на основе PVExtra
1. Создание структуры компонента PVExtra
2. Схема базы данных (wsnotify_channels, wsnotify_subscriptions)
3. Основной класс WSNotify с методами отправки уведомлений
4. Конфигурация gtsapipackages для управления каналами

### Этап 2: Node.js WebSocket сервер
1. Создание базового WebSocket сервера на Socket.IO
2. Поддержка пространств имен для множественных MODX сайтов
3. HTTP API для приема уведомлений от MODX сайтов
4. Система аутентификации через API MODX сайтов
5. Синхронизация каналов с каждым MODX сайтом

### Этап 3: PHP интеграция
1. HTTP клиент для отправки данных в Node.js
2. API endpoints для получения каналов и аутентификации
3. Методы для различных типов отправки уведомлений
4. Интеграция с gtsapipackages

### Этап 4: Клиентская часть
1. WebSocket клиент на vanilla JavaScript
2. Подключение к соответствующему пространству имен
3. Система обработчиков событий
4. Автоматическое выполнение действий

### Этап 5: Тестирование и оптимизация
1. Тестирование с множественными MODX сайтами
2. Проверка производительности
3. Обработка ошибок и переподключений
4. Документация и примеры использования

## Конфигурация

### MODX настройки (на каждом сайте)
- `wsnotify_websocket_url` - URL WebSocket сервера
- `wsnotify_websocket_port` - порт WebSocket сервера
- `wsnotify_site_key` - уникальный ключ MODX сайта
- `wsnotify_api_key` - ключ API для аутентификации
- `wsnotify_enabled` - включение/выключение WebSocket

## Безопасность

1. **Аутентификация сайтов** через API ключи в конфигурации
2. **Аутентификация пользователей** через API каждого MODX сайта
3. **Изоляция данных** - каждый сайт работает только со своими пользователями
4. **Валидация данных** на всех уровнях
5. **Ограничение доступа к каналам** на основе групп пользователей
6. **Логирование всех операций** для аудита
7. **Rate limiting** для предотвращения спама

## Мониторинг

1. **Логирование подключений** по сайтам
2. **Метрики производительности** (количество сообщений, время доставки)
3. **Мониторинг ошибок** и автоматическое переподключение
4. **Статистика использования каналов** по каждому сайту
5. **Мониторинг состояния MODX сайтов**

---

**Дата создания:** 10.08.2025  
**Дата обновления:** 10.08.2025  
**Статус:** Готов к реализации  
**Приоритет:** Высокий
