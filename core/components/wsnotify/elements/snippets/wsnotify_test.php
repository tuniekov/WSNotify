<?php
/**
 * Тестовый сниппет для отправки WebSocket уведомлений
 * 
 * Параметры:
 * @param string $action - Действие: send_to_user, send_to_group, send_to_channel, send_to_all
 * @param string $target - Цель (ID пользователя, название группы, канала)
 * @param string $message - Сообщение для отправки
 * @param string $type - Тип уведомления (notification, alert, info, success, warning, error)
 * @param string $event - Событие (new_message, system_alert, user_action и т.д.)
 * @param string $title - Заголовок уведомления
 * @param int $duration - Длительность показа в миллисекундах (по умолчанию 5000)
 * 
 * Примеры использования:
 * [[!wsnotify_test? &action=`send_to_user` &target=`1` &message=`Тестовое сообщение администратору`]]
 * [[!wsnotify_test? &action=`send_to_group` &target=`Administrator` &message=`Сообщение для администраторов`]]
 * [[!wsnotify_test? &action=`send_to_all` &message=`Общее уведомление для всех`]]
 */

// Получаем параметры
$action = $modx->getOption('action', $scriptProperties, 'send_to_user');
$target = $modx->getOption('target', $scriptProperties, '');
$message = $modx->getOption('message', $scriptProperties, 'Тестовое уведомление');
$type = $modx->getOption('type', $scriptProperties, 'notification');
$event = $modx->getOption('event', $scriptProperties, 'test_notification');
$title = $modx->getOption('title', $scriptProperties, 'Тестовое уведомление');
$duration = (int)$modx->getOption('duration', $scriptProperties, 5000);

// Проверяем, включены ли уведомления
if (!$modx->getOption('wsnotify_enabled', null, false)) {
    return '<div class="alert alert-warning">WebSocket уведомления отключены в настройках системы</div>';
}

// Получаем сервис WSNotify
$wsnotify = $modx->getService('wsnotify', 'WSNotify', MODX_CORE_PATH . 'components/wsnotify/model/');
if (!$wsnotify) {
    return '<div class="alert alert-error">Ошибка загрузки сервиса WSNotify</div>';
}

// Формируем данные уведомления
$data = [
    'type' => $type,
    'event' => $event,
    'title' => $title,
    'message' => $message,
    'duration' => $duration,
    'timestamp' => time(),
    'test' => true
];

$result = '';
$success = false;

try {
    switch ($action) {
        case 'send_to_user':
            if (empty($target)) {
                $target = $modx->user->get('id'); // Отправляем текущему пользователю
            }
            $userIds = is_array($target) ? $target : [$target];
            $success = $wsnotify->sendToUsers($userIds, $data);
            $result = "Уведомление отправлено пользователю(ям): " . implode(', ', $userIds);
            break;
            
        case 'send_to_group':
            if (empty($target)) {
                return '<div class="alert alert-error">Не указана группа для отправки</div>';
            }
            $groups = is_array($target) ? $target : [$target];
            $success = $wsnotify->sendToGroups($groups, $data);
            $result = "Уведомление отправлено группе(ам): " . implode(', ', $groups);
            break;
            
        case 'send_to_channel':
            if (empty($target)) {
                return '<div class="alert alert-error">Не указан канал для отправки</div>';
            }
            $channels = is_array($target) ? $target : [$target];
            $success = $wsnotify->sendToChannels($channels, $data);
            $result = "Уведомление отправлено в канал(ы): " . implode(', ', $channels);
            break;
            
        case 'send_to_anonymous':
            $success = $wsnotify->sendToAnonymous($data);
            $result = "Уведомление отправлено анонимным пользователям";
            break;
            
        case 'send_to_all':
            $success = $wsnotify->sendToAll($data);
            $result = "Уведомление отправлено всем пользователям";
            break;
            
        default:
            return '<div class="alert alert-error">Неизвестное действие: ' . htmlspecialchars($action) . '</div>';
    }
    
    if ($success) {
        $alertClass = 'alert-success';
        $icon = '✅';
    } else {
        $alertClass = 'alert-warning';
        $icon = '⚠️';
        $result .= ' (возможно, WebSocket сервер недоступен)';
    }
    
} catch (Exception $e) {
    $alertClass = 'alert-error';
    $icon = '❌';
    $result = 'Ошибка отправки: ' . $e->getMessage();
}

// Формируем HTML результат
$output = '
<div class="wsnotify-test-result">
    <div class="alert ' . $alertClass . '">
        <strong>' . $icon . ' ' . $result . '</strong>
    </div>
    
    <div class="wsnotify-test-details">
        <h4>Детали отправленного уведомления:</h4>
        <ul>
            <li><strong>Действие:</strong> ' . htmlspecialchars($action) . '</li>
            <li><strong>Цель:</strong> ' . htmlspecialchars($target ?: 'текущий пользователь') . '</li>
            <li><strong>Тип:</strong> ' . htmlspecialchars($type) . '</li>
            <li><strong>Событие:</strong> ' . htmlspecialchars($event) . '</li>
            <li><strong>Заголовок:</strong> ' . htmlspecialchars($title) . '</li>
            <li><strong>Сообщение:</strong> ' . htmlspecialchars($message) . '</li>
            <li><strong>Длительность:</strong> ' . $duration . ' мс</li>
        </ul>
    </div>
</div>

<style>
.wsnotify-test-result {
    margin: 20px 0;
    padding: 15px;
    border: 1px solid #ddd;
    border-radius: 5px;
    background: #f9f9f9;
}

.alert {
    padding: 10px 15px;
    margin-bottom: 15px;
    border: 1px solid transparent;
    border-radius: 4px;
}

.alert-success {
    color: #3c763d;
    background-color: #dff0d8;
    border-color: #d6e9c6;
}

.alert-warning {
    color: #8a6d3b;
    background-color: #fcf8e3;
    border-color: #faebcc;
}

.alert-error {
    color: #a94442;
    background-color: #f2dede;
    border-color: #ebccd1;
}

.wsnotify-test-details {
    margin-top: 15px;
}

.wsnotify-test-details h4 {
    margin: 0 0 10px 0;
    color: #333;
}

.wsnotify-test-details ul {
    margin: 0;
    padding-left: 20px;
}

.wsnotify-test-details li {
    margin-bottom: 5px;
}
</style>';

return $output;
