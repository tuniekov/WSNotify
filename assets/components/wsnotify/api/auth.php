<?php
/**
 * API endpoint для аутентификации пользователей
 * Используется WebSocket сервером для проверки пользователей
 */

// Подключаем MODX
if (!defined('MODX_CORE_PATH')) {
    $modxCorePath = dirname(dirname(dirname(dirname(dirname(__FILE__))))) . '/core/';
    if (file_exists($modxCorePath . 'config/config.inc.php')) {
        require_once $modxCorePath . 'config/config.inc.php';
        require_once MODX_CORE_PATH . 'model/modx/modx.class.php';
        $modx = new modX();
        $modx->initialize('web');
    } else {
        http_response_code(500);
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'message' => 'MODX not found']);
        exit;
    }
}

// Получаем входные данные
$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    $input = $_POST;
}

// Проверяем API ключ
$apiKey = $_SERVER['HTTP_X_API_KEY'] ?? $input['api_key'] ?? $_GET['api_key'] ?? '';
$expectedApiKey = $modx->getOption('wsnotify_api_key', null, '');

if (empty($expectedApiKey)) {
    // Если API ключ не настроен, разрешаем доступ (для разработки)
    $modx->log(modX::LOG_LEVEL_WARN, '[WSNotify] API ключ не настроен в системных настройках');
} elseif ($apiKey !== $expectedApiKey) {
    http_response_code(401);
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'Неверный API ключ']);
    exit;
}

// Получаем данные пользователя
$userId = (int)($input['user_id'] ?? $_GET['user_id'] ?? 0);
$sessionId = $input['session_id'] ?? $_GET['session_id'] ?? '';

// Обрабатываем анонимных пользователей
if ($userId <= 0) {
    header('Content-Type: application/json');
    echo json_encode([
        'success' => true,
        'user' => [
            'id' => 0,
            'username' => 'anonymous',
            'active' => true,
            'groups' => ['Anonymous'],
            'fullname' => 'Анонимный пользователь',
            'email' => ''
        ],
        'site' => $modx->getOption('wsnotify_site_key', null, 'default'),
        'timestamp' => time()
    ]);
    exit;
}

// Получаем пользователя
$user = $modx->getObject('modUser', $userId);

if (!$user) {
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false, 
        'message' => 'Пользователь не найден'
    ]);
    exit;
}

// Проверяем активность пользователя
if (!$user->get('active')) {
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false, 
        'message' => 'Пользователь заблокирован'
    ]);
    exit;
}

// Получаем группы пользователя
$userGroups = [];
$groups = $user->getUserGroups();

foreach ($groups as $groupId => $groupData) {
    $group = $modx->getObject('modUserGroup', $groupId);
    if ($group) {
        $userGroups[] = $group->get('name');
    }
}

// Если у пользователя нет групп, добавляем группу по умолчанию
if (empty($userGroups)) {
    $userGroups[] = 'Users';
}

// Получаем профиль пользователя
$profile = $user->getOne('Profile');
$userData = [
    'id' => $user->get('id'),
    'username' => $user->get('username'),
    'active' => $user->get('active'),
    'groups' => $userGroups
];

if ($profile) {
    $userData['fullname'] = $profile->get('fullname') ?: $user->get('username');
    $userData['email'] = $profile->get('email') ?: '';
} else {
    $userData['fullname'] = $user->get('username');
    $userData['email'] = '';
}

// Логируем успешную аутентификацию
$modx->log(modX::LOG_LEVEL_INFO, '[WSNotify] Аутентификация пользователя: ' . $user->get('username') . ' (ID: ' . $user->get('id') . ')');

// Возвращаем результат
header('Content-Type: application/json');
echo json_encode([
    'success' => true,
    'user' => $userData,
    'site' => $modx->getOption('wsnotify_site_key', null, 'default'),
    'timestamp' => time()
]);
