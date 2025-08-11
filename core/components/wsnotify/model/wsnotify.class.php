<?php

class WSNotify
{
    /** @var modX $modx */
    public $modx;

    /** @var pdoFetch $pdoTools */
    public $pdo;

    /** @var array() $config */
    public $config = array();
    
    public $timings = [];
    protected $start = 0;
    protected $time = 0;
    public $gtsShop;
    public $getTables;

    // WebSocket настройки
    private $websocketUrl;
    private $siteKey;
    private $apiKey;
    
    /**
     * @param modX $modx
     * @param array $config
     */
    function __construct(modX &$modx, array $config = [])
    {
        $this->modx =& $modx;
        $corePath = MODX_CORE_PATH . 'components/wsnotify/';

        $this->config = array_merge([
            'corePath' => $corePath,
            'modelPath' => $corePath . 'model/',
        ], $config);

        $this->modx->addPackage('wsnotify', $this->config['modelPath']);
       

        if ($this->pdo = $this->modx->getService('pdoFetch')) {
            $this->pdo->setConfig($this->config);
        }

        // Инициализация WebSocket настроек
        $this->websocketUrl = $this->modx->getOption('wsnotify_websocket_url', null, 'http://localhost:3100');
        $this->siteKey = $this->modx->getOption('wsnotify_site_key', null, 'default');
        $this->apiKey = $this->modx->getOption('wsnotify_api_key', null, '');

        $this->timings = [];
        $this->time = $this->start = microtime(true);
    }

    /**
     * Add new record to time log
     *
     * @param $message
     * @param null $delta
     */
    public function addTime($message, $delta = null)
    {
        $time = microtime(true);
        if (!$delta) {
            $delta = $time - $this->time;
        }

        $this->timings[] = array(
            'time' => number_format(round(($delta), 7), 7),
            'message' => $message,
        );
        $this->time = $time;
    }

    /**
     * Return timings log
     *
     * @param bool $string Return array or formatted string
     *
     * @return array|string
     */
    public function getTime($string = true)
    {
        $this->timings[] = array(
            'time' => number_format(round(microtime(true) - $this->start, 7), 7),
            'message' => '<b>Total time</b>',
        );
        $this->timings[] = array(
            'time' => number_format(round((memory_get_usage(true)), 2), 0, ',', ' '),
            'message' => '<b>Memory usage</b>',
        );

        if (!$string) {
            return $this->timings;
        } else {
            $res = '';
            foreach ($this->timings as $v) {
                $res .= $v['time'] . ': ' . $v['message'] . "\n";
            }

            return $res;
        }
    }
    
    public function success($message = "",$data = []){
        return array('success'=>1,'message'=>$message,'data'=>$data);
    }
    
    public function error($message = "",$data = []){
        return array('success'=>0,'message'=>$message,'data'=>$data);
    }
    
    public function checkPermissions($rule_action){
        if($rule_action['authenticated']){
            if(!$this->modx->user->id > 0) return $this->error("Not api authenticated!",['user_id'=>$this->modx->user->id]);
        }
        if($rule_action['groups']){
            $groups = array_map('trim', explode(',', $rule_action['groups']));
            if(!$this->modx->user->isMember($groups)) return $this->error("Not api permission groups!");
        }
        if($rule_action['permitions']){
            $permitions = array_map('trim', explode(',', $rule_action['permitions']));
            foreach($permitions as $pm){
                if(!$this->modx->hasPermission($pm)) return $this->error("Not api modx permission!");
            }
        }
        return $this->success();
    }

    // ========== WebSocket методы ==========

    /**
     * Отправка уведомления конкретным пользователям
     *
     * @param array $userIds Массив ID пользователей
     * @param array $data Данные уведомления
     * @return array
     */
    public function sendToUsers(array $userIds, array $data)
    {
        return $this->sendToWebSocket([
            'target' => 'users',
            'users' => $userIds,
            'data' => $data
        ]);
    }

    /**
     * Отправка уведомления группам пользователей
     *
     * @param array $groupNames Массив названий групп
     * @param array $data Данные уведомления
     * @return array
     */
    public function sendToGroups(array $groupNames, array $data)
    {
        return $this->sendToWebSocket([
            'target' => 'groups',
            'groups' => $groupNames,
            'data' => $data
        ]);
    }

    /**
     * Отправка уведомления в каналы
     *
     * @param array $channels Массив названий каналов
     * @param array $data Данные уведомления
     * @return array
     */
    public function sendToChannels(array $channels, array $data)
    {
        return $this->sendToWebSocket([
            'target' => 'channels',
            'channels' => $channels,
            'data' => $data
        ]);
    }

