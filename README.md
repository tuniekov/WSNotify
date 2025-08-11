# WSNotify - WebSocket уведомления для MODX

Компонент WSNotify предоставляет систему WebSocket уведомлений в реальном времени для MODX Revolution с поддержкой множественных сайтов.

## Особенности

- ✅ **WebSocket уведомления в реальном времени** без опроса сервера
- ✅ **Поддержка множественных MODX сайтов** на одном WebSocket сервере
- ✅ **Управление каналами** через gtsapipackages
- ✅ **Различные типы получателей**: пользователи, группы, каналы, анонимные
- ✅ **Автоматическое переподключение** при разрыве соединения
- ✅ **Vanilla JavaScript** - без зависимостей от jQuery
- ✅ **Безопасность** - API ключи и изоляция данных между сайтами
- ✅ **Простая интеграция** - один сниппет для инициализации

## Архитектура

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   MODX Site 1   │    │  WebSocket       │    │   MODX Site 2   │
│                 │    │  Server          │    │                 │
│ ┌─────────────┐ │    │  (Node.js)       │    │ ┌─────────────┐ │
│ │ WSNotify    │◄┼────┤                  ├────┤►│ WSNotify    │ │
│ │ Component   │ │    │ ┌──────────────┐ │    │ │ Component   │ │
│ └─────────────┘ │    │ │ Namespace    │ │    │ └─────────────┘ │
│                 │    │ │ /site1       │ │    │                 │
│ ┌─────────────┐ │    │ └──────────────┘ │    │ ┌─────────────┐ │
│ │ Channels    │ │    │ ┌──────────────┐ │    │ │ Channels    │ │
│ │ Management  │ │    │ │ Namespace    │ │    │ │ Management  │ │
│ └─────────────┘ │    │ │ /site2       │ │    │ └─────────────┘ │
└─────────────────┘    │ └──────────────┘ │    └─────────────────┘
                       └──────────────────┘
```

## Быстрый старт

### 1. Установка компонента

1. Установите компонент через Package Manager MODX
2. Настройте параметры в **Системные настройки > wsnotify**

### 2. Настройка WebSocket сервера

```bash
cd WSNotifyServer
npm install
# Отредактируйте config.json - добавьте ваши MODX сайты
npm start
```

WebSocket сервер готов к использованию! Подробная документация в `WSNotifyServer/README.md`

### 3. Инициализация на странице

```html
<!-- В шаблоне MODX -->
[[!wsnotify_init]]
```

### 4. Отправка уведомлений

```php
<?php
$wsnotify = $modx->getService('wsnotify', 'WSNotify', MODX_CORE_PATH . 'components/wsnotify/model/');

// Уведомление конкретным пользователям
$wsnotify->sendToUsers([123, 456], [
    'type' => 'notification',
    'event' => 'new_message',
    'message' => 'У вас новое сообщение!'
]);

// Уведомление группам
$wsnotify->sendToGroups(['Administrator'], [
    'type' => 'notification',
    'event' => 'system_alert',
    'message' => 'Системное уведомление'
]);
```

## Структура проекта

```
WSNotify/
├── WSNotifyServer/                  # WebSocket сервер Node.js
│   ├── package.json                # Зависимости Node.js
│   ├── wsnotifyserver.js           # Основной сервер
│   ├── config.json                 # Конфигурация сайтов
│   ├── README.md                   # Документация сервера
│   └── .gitignore                  # Исключения Git
├── _build/                          # Конфигурация сборки
│   ├── config.js                    # Основная конфигурация
│   └── configs/
│       ├── gtsapipackages.js        # Настройка админки каналов
│       ├── settings.js              # Системные настройки
│       └── snippets.js              # Конфигурация сниппетов
├── assets/components/wsnotify/
│   ├── api/                         # API endpoints
│   │   ├── auth.php                 # Аутентификация пользователей
│   │   └── channels.php             # Получение каналов
│   ├── client/                      # Клиентские файлы (не очищаются при сборке)
│   │   ├── css/
│   │   │   └── websocket-client.css # Стили для уведомлений
│   │   └── js/
│   │       ├── websocket-client.js  # WebSocket клиент
│   │       └── main.js              # Основной файл и UI
│   └── web/                         # Ресурсы сборки (очищаются при npm run build)
│       ├── css/
│       │   └── main.css             # Стили основного приложения
│       └── js/
│           └── main.js              # Собранное приложение
├── core/components/wsnotify/
│   ├── docs/                        # Документация
│   │   ├── changelog.txt
│   │   ├── examples.md              # Примеры использования
│   │   ├── license.txt
│   │   └── readme.txt
│   ├── elements/snippets/
│   │   └── wsnotify_init.php        # Сниппет инициализации
│   └── model/
│       ├── wsnotify.class.php       # Основной класс
│       └── schema/
│           └── wsnotify.mysql.schema.xml # Схема БД
└── prompts/
    └── websocket-notification-system.md # Техническое задание
```

## Настройки

| Параметр | Описание | По умолчанию |
|----------|----------|--------------|
| `wsnotify_websocket_url` | URL WebSocket сервера | `http://localhost:3100` |
| `wsnotify_site_key` | Уникальный ключ MODX сайта | `default` |
| `wsnotify_api_key` | API ключ для аутентификации | `` |
| `wsnotify_enabled` | Включить WebSocket уведомления | `false` |

## Методы отправки уведомлений

### PHP методы

```php
// Конкретным пользователям
$wsnotify->sendToUsers(array $userIds, array $data);

// Группам пользователей  
$wsnotify->sendToGroups(array $groupNames, array $data);

// В каналы
$wsnotify->sendToChannels(array $channels, array $data);

// Анонимным пользователям
$wsnotify->sendToAnonymous(array $data);
```

### JavaScript обработчики

```javascript
// Регистрация обработчика события
WSNotifyHelpers.on('new_message', function(data) {
    console.log('Новое сообщение:', data.message);
});

// Показ уведомления
WSNotifyHelpers.showMessage('Тестовое уведомление', 'info');

// Проверка подключения
if (WSNotifyHelpers.isConnected()) {
    console.log('WebSocket подключен');
}
```

## Управление каналами

Каналы управляются через административный интерфейс gtsapipackages:

1. Перейдите в админку MODX
2. Найдите раздел **WSNotify > Каналы**
3. Создавайте и редактируйте каналы
4. Используйте кнопку **"Синхронизировать с WebSocket"** для обновления сервера

## Требования

- MODX Revolution 2.6+
- PHP 7.4+
- Node.js для WebSocket сервера
- Socket.IO библиотека
- gtsapipackages для управления каналами

## Документация

- [Техническое задание](prompts/websocket-notification-system.md)
- [Примеры использования](core/components/wsnotify/docs/examples.md)
- [Руководство пользователя](core/components/wsnotify/docs/readme.txt)

## Лицензия

MIT License - см. [LICENSE](core/components/wsnotify/docs/license.txt)

## Поддержка

Для вопросов и предложений создавайте issues в репозитории проекта.
