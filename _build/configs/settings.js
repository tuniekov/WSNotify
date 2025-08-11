export default [
    {
        key: 'wsnotify_websocket_url',
        value: 'http://localhost:3100',
        type: 'textfield',
        area: 'websocket',
        description: 'URL WebSocket сервера'
    },
    {
        key: 'wsnotify_websocket_port',
        value: '3100',
        type: 'numberfield',
        area: 'websocket',
        description: 'Порт WebSocket сервера'
    },
    {
        key: 'wsnotify_site_key',
        value: 'modx_local',
        type: 'textfield',
        area: 'websocket',
        description: 'Уникальный ключ MODX сайта'
    },
    {
        key: 'wsnotify_api_key',
        value: 'CnGWlhXAyLWDLcUkQNRDKX5FazBaJ6ZvBB3V7PO',
        type: 'password',
        area: 'websocket',
        description: 'API ключ для аутентификации'
    },
    {
        key: 'wsnotify_enabled',
        value: true,
        type: 'combo-boolean',
        area: 'websocket',
        description: 'Включить WebSocket уведомления'
    }
];
