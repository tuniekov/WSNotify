<?php
/**
 * API endpoint для получения списка активных каналов
 * Используется WebSocket сервером для синхронизации каналов
 */

// Проверяем API ключ
$apiKey = $_SERVER['HTTP_X_API_KEY'] ?? $_GET['api_key'] ?? '';
$expectedApiKey = $modx->getOption('wsnotify_api_key', null, '');

if (empty($expectedApiKey) || $apiKey !== $expectedApiKey) {
    http_response_code(401);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

// Получаем сервис WSNotify
$wsnotify = $modx->getService('wsnotify', 'WSNotify', MODX_CORE_PATH . 'components/wsnotify/model/');

if (!$wsnotify) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'WSNotify service not available']);
    exit;
}

// Получаем список каналов
$channels = $wsnotify->getChannels();

// Возвращаем результат
header('Content-Type: application/json');
echo json_encode([
    'success' => true,
    'channels' => $channels,
    'site' => $modx->getOption('wsnotify_site_key', null, 'default'),
    'timestamp' => time()
]);
