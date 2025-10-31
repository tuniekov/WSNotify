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

### PHP методы высокого уровня

```php
// Конкретным пользователям
$wsnotify->sendToUsers(array $userIds, array $data);

// Группам пользователей  
$wsnotify->sendToGroups(array $groupNames, array $data);

// В каналы (требуется предварительное создание канала)
$wsnotify->sendToChannels(array $channels, array $data);

// Анонимным пользователям
$wsnotify->sendToAnonymous(array $data);

// Всем пользователям (авторизованным и анонимным)
$wsnotify->sendToAll(array $data);
```

### Прямая отправка через sendToWebSocket (без каналов)

Для отправки уведомлений без необходимости создания каналов можно использовать методы `sendToUsers`, `sendToGroups`, `sendToAnonymous` или `sendToAll`. Эти методы работают напрямую с WebSocket сервером и не требуют предварительной настройки каналов.

```php
<?php
$wsnotify = $modx->getService('wsnotify', 'WSNotify', MODX_CORE_PATH . 'components/wsnotify/model/');

// Отправка конкретным пользователям (без канала)
$wsnotify->sendToUsers([1, 2, 3], [
    'type' => 'notification',
    'event' => 'direct_message',
    'message' => 'Прямое уведомление пользователям',
    'data' => [
        'priority' => 'high',
        'action_url' => '/profile'
    ]
]);

// Отправка группам (без канала)
$wsnotify->sendToGroups(['Administrator', 'Manager'], [
    'type' => 'alert',
    'event' => 'system_warning',
    'message' => 'Системное предупреждение для администраторов'
]);

// Отправка всем анонимным пользователям (без канала)
$wsnotify->sendToAnonymous([
    'type' => 'info',
    'event' => 'maintenance',
    'message' => 'Плановые технические работы через 10 минут'
]);

// Отправка всем пользователям сайта (без канала)
$wsnotify->sendToAll([
    'type' => 'warning',
    'event' => 'global_announcement',
    'message' => 'Важное объявление для всех пользователей'
]);
```

**Когда использовать каналы, а когда прямую отправку:**

- **Используйте каналы** (`sendToChannels`) когда:
  - Нужна организованная структура уведомлений
  - Пользователи должны подписываться/отписываться от определенных типов уведомлений
  - Требуется управление подписками через интерфейс

- **Используйте прямую отправку** (`sendToUsers`, `sendToGroups`, `sendToAnonymous`, `sendToAll`) когда:
  - Нужно быстро отправить уведомление без настройки каналов
  - Уведомление разовое или системное
  - Получатели определяются программно (по ID, группам)

### JavaScript обработчики

```javascript
// Регистрация обработчика события
const result = WSNotifyHelpers.on('new_message', function(data) {
    console.log('Новое сообщение:', data.message);
});

// Проверка успешности регистрации
if (!result.success) {
    console.error('Ошибка регистрации обработчика:', result.error);
}

// Показ уведомления
WSNotifyHelpers.showMessage('Тестовое уведомление', 'info');

// Проверка подключения
if (WSNotifyHelpers.isConnected()) {
    console.log('WebSocket подключен');
}
```

## Управление каналами

### Создание каналов

Перед отправкой уведомлений в каналы необходимо создать эти каналы в базе данных.

**Через административный интерфейс:**

1. Перейдите в админку MODX
2. Найдите раздел **WSNotify > Каналы** (вкладка WSNotifyChannel)
3. Нажмите "Создать" и заполните поля:
   - **Название канала** - уникальное имя канала (например: `news`, `alerts`)
   - **Описание** - описание назначения канала
   - **Активен** - включить/выключить канал
   - **Канал по умолчанию** - автоматически подключать для всех пользователей
4. Сохраните канал
5. Нажмите кнопку **"Синхронизировать с WebSocket"** для обновления сервера

**Программное создание канала:**

```php
<?php
// Создание канала через базу данных
$channel = $modx->newObject('WSNotifyChannel');
$channel->set('name', 'news');
$channel->set('description', 'Канал новостей');
$channel->set('active', 1);
$channel->set('default', 1); // Канал по умолчанию
$channel->save();

// Синхронизация с WebSocket сервером
$wsnotify = $modx->getService('wsnotify', 'WSNotify', MODX_CORE_PATH . 'components/wsnotify/model/');
$wsnotify->syncChannelsToWebSocket();
```

### Редактор каналов с табами

Компонент предоставляет удобный интерфейс управления каналами через два таба.

#### Создание страницы управления

Для создания страницы управления каналами в админке MODX:

1. Создайте новый ресурс в админке MODX
2. Установите шаблон с поддержкой FENOM
3. Поместите в содержимое ресурса следующий код:

```fenom
{'!PVTabs' | snippet : [
    'tabs' => [
        'WSNotifyChannel' => [
            'title' => 'Управление каналами',
            'table' => 'WSNotifyChannel',
        ],
        'WSNotifySubscription' => [
            'title' => 'Управление подписками',
            'table' => 'WSNotifySubscription',
        ]
    ]
]}
```

4. Сохраните ресурс
5. Откройте страницу - вы увидите интерфейс с двумя вкладками

#### Возможности редактора

**Вкладка "Управление каналами" (WSNotifyChannel):**
- ✅ Создание и редактирование каналов
- ✅ Настройка каналов по умолчанию
- ✅ Активация/деактивация каналов
- ✅ Кнопка "Синхронизировать с WebSocket" для обновления сервера

**Вкладка "Управление подписками" (WSNotifySubscription):**
- ✅ Просмотр подписок пользователей на каналы
- ✅ Создание пользовательских подписок
- ✅ Управление групповыми подписками
- ✅ Активация/деактивация подписок

#### Альтернативный вариант (без FENOM)

Если вы не используете FENOM, используйте стандартный синтаксис сниппета: (не проверено)

```
[[!PVTabs?
    &tabs=`{
        "WSNotifyChannel": {
            "title": "Управление каналами",
            "table": "WSNotifyChannel"
        },
        "WSNotifySubscription": {
            "title": "Управление подписками",
            "table": "WSNotifySubscription"
        }
    }`
]]
```

### Отправка в каналы

```php
<?php
$wsnotify = $modx->getService('wsnotify', 'WSNotify', MODX_CORE_PATH . 'components/wsnotify/model/');

// ВАЖНО: Канал должен быть создан перед отправкой!
$wsnotify->sendToChannels(['news'], [
    'type' => 'notification',
    'event' => 'news_update',
    'message' => 'Новая статья опубликована'
]);
```

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
