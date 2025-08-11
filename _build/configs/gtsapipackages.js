export default {
    wsnotify: {
        name: 'wsnotify',
        gtsAPITables: {
            // Управление каналами WebSocket уведомлений
            WSNotifyChannel: {
                table: 'WSNotifyChannel',
                version: 2,
                type: 1,
                authenticated: true,
                groups: 'Administrator',
                active: true,
                properties: {
                    actions: {
                        read: {},
                        create: { groups: 'Administrator' },
                        update: { groups: 'Administrator' },
                        delete: { groups: 'Administrator' },
                        sync_to_websocket: {
                            action: 'wsnotify/sync_channels',
                            head: true,
                            icon: 'pi pi-refresh',
                            label: 'Синхронизировать с WebSocket',
                            groups: 'Administrator'
                        }
                    },
                    fields: {
                        id: { 
                            type: 'view',
                            label: 'ID'
                        },
                        name: { 
                            label: 'Название канала', 
                            type: 'text' 
                        },
                        description: { 
                            label: 'Описание', 
                            type: 'textarea' 
                        },
                        active: { 
                            label: 'Активен', 
                            type: 'boolean' 
                        },
                        default: { 
                            label: 'Канал по умолчанию', 
                            type: 'boolean',
                            help: 'Каналы по умолчанию автоматически подключаются для всех пользователей'
                        },
                        created_at: { 
                            label: 'Создан', 
                            type: 'view' 
                        },
                        updated_at: { 
                            label: 'Обновлен', 
                            type: 'view' 
                        }
                    },
                    autocomplete: {
                        tpl: '{$name}',
                        where: { 
                            "name:LIKE": "%query%" 
                        },
                        limit: 10
                    }
                }
            },

            // Управление подписками на каналы (опционально)
            WSNotifySubscription: {
                table: 'WSNotifySubscription',
                version: 1,
                type: 1,
                authenticated: true,
                groups: 'Administrator',
                active: true,
                properties: {
                    actions: {
                        read: {},
                        create: { groups: 'Administrator' },
                        update: { groups: 'Administrator' },
                        delete: { groups: 'Administrator' }
                    },
                    fields: {
                        id: { 
                            type: 'view',
                            label: 'ID'
                        },
                        channel_id: {
                            label: 'Канал',
                            type: 'autocomplete',
                            table: 'WSNotifyChannel'
                        },
                        user_id: { 
                            label: 'ID пользователя', 
                            type: 'number' 
                        },
                        user_group: { 
                            label: 'Группа пользователей', 
                            type: 'text' 
                        },
                        active: { 
                            label: 'Активна', 
                            type: 'boolean' 
                        },
                        created_at: { 
                            label: 'Создана', 
                            type: 'view' 
                        }
                    }
                }
            }
        }
    }
}
