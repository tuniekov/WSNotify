<?php
/**
 * Сниппет для инициализации WSNotify WebSocket клиента
 * 
 * Параметры:
 * &channels - список каналов через запятую (по умолчанию все активные)
 * &debug - включить отладку (по умолчанию false)
 * &showNotifications - показывать уведомления (по умолчанию true)
 * &autoConnect - автоматически подключаться (по умолчанию true)
 */

// Проверяем, включены ли WebSocket уведомления
if (!$modx->getOption('wsnotify_enabled', null, false)) {
    return '';
}

// Получаем сервис WSNotify
$wsnotify = $modx->getService('wsnotify', 'WSNotify', MODX_CORE_PATH . 'components/wsnotify/model/');
if (!$wsnotify) {
    $modx->log(modX::LOG_LEVEL_ERROR, '[WSNotify] Service not available');
    return '';
}

// Параметры сниппета
$channels = $scriptProperties['channels'] ?? '';
$debug = (bool)($scriptProperties['debug'] ?? false);
$showNotifications = (bool)($scriptProperties['showNotifications'] ?? true);
$autoConnect = (bool)($scriptProperties['autoConnect'] ?? true);

// Получаем настройки WebSocket
$websocketUrl = $modx->getOption('wsnotify_websocket_url', null, 'http://localhost:3100');
$siteKey = $modx->getOption('wsnotify_site_key', null, 'default');

// Получаем данные пользователя
$userId = $modx->user->get('id');
$userGroups = [];

if ($userId > 0) {
    $groups = $modx->user->getUserGroups();
    foreach ($groups as $groupId => $groupData) {
        $group = $modx->getObject('modUserGroup', $groupId);
        if ($group) {
            $userGroups[] = $group->get('name');
        }
    }
}

// Получаем список каналов
$channelsList = [];
if (!empty($channels)) {
    $channelsList = array_map('trim', explode(',', $channels));
} else {
    // Получаем только каналы по умолчанию
    $defaultChannels = $wsnotify->getChannels(true);
    foreach ($defaultChannels as $channel) {
        $channelsList[] = $channel['name'];
    }
}

// Формируем конфигурацию для JavaScript
$config = [
    'url' => $websocketUrl,
    'siteKey' => $siteKey,
    'userId' => $userId,
    'userGroups' => $userGroups,
    'channels' => $channelsList,
    'debug' => $debug,
    'showNotifications' => $showNotifications,
    'autoConnect' => $autoConnect
];

// Путь к ресурсам
$assetsUrl = $modx->getOption('assets_url') . 'components/wsnotify/client/';

// Генерируем HTML
$output = '';

// Подключаем CSS
$output .= '<link rel="stylesheet" href="' . $assetsUrl . 'css/websocket-client.css">' . "\n";

// Подключаем Socket.IO (если нужно)
$output .= '<script src="' . $websocketUrl . '/socket.io/socket.io.js"></script>' . "\n";

// Подключаем наши скрипты
$output .= '<script src="' . $assetsUrl . 'js/websocket-client.js"></script>' . "\n";
$output .= '<script src="' . $assetsUrl . 'js/main.js"></script>' . "\n";

// Инициализация
$output .= '<script>' . "\n";
$output .= 'window.wsnotifyConfig = ' . json_encode($config, JSON_UNESCAPED_UNICODE) . ';' . "\n";

if ($autoConnect) {
    $output .= 'document.addEventListener("DOMContentLoaded", function() {' . "\n";
    $output .= '    if (typeof initWSNotify === "function") {' . "\n";
    $output .= '        initWSNotify(window.wsnotifyConfig);' . "\n";
    $output .= '    }' . "\n";
    $output .= '});' . "\n";
}

$output .= '</script>' . "\n";

return $output;
