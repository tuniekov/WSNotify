export default [
    {
        name: 'wsnotify_init',
        description: 'Инициализация WebSocket клиента WSNotify',
        file: 'wsnotify_init.php',
        properties: [
            {
                name: 'channels',
                description: 'Список каналов через запятую (по умолчанию все активные)',
                type: 'textfield',
                value: '',
                lexicon: null,
                area: ''
            },
            {
                name: 'debug',
                description: 'Включить отладку',
                type: 'combo-boolean',
                value: false,
                lexicon: null,
                area: ''
            },
            {
                name: 'showNotifications',
                description: 'Показывать уведомления',
                type: 'combo-boolean',
                value: true,
                lexicon: null,
                area: ''
            },
            {
                name: 'autoConnect',
                description: 'Автоматически подключаться к серверу',
                type: 'combo-boolean',
                value: true,
                lexicon: null,
                area: ''
            }
        ]
    },
    {
        name: 'wsnotify_test',
        description: 'Тестовый сниппет для отправки WebSocket уведомлений',
        file: 'wsnotify_test.php',
        properties: [
            {
                name: 'action',
                description: 'Действие: send_to_user, send_to_group, send_to_channel, send_to_anonymous, send_to_all',
                type: 'list',
                value: 'send_to_user',
                options: [
                    {text: 'Пользователю', value: 'send_to_user'},
                    {text: 'Группе', value: 'send_to_group'},
                    {text: 'Каналу', value: 'send_to_channel'},
                    {text: 'Анонимным', value: 'send_to_anonymous'},
                    {text: 'Всем', value: 'send_to_all'}
                ],
                lexicon: null,
                area: ''
            },
            {
                name: 'target',
                description: 'Цель (ID пользователя, название группы, канала)',
                type: 'textfield',
                value: '',
                lexicon: null,
                area: ''
            },
            {
                name: 'message',
                description: 'Сообщение для отправки',
                type: 'textarea',
                value: 'Тестовое уведомление',
                lexicon: null,
                area: ''
            },
            {
                name: 'type',
                description: 'Тип уведомления',
                type: 'list',
                value: 'notification',
                options: [
                    {text: 'Уведомление', value: 'notification'},
                    {text: 'Предупреждение', value: 'alert'},
                    {text: 'Информация', value: 'info'},
                    {text: 'Успех', value: 'success'},
                    {text: 'Внимание', value: 'warning'},
                    {text: 'Ошибка', value: 'error'}
                ],
                lexicon: null,
                area: ''
            },
            {
                name: 'event',
                description: 'Событие (new_message, system_alert, user_action и т.д.)',
                type: 'textfield',
                value: 'test_notification',
                lexicon: null,
                area: ''
            },
            {
                name: 'title',
                description: 'Заголовок уведомления',
                type: 'textfield',
                value: 'Тестовое уведомление',
                lexicon: null,
                area: ''
            },
            {
                name: 'duration',
                description: 'Длительность показа в миллисекундах',
                type: 'numberfield',
                value: 5000,
                lexicon: null,
                area: ''
            }
        ]
    }
];
