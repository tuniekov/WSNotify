WSNotify - WebSocket уведомления для MODX
==========================================

Компонент WSNotify предоставляет систему WebSocket уведомлений в реальном времени для MODX.

УСТАНОВКА
---------

1. Установите компонент через Package Manager
2. Настройте параметры в Системные настройки > wsnotify
3. Запустите WebSocket сервер на Node.js (см. документацию)
4. Добавьте сниппет [[!wsnotify_init]] на страницы где нужны уведомления

НАСТРОЙКИ
---------

wsnotify_websocket_url - URL WebSocket сервера (по умолчанию: http://localhost:3000)
wsnotify_site_key - Уникальный ключ MODX сайта (по умолчанию: default)
wsnotify_api_key - API ключ для аутентификации
wsnotify_enabled - Включить WebSocket уведомления (по умолчанию: false)

ИСПОЛЬЗОВАНИЕ
-------------

1. Инициализация на странице:
   [[!wsnotify_init]]

2. Отправка уведомлений в PHP:

   // Получаем сервис
   $wsnotify = $modx->getService('wsnotify', 'WSNotify', MODX_CORE_PATH . 'components/wsnotify/model/');

   // Отправка конкретным пользователям
   $wsnotify->sendToUsers([123, 456], [
       'type' => 'notification',
       'event' => 'new_message',
       'message' => 'У вас новое сообщение!'
   ]);

   // Отправка группам пользователей
   $wsnotify->sendToGroups(['Administrator'], [
       'type' => 'notification',
       'event' => 'system_alert',
       'message' => 'Системное уведомление'
   ]);

   // Отправка в каналы
   $wsnotify->sendToChannels(['news'], [
       'type' => 'notification',
       'event' => 'news_update',
       'message' => 'Новая статья опубликована'
   ]);

3. Обработка уведомлений в JavaScript:

   // Регистрация обработчика
   const result = WSNotifyHelpers.on('new_message', function(data) {
       console.log('Новое сообщение:', data.message);
   });

   // Проверка успешности регистрации
   if (!result.success) {
       console.error('Ошибка регистрации обработчика:', result.error);
   }

   // Показ простого уведомления
   WSNotifyHelpers.showMessage('Тестовое уведомление', 'info');

УПРАВЛЕНИЕ КАНАЛАМИ
-------------------

Каналы управляются через административный интерфейс gtsapipackages:
- Создание/редактирование каналов
- Синхронизация с WebSocket сервером
- Управление подписками пользователей

WEBSOCKET СЕРВЕР
----------------

Для работы компонента требуется запущенный WebSocket сервер на Node.js.
См. документацию по настройке сервера в prompts/websocket-notification-system.md

ПОДДЕРЖКА
---------

Документация: docs/
Примеры: prompts/websocket-notification-system.md