    /**
     * Отправка уведомления анонимным пользователям
     *
     * @param array $data Данные уведомления
     * @return array
     */
    public function sendToAnonymous(array $data)
    {
        return $this->sendToWebSocket([
            'target' => 'anonymous',
            'data' => $data
        ]);
    }

    /**
     * Отправка уведомления всем пользователям (авторизованным и анонимным)
     *
     * @param array $data Данные уведомления
     * @return array
     */
    public function sendToAll(array $data)
    {
        return $this->sendToWebSocket([
            'target' => 'all',
            'data' => $data
        ]);
    }

    /**
     * Комбинированная отправка уведомлений
     *
     * @param array $targets Массив целей (users, groups, channels, anonymous)
     * @param array $data Данные уведомления
     * @return array
     */
    public function broadcast(array $targets, array $data)
    {
        return $this->sendToWebSocket(array_merge($targets, [
            'target' => 'broadcast',
            'data' => $data
        ]));
    }

    /**
     * Отправка данных на WebSocket сервер
     *
     * @param array $payload Данные для отправки
     * @return array
     */
    private function sendToWebSocket($payload)
    {
        if (!$this->modx->getOption('wsnotify_enabled', null, false)) {
            return $this->error('WebSocket уведомления отключены');
        }

        // Формируем правильный формат для сервера
        $requestData = [
            'api_key' => $this->apiKey,
            'target_type' => $payload['target'],
            'data' => $payload['data']
        ];

        // Добавляем targets в зависимости от типа
        switch ($payload['target']) {
            case 'users':
                $requestData['targets'] = $payload['users'];
                break;
            case 'groups':
                $requestData['targets'] = $payload['groups'];
                break;
            case 'channels':
                $requestData['targets'] = $payload['channels'];
                break;
            case 'anonymous':
            case 'all':
                $requestData['targets'] = [];
                break;
        }

        $url = $this->websocketUrl . '/api/notify/' . $this->siteKey;
        
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($requestData));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'User-Agent: WSNotify/1.0'
        ]);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 5);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 3);

        $result = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        if ($error) {
            $this->modx->log(modX::LOG_LEVEL_ERROR, '[WSNotify] cURL Error: ' . $error);
            return $this->error('Ошибка подключения к WebSocket серверу: ' . $error);
        }

        if ($httpCode !== 200) {
            $this->modx->log(modX::LOG_LEVEL_ERROR, '[WSNotify] HTTP Error: ' . $httpCode . ', Response: ' . $result);
            return $this->error('Ошибка WebSocket сервера: HTTP ' . $httpCode);
        }

        $response = json_decode($result, true);
        if (!$response) {
            $this->modx->log(modX::LOG_LEVEL_ERROR, '[WSNotify] Invalid JSON response: ' . $result);
            return $this->error('Неверный ответ от WebSocket сервера');
        }

        return $response;
    }

    // ========== Методы для работы с каналами ==========

    /**
     * Получение списка активных каналов
     *
     * @param bool $defaultOnly Получить только каналы по умолчанию
     * @return array
     */
    public function getChannels($defaultOnly = false)
    {
        $criteria = ['active' => 1];
        
        if ($defaultOnly) {
            $criteria['default'] = 1;
        }
        
        $channels = $this->modx->getCollection('WSNotifyChannel', $criteria);
        $result = [];
        
        foreach ($channels as $channel) {
            $result[] = [
                'id' => $channel->get('id'),
                'name' => $channel->get('name'),
                'description' => $channel->get('description'),
                'active' => $channel->get('active'),
                'default' => $channel->get('default'),
                'created_at' => $channel->get('created_at'),
                'updated_at' => $channel->get('updated_at')
            ];
        }
        
        return $result;
    }


    /**
     * Синхронизация каналов с WebSocket сервером
     *
     * @return array
     */
    public function syncChannelsToWebSocket()
    {
        $channels = $this->getChannels();
        
        $payload = [
            'action' => 'sync_channels',
            'site' => $this->siteKey,
            'api_key' => $this->apiKey,
            'channels' => $channels
        ];

        $ch = curl_init($this->websocketUrl . '/api/sync');
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'User-Agent: WSNotify/1.0'
        ]);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 5);

        $result = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode === 200) {
            return $this->success('Каналы синхронизированы с WebSocket сервером');
        } else {
            return $this->error('Ошибка синхронизации каналов');
        }
    }

    /**
     * Обработка запросов от gtsapipackages
     *
     * @param string $action Действие
     * @param array $data Данные
     * @return array
     */
    public function handleRequest($action, $data = array())
    {
        switch($action) {
            case 'sync_channels':
                return $this->syncChannelsToWebSocket();
            break;
            
            default:
                return $this->error('Неизвестное действие: ' . $action);
        }
    }
}
