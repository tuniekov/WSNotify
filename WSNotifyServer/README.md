# WSNotify WebSocket Server

WebSocket сервер для системы уведомлений WSNotify с поддержкой множественных MODX сайтов.

## Установка

1. Установите зависимости:
```bash
npm install
```

2. Настройте конфигурацию в `config.json`:
```json
{
  "sites": {
    "default": {
      "name": "Default MODX Site",
      "url": "http://localhost",
      "api_key": "your-api-key-here",
      "enabled": true,
      "channels": []
    }
  }
}
```

3. Запустите сервер:
```bash
npm start
```

Или напрямую:
```bash
node wsnotifyserver.js
```

Для разработки с автоперезагрузкой:
```bash
npm run dev
```

## Конфигурация

### Настройка сайтов

В файле `config.json` добавьте ваши MODX сайты:

```json
{
  "sites": {
    "site1": {
      "name": "Мой сайт 1",
      "url": "http://site1.local",
      "api_key": "уникальный-api-ключ-1",
      "enabled": true,
      "channels": []
    },
    "site2": {
      "name": "Мой сайт 2", 
      "url": "http://site2.local",
      "api_key": "уникальный-api-ключ-2",
      "enabled": true,
      "channels": []
    }
  }
}
```

### Параметры сайта

- `name` - Название сайта для отображения
- `url` - URL сайта MODX (без слеша в конце)
- `api_key` - Уникальный API ключ для аутентификации
- `enabled` - Включен ли сайт (true/false)
- `channels` - Массив каналов (обновляется автоматически)

## API Endpoints

### POST /api/notify/:siteKey
Отправка уведомлений

**Параметры:**
- `api_key` - API ключ сайта
- `target_type` - Тип получателей: `users`, `groups`, `channels`, `anonymous`, `all`
- `targets` - Массив получателей (ID пользователей, названия групп, каналов)
- `data` - Данные уведомления

**Пример:**
```json
{
  "api_key": "your-api-key",
  "target_type": "users",
  "targets": [123, 456],
  "data": {
    "type": "notification",
    "event": "new_message",
    "message": "У вас новое сообщение!"
  }
}
```

### GET /api/stats/:siteKey
Получение статистики подключений

**Параметры:**
- `api_key` - API ключ сайта (в query string)

### POST /api/channels/:siteKey
Синхронизация каналов с MODX сайтом

**Параметры:**
- `api_key` - API ключ сайта

## WebSocket Пространства имен

Каждый MODX сайт работает в своем пространстве имен:
- `/default` - для сайта с ключом "default"
- `/site1` - для сайта с ключом "site1"
- и т.д.

## События WebSocket

### Клиент → Сервер

- `authenticate` - Аутентификация пользователя
- `subscribe_channels` - Подписка на каналы
- `unsubscribe_channels` - Отписка от каналов

### Сервер → Клиент

- `authenticated` - Успешная аутентификация
- `auth_error` - Ошибка аутентификации
- `notification` - Уведомление
- `subscribed` - Подтверждение подписки
- `unsubscribed` - Подтверждение отписки

## Комнаты WebSocket

Пользователи автоматически подписываются на комнаты:
- `user:{userId}` - Личные уведомления
- `group:{groupName}` - Уведомления для группы
- `channel:{channelName}` - Уведомления канала
- `anonymous` - Для неавторизованных пользователей

## Безопасность

- Каждый сайт изолирован в своем пространстве имен
- API ключи для аутентификации запросов
- CORS настраивается автоматически из конфигурации сайтов
- Валидация всех входящих данных

## Логирование

Сервер выводит логи в консоль:
- Подключения/отключения пользователей
- Аутентификация
- Отправка уведомлений
- Ошибки

## Мониторинг

Базовая информация о сервере доступна по адресу:
```
GET http://localhost:3100/
```

Статистика по сайту:
```
GET http://localhost:3100/api/stats/site1?api_key=your-api-key
```

## Требования

- Node.js 16+
- npm или yarn

## Зависимости

- `express` - HTTP сервер
- `socket.io` - WebSocket сервер
- `cors` - Настройка CORS
- `axios` - HTTP клиент для запросов к MODX

## Разработка

Для разработки используйте:
```bash
npm run dev
```

Это запустит сервер с автоперезагрузкой при изменении файлов.
