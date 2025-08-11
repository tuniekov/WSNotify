# Использование gtsAPIPackages - Общее руководство

## Описание

Данный файл содержит общее описание использования конфигурации gtsAPIPackages для создания API таблиц в системе gtsAPI.

## Структура конфигурации

```javascript
export default {
    packagename: {
        name: 'packagename', // имя пакета MODX
        gtsAPITables: {
            tablename: {
                table: 'tablename', // Название таблицы
                class: 'ClassName', // Класс MODX таблицы базы данных (если отличается от table)
                autocomplete_field: 'field_name', // Поле для автокомплита
                version: 1, // Версия конфигурации
                type: 1, // Тип таблицы: 1 - PVTables, 2 - JSON, 3 - UniTree
                authenticated: true, // Требуется аутентификация
                groups: 'Administrator,manager', // Группы пользователей с доступом
                permissions: '', // Разрешения MODX
                active: true, // Активность таблицы
                properties: {
                    // Конфигурация свойств таблицы
                }
            }
        }
    }
}
```

## Основные параметры таблицы

### Обязательные параметры
- `table` - название таблицы в базе данных
- `version` - версия конфигурации (увеличивается при изменениях)
- `type` - тип таблицы (1, 2 или 3)
- `active` - активность таблицы

### Опциональные параметры
- `class` - класс MODX (если отличается от названия таблицы)
- `autocomplete_field` - поле для автокомплита
- `authenticated` - требование аутентификации
- `groups` - группы пользователей с доступом
- `permissions` - разрешения MODX

## Типы таблиц

1. **type: 1** - Обычные таблицы PVTables
2. **type: 2** - JSON таблицы
3. **type: 3** - Деревья UniTree

## Конфигурация properties

### Hide ID
```javascript
properties: {
    hide_id: 1, // Скрывает поле ID в интерфейсе таблицы
    // остальные настройки...
}
```

Параметр `hide_id` используется для скрытия поля ID в интерфейсе таблицы. Полезно когда:
- ID не имеет смысла для пользователя
- При отображении агрегированных данных
- При группировке записей по полям
- Когда ID записи не относится к отображаемой строке целиком

### Actions (Действия)
```javascript
actions: {
    read: {}, // Чтение
    create: { groups: 'Administrator' }, // Создание
    update: { groups: 'Administrator' }, // Обновление
    delete: { groups: 'Administrator' }, // Удаление
    excel_export: {}, // Экспорт в Excel (включено по умолчанию)
    
    // Кастомные действия
    raschet_row: {
        action: 'gtsshop/raschet_row', // Путь к методу в сервисном файле
        row: true, // Действие применяется к строке
        icon: "pi pi-calculator", // Иконка для кнопки
        groups: 'Administrator' // Группы доступа (опционально)
    }
}
```

#### Excel Export (Экспорт в Excel)

**Новая возможность (v2024.1):** Автоматический экспорт данных таблицы в формат Excel с поддержкой всех типов полей и форматирования.

**Автоматическое включение:**
Действие `excel_export` автоматически добавляется во все таблицы, если не отключено явно:

```javascript
actions: {
    excel_export: false // Отключить экспорт в Excel
}
```

**Стандартные настройки:**
```javascript
actions: {
    excel_export: {
        head: true, // Кнопка в заголовке таблицы
        icon: 'pi pi-file-excel', // Иконка Excel
        class: 'p-button-rounded p-button-success', // Зеленая кнопка
        label: 'Excel' // Подпись кнопки
    }
}
```

**Функциональность экспорта:**
- **Все строки**: Экспортируются все данные с `limit = 0`
- **Текущие фильтры**: Применяются активные фильтры таблицы
- **Форматирование**: Автоматическое форматирование ячеек по типам полей
- **Автокомплиты**: Выгружаются в читаемом виде с использованием предзагруженных данных

**Обработка типов полей:**

1. **Autocomplete поля** - выгружаются в 2 столбца:
   - `{label} ID` - числовое значение ID
   - `{label}` - отображаемое значение (name, title, content)

2. **Multiautocomplete поля** - создается несколько столбцов:
   - Для каждого поля поиска создается отдельный столбец
   - Формат: `{label} - {search_field_label}`
   - Значения автоматически преобразуются в читаемый вид

3. **Date поля** - форматируются как даты Excel:
   - Автоматическое преобразование в Excel формат даты
   - Применяется форматирование ячейки `d.m.Y`

4. **Остальные типы** - выгружаются как есть с сохранением форматирования

**Форматирование Excel файла:**
- **Заголовки**: Выделены жирным шрифтом
- **Автофильтр**: Применяется к строке заголовков
- **Границы**: Добавляются ко всем ячейкам с данными
- **Автоширина**: Автоматический подбор ширины столбцов
- **Имя файла**: `export_{table_name}_{date}_{time}.xlsx`

**Расширенная конфигурация с формой:**
```javascript
actions: {
    excel_export: {
        head: true,
        icon: 'pi pi-file-excel',
        class: 'p-button-rounded p-button-success',
        label: 'Экспорт',
        form: {
            fields: {
                period_start: {
                    label: 'Дата начала',
                    type: 'date'
                },
                period_end: {
                    label: 'Дата окончания', 
                    type: 'date'
                },
                department_id: {
                    label: 'Отдел',
                    type: 'autocomplete',
                    table: 'departments'
                }
            }
        }
    }
}
```

**Поведение с form.fields:**
1. Если указаны `form.fields`, данные из текущих фильтров (`$request['filters']`) выводятся сверху таблицы
2. Автокомплиты в форме автоматически подгружаются и отображаются как читаемый текст
3. Форма отделяется от таблицы пустой строкой
4. Поля формы выводятся в формате: `{label}: {value}`

**Примеры использования:**

```javascript
// Простое отключение экспорта
actions: {
    excel_export: false
}

// Кастомная настройка кнопки
actions: {
    excel_export: {
        label: 'Скачать отчет',
        icon: 'pi pi-download',
        class: 'p-button-outlined'
    }
}

// С дополнительной информацией в заголовке
actions: {
    excel_export: {
        form: {
            fields: {
                report_date: {
                    label: 'Дата отчета',
                    type: 'date'
                },
                manager_id: {
                    label: 'Менеджер',
                    type: 'autocomplete',
                    table: 'users'
                }
            }
        }
    }
}
```

**Технические особенности:**
- Использует библиотеку PHPOffice\PHPExcel из компонента gettables
- Эффективная работа с автокомплитами через предзагруженные данные
- Поддержка всех стандартных фильтров и сортировок
- Автоматическая обработка больших объемов данных
- Корректная работа с кодировкой UTF-8

**Безопасность:**
- Применяются все настройки доступа из конфигурации таблицы
- Экспортируются только те данные, которые пользователь может видеть
- Соблюдаются все фильтры и ограничения доступа

#### Кастомные действия

Кастомные действия позволяют добавлять специальные операции, которые обрабатываются в сервисном файле пакета (например, `gtsshop.class.php`).

**Структура кастомного действия:**
- `action` - путь к методу в формате `package/method_name`
- `row` - если `true`, действие применяется к выбранной строке
- `head` - если `true`, действие доступно в заголовке таблицы
- `icon` - CSS класс иконки для кнопки (например, `pi pi-calculator`)
- `label` - текст кнопки (для head действий)
- `groups` - группы пользователей с доступом к действию
- `modal_form` - конфигурация модальной формы (опционально)
- `template_row` - кастомный Vue шаблон для отображения кнопки действия в строке (новое в v2024.1)

**Простой пример кастомного действия:**
```javascript
raschet_row: {
    action: 'gtsshop/raschet_row',
    row: true,
    icon: "pi pi-calculator",
    groups: 'Administrator'
}
```

**Кастомное действие с модальной формой:**
```javascript
move_naryads: {
    action: 'gtscraft/move_naryads',
    row: true,
    head: true,
    icon: 'pi pi-arrows-alt',
    modal_form: {
        fields: {
            smena_id: {
                label: 'Смена',
                type: 'autocomplete',
                table: 'gcSmena',
                readonly: 1
            },
            comment: {
                label: 'Комментарий',
                type: 'textarea'
            }
        },
        buttons: {
            submit: {
                label: 'Переместить',
                icon: 'pi pi-check'
            }
        }
    }
}
```

**Кастомное действие с Vue шаблоном (новое в v2024.1):**
```javascript
custom_status: {
    action: 'mypackage/update_status',
    row: true,
    template_row: `
        <div class="custom-action-group">
            <button 
                v-if="data.status === 'pending'" 
                @click="executeAction()" 
                class="p-button p-button-success p-button-sm"
            >
                <i class="pi pi-check"></i> Одобрить
            </button>
            <button 
                v-else-if="data.status === 'approved'" 
                @click="executeAction()" 
                class="p-button p-button-warning p-button-sm"
            >
                <i class="pi pi-pause"></i> Приостановить
            </button>
            <span v-else class="status-completed">
                <i class="pi pi-check-circle text-green-500"></i> Завершено
            </span>
        </div>
    `
}
```

#### Кастомные Vue шаблоны для действий (template_row)

**Новая возможность (v2024.1):** Параметр `template_row` позволяет создавать полностью кастомные Vue шаблоны для отображения кнопок действий в строках таблицы.

**Основные возможности:**
- Полная кастомизация внешнего вида кнопок действий
- Условная логика отображения на основе данных строки
- Поддержка всех Vue директив и возможностей
- Безопасная компиляция с валидацией шаблонов

**Доступные переменные в шаблоне:**
- `data` - объект данных строки таблицы
- `columns` - массив колонок таблицы
- `table` - название таблицы
- `filters` - текущие фильтры таблицы
- `action` - объект конфигурации действия

**Доступные методы:**
- `executeAction()` - выполнить действие (вызывает серверный метод)
- `emitEvent(eventName, data)` - эмитировать кастомное событие

**Примеры использования:**

```javascript
// Простая кнопка с условным отображением
simple_approve: {
    action: 'mypackage/approve_item',
    row: true,
    template_row: `
        <button 
            v-if="data.status === 'pending'" 
            @click="executeAction()" 
            class="p-button p-button-success p-button-sm"
        >
            <i class="pi pi-check"></i> Одобрить
        </button>
    `
}

// Группа кнопок с разными состояниями
status_control: {
    action: 'mypackage/change_status',
    row: true,
    template_row: `
        <div class="action-group">
            <button 
                v-if="data.status === 'draft'" 
                @click="executeAction()" 
                class="p-button p-button-info p-button-sm"
            >
                <i class="pi pi-send"></i> Отправить
            </button>
            <button 
                v-else-if="data.status === 'pending'" 
                @click="executeAction()" 
                class="p-button p-button-success p-button-sm"
            >
                <i class="pi pi-check"></i> Одобрить
            </button>
            <button 
                v-else-if="data.status === 'approved'" 
                @click="executeAction()" 
                class="p-button p-button-warning p-button-sm"
            >
                <i class="pi pi-pause"></i> Приостановить
            </button>
            <span v-else class="status-completed">
                <i class="pi pi-check-circle text-green-500"></i> Завершено
            </span>
        </div>
    `
}

// Кнопка с подтверждением
delete_with_confirm: {
    action: 'mypackage/delete_item',
    row: true,
    template_row: `
        <button 
            @click="confirmDelete()" 
            class="p-button p-button-danger p-button-sm"
            :disabled="data.has_children"
        >
            <i class="pi pi-trash"></i>
            {{ data.has_children ? 'Заблокировано' : 'Удалить' }}
        </button>
    `
}

// Кнопка с динамическим текстом и иконкой
dynamic_action: {
    action: 'mypackage/toggle_status',
    row: true,
    template_row: `
        <button 
            @click="executeAction()" 
            :class="'p-button p-button-sm ' + (data.active ? 'p-button-warning' : 'p-button-success')"
        >
            <i :class="'pi ' + (data.active ? 'pi-pause' : 'pi-play')"></i>
            {{ data.active ? 'Деактивировать' : 'Активировать' }}
        </button>
    `
}

// Ссылка вместо кнопки
view_details: {
    action: 'mypackage/view_details',
    row: true,
    template_row: `
        <a 
            :href="'/admin/details/' + data.id" 
            target="_blank"
            class="text-blue-500 hover:text-blue-700"
        >
            <i class="pi pi-external-link"></i> Подробнее
        </a>
    `
}

// Комплексный пример с несколькими элементами
complex_actions: {
    action: 'mypackage/complex_action',
    row: true,
    template_row: `
        <div class="flex gap-2 items-center">
            <!-- Основная кнопка действия -->
            <button 
                @click="executeAction()" 
                class="p-button p-button-primary p-button-sm"
                :disabled="!data.can_edit"
            >
                <i class="pi pi-pencil"></i>
            </button>
            
            <!-- Индикатор статуса -->
            <span 
                :class="'status-indicator status-' + data.status"
                :title="'Статус: ' + data.status"
            >
                <i :class="'pi ' + getStatusIcon(data.status)"></i>
            </span>
            
            <!-- Счетчик связанных записей -->
            <span 
                v-if="data.children_count > 0" 
                class="badge badge-info"
                :title="data.children_count + ' связанных записей'"
            >
                {{ data.children_count }}
            </span>
        </div>
    `
}
```

**Обработка событий в шаблоне:**

```javascript
// Кастомная обработка с подтверждением
confirm_action: {
    action: 'mypackage/dangerous_action',
    row: true,
    template_row: `
        <button 
            @click="handleConfirm()" 
            class="p-button p-button-danger p-button-sm"
        >
            <i class="pi pi-exclamation-triangle"></i> Опасное действие
        </button>
    `,
    // В серверном коде можно обработать дополнительные параметры
    setup: `
        const handleConfirm = () => {
            if (confirm('Вы уверены? Это действие нельзя отменить!')) {
                executeAction();
            }
        };
        return { handleConfirm };
    `
}
```

**Стилизация кнопок:**

```javascript
styled_button: {
    action: 'mypackage/styled_action',
    row: true,
    template_row: `
        <button 
            @click="executeAction()" 
            class="custom-action-btn"
            :style="{
                backgroundColor: data.priority === 'high' ? '#ff4444' : '#44ff44',
                color: 'white',
                border: 'none',
                padding: '8px 12px',
                borderRadius: '4px',
                cursor: 'pointer'
            }"
        >
            <i class="pi pi-bolt"></i>
            {{ data.priority === 'high' ? 'Срочно' : 'Обычно' }}
        </button>
    `
}
```

**Безопасность template_row:**
- Все шаблоны проходят валидацию на предмет безопасности
- Блокируются потенциально опасные конструкции
- При ошибке компиляции показывается предупреждение
- Используется стандартная кнопка как fallback

**Поведение:**
- Если указан `template_row`, он используется вместо стандартной кнопки
- Если компиляция не удалась, отображается стандартная кнопка с `icon` и `class`
- Метод `executeAction()` автоматически вызывает серверное действие с данными строки
- Поддерживается полная интеграция с системой уведомлений и обновления таблицы

**Совместимость:**
- Работает только с действиями типа `row` (строковые действия)
- Полная совместимость с `modal_form`
- Не влияет на производительность при отсутствии шаблона
- Поддерживается во всех браузерах

**Параметры modal_form:**
- `fields` - поля формы (аналогично полям таблицы)
- `buttons.submit.label` - текст кнопки отправки (по умолчанию "Выполнить")
- `buttons.submit.icon` - иконка кнопки отправки (по умолчанию "pi pi-check")

**Поведение с modal_form:**
1. При нажатии на кнопку действия открывается модальная форма
2. Пользователь заполняет поля формы
3. При нажатии кнопки отправки данные формы объединяются с данными строки/фильтров
4. Отправляется запрос к серверному методу с полными данными

**Пример реализации в сервисном файле:**
```php
public function raschet_row($data = array())
{
    // Получение ID строки из $data['id']
    if(!$gsRaschetProduct = $this->modx->getObject("gsRaschetProduct", (int)$data['id'])) {
        return $this->error('Не найдена строка расчета!');
    }
    
    // Выполнение расчетов
    // ... логика обработки ...
    
    return $this->success('Расчет выполнен!', ['refresh_row' => 1]);
}

public function move_naryads($data = array())
{
    // Получение данных из формы
    $smena_id = $data['smena_id'] ?? null;
    $comment = $data['comment'] ?? '';
    
    // Получение данных строки (если row action)
    $naryad_id = $data['naryad_id'] ?? null;
    
    // Логика перемещения нарядов
    // ... обработка ...
    
    return $this->success('Наряды перемещены!', ['refresh_table' => 1]);
}

public function handleRequest($action, $data = array())
{
    switch($action) {
        case 'raschet_row':
            return $this->raschet_row($data);
        case 'move_naryads':
            return $this->move_naryads($data);
        break;
        // другие действия...
    }
}
```

**Методы ответа:**
- `$this->success($message, $data)` - успешный ответ
- `$this->error($message, $data)` - ответ с ошибкой

**Специальные параметры ответа:**
- `refresh_row` - обновить строку в таблице
- `refresh_table` - обновить всю таблицу
- `reload_with_id` - перезагрузить с новым ID

### Query (Запросы)
```javascript
query: {
    leftJoin: {
        TableName: {
            class: 'ClassName',
            on: 'TableName.id = MainTable.foreign_id'
        }
    },
    where: {
        'field': 'value'
    },
    select: {
        MainTable: '*',
        TableName: 'TableName.field1, TableName.field2'
    },
    sortby: {
        'field': 'ASC'
    }
}
```

### Autocomplete
```javascript
autocomplete: {
    select: [
        "id",
        "name", 
        "date"
    ], // Поля для выборки
    tpl: '{$name} - {$date | date : "d.m.Y"}', // Шаблон отображения (Fenom)
    template: `
        <div class="custom-item">
            <strong>{{ option.name }}</strong>
            <small>{{ option.date }}</small>
        </div>
    `, // Vue-шаблон для кастомного отображения (новое в v2024.1)
    where: {
        "name:LIKE": "%query%"
    },
    limit: 10, // Лимит записей (0 - без лимита)
    query: {
        // Дополнительные параметры запроса (leftJoin, where и т.д.)
        leftJoin: {
            RelatedTable: {
                class: "RelatedTable",
                on: "MainTable.related_id = RelatedTable.id"
            }
        }
    }
}
```

**Новый параметр `template` (v2024.1):**
- Позволяет задавать Vue-шаблоны для кастомного отображения элементов автокомплита
- Имеет приоритет над стандартным `tpl` (Fenom-шаблоном)
- Поддерживает все возможности Vue: директивы, привязки, условную логику
- Доступные переменные: `option` (объект записи), `index` (индекс элемента)

**Примеры использования template:**

```javascript
// Простой шаблон
autocomplete: {
    template: `<div><strong>{{ option.name }}</strong> - {{ option.email }}</div>`
}

// Шаблон с условной логикой
autocomplete: {
    template: `
        <div class="user-item" :class="{ 'inactive': !option.active }">
            <div class="user-name">{{ option.name }}</div>
            <div v-if="option.avatar" class="user-avatar">
                <img :src="option.avatar" />
            </div>
            <div class="user-status">
                <span v-if="option.active" class="status-active">Активен</span>
                <span v-else class="status-inactive">Неактивен</span>
            </div>
        </div>
    `
}

// Шаблон с форматированием данных
autocomplete: {
    template: `
        <div class="product-item">
            <div class="product-name">{{ option.name }}</div>
            <div class="product-price">{{ option.price }}₽</div>
            <div v-if="option.discount > 0" class="product-discount">
                Скидка: {{ option.discount }}%
            </div>
        </div>
    `
}
```

**Совместимость:**
- Если указан `template`, он используется вместо `tpl`
- Если `template` не указан, используется стандартный `tpl` (Fenom)
- При ошибке компиляции `template` автоматически используется `tpl` как fallback

#### Виртуальный скроллинг и ленивая загрузка

**Новая возможность (v2024.1):** Автокомплиты теперь поддерживают виртуальный скроллинг с ленивой загрузкой для эффективной работы с большими объемами данных.

**Автоматическая активация:**
- Виртуальный скроллинг активируется автоматически при наличии более 10 записей
- Данные загружаются порциями по 10 записей при прокрутке до конца списка
- Отображаются только видимые элементы списка для экономии памяти

**Преимущества:**
- Высокая производительность при работе с тысячами записей
- Минимальное потребление памяти браузера
- Плавная прокрутка без задержек
- Полная обратная совместимость с существующими конфигурациями

**Настройка размера страницы:**
```javascript
autocomplete: {
    limit: 20, // Увеличить размер страницы до 20 записей
    // остальные параметры...
}
```

#### Динамические шаблоны отображения

**Новая возможность (v2024.1):** Поддержка динамических Vue-шаблонов для кастомного отображения элементов в списке автокомплита.

**Базовое использование:**
```javascript
fields: {
    "product_id": {
        "type": "autocomplete",
        "table": "products",
        "template": `
            <div class="product-item">
                <strong>{{ option.name }}</strong>
                <div class="product-details">
                    <span class="price">{{ option.price }}₽</span>
                    <span class="category">{{ option.category_name }}</span>
                </div>
            </div>
        `
    }
}
```

**Расширенный пример с условной логикой:**
```javascript
"user_id": {
    "type": "autocomplete", 
    "table": "users",
    "template": `
        <div class="user-item" :class="{ 'user-offline': !option.is_online }">
            <div class="user-avatar">
                <img v-if="option.avatar" :src="option.avatar" />
                <div v-else class="avatar-placeholder">{{ option.name.charAt(0) }}</div>
            </div>
            <div class="user-info">
                <div class="user-name">{{ option.name }}</div>
                <div class="user-status">
                    <span v-if="option.is_online" class="status-online">В сети</span>
                    <span v-else class="status-offline">Не в сети</span>
                    <span class="last-seen">{{ option.last_seen }}</span>
                </div>
            </div>
        </div>
    `
}
```

**Доступные переменные в шаблоне:**
- `option` - объект записи со всеми полями из базы данных
- `index` - индекс элемента в списке

**Поддерживаемые Vue-возможности:**
- Интерполяция данных `{{ }}`
- Директивы `v-if`, `v-else`, `v-show`
- Привязка классов `:class`
- Привязка атрибутов `:src`, `:href` и т.д.
- Условная отрисовка элементов

**Обработка ошибок:**
- При ошибке компиляции шаблона показывается уведомление пользователю
- В консоли выводится подробная информация об ошибке
- При ошибке используется стандартное отображение

**Совместимость:**
- Работает с обычными `autocomplete` полями
- Работает с `multiautocomplete` полями
- Полная совместимость с виртуальным скроллингом
- Не влияет на производительность при отсутствии шаблона

**Параметры autocomplete:**

- `select` - массив полей для выборки из базы данных
- `tpl` - Fenom-шаблон для отображения элементов в списке автокомплита
- `where` - условия фильтрации (поддерживает плейсхолдер `%query%` для поискового запроса)
- `limit` - максимальное количество записей в результате (0 = без ограничений)
- `query` - дополнительные параметры запроса (leftJoin, where, sortby и т.д.)

**Поддержка условий where с Fenom-шаблонами:**

Для полей автокомплита можно задавать дополнительные условия фильтрации с использованием Fenom-шаблонов:

```javascript
fields: {
    smena_id: {
        label: 'Смена',
        type: 'autocomplete',
        table: 'gcSmena',
        where: {
            'date:>=': `{'' | date: "Y-m-d"}` // Только смены начиная с текущей даты
        }
    }
}
```

**Поддерживаемые Fenom-модификаторы в where:**
- `{'' | date: "Y-m-d"}` - текущая дата
- `{'+1 day' | date: "Y-m-d"}` - завтрашняя дата  
- `{'-1 day' | date: "Y-m-d"}` - вчерашняя дата
- `{'+1 week' | date: "Y-m-d"}` - дата через неделю
- `{'+1 month' | date: "Y-m-01"}` - первый день следующего месяца
- `{'' | date: "Y-m-t"}` - последний день текущего месяца

**Примеры использования where с датами:**

```javascript
// Только будущие даты
where: {
    'date:>=': `{'' | date: "Y-m-d"}`
}

// Только текущий месяц
where: {
    'date:>=': `{'' | date: "Y-m-01"}`,
    'date:<=': `{'' | date: "Y-m-t"}`
}

// Только завтрашние записи
where: {
    'date': `{'+1 day' | date: "Y-m-d"}`
}
```

**Безопасность:**
Обработка Fenom-шаблонов в условиях where ограничена только модификатором `date` для предотвращения выполнения произвольного кода. Это обеспечивает безопасность системы при работе с пользовательскими данными.

**Применение:**
- Условия where из конфигурации полей применяются автоматически при всех запросах автокомплита
- Поддерживается как в обычном autocomplete, так и в multiautocomplete
- Работает во всех компонентах: поиск, получение по ID, получение по show_id

### Fields (Поля)
```javascript
fields: {
    "field_name": {
        "label": "Подпись поля",
        "type": "text", // Тип поля
        "readonly": true, // Только для чтения
        "modal_only": true, // Только в модальном окне
        "table_only": true // Только в таблице
    }
}
```

## Типы полей

- `text` - текстовое поле
- `textarea` - многострочное текстовое поле
- `number` - числовое поле
- `decimal` - десятичное число
- `date` - дата
- `boolean` - логическое поле
- `autocomplete` - автокомплит
- `multiautocomplete` - автокомплит с множественными полями поиска
- `view` - только просмотр
- `hidden` - скрытое поле
- `html` - HTML контент

### Кастомные Vue шаблоны для полей

**Новая возможность (v2024.1):** Поддержка кастомных Vue шаблонов для отображения полей в режиме просмотра с автоматическим переключением в режим редактирования при клике.

**Базовое использование:**
```javascript
fields: {
    "time": {
        "label": "Время работы",
        "type": "decimal",
        "template": `
            <span class="time-badge" @click="$emit('click')">
                {{ Math.floor(value/60) }}ч {{ value%60 }}м
            </span>
        `
    }
}
```

**Расширенный пример с условной логикой:**
```javascript
"status": {
    "label": "Статус",
    "type": "text", 
    "template": `
        <div class="status-display" @click="$emit('click')">
            <span :class="'status-' + value.toLowerCase()">
                {{ value }}
            </span>
            <i v-if="value === 'ERROR'" class="pi pi-exclamation-triangle text-red-500"></i>
            <i v-else-if="value === 'SUCCESS'" class="pi pi-check text-green-500"></i>
        </div>
    `
}
```

**Пример с форматированием данных:**
```javascript
"price": {
    "label": "Цена",
    "type": "decimal",
    "template": `
        <div class="price-display" @click="$emit('click')">
            <span class="currency">{{ new Intl.NumberFormat('ru-RU', {
                style: 'currency', 
                currency: 'RUB'
            }).format(value) }}</span>
            <small v-if="row.discount > 0" class="discount">
                Скидка: {{ row.discount }}%
            </small>
        </div>
    `
}
```

**Доступные переменные в шаблоне:**
- `value` - значение поля
- `field` - объект конфигурации поля
- `row` - объект всей строки данных
- `data` - алиас для `row`

**Поведение:**
- В режиме просмотра отображается кастомный Vue шаблон
- При клике на шаблон активируется режим редактирования со стандартным интерфейсом поля
- После изменения значения автоматически возвращается в режим просмотра
- Если шаблон не указан, используется стандартное отображение

**Поддерживаемые Vue-возможности:**
- Интерполяция данных `{{ }}`
- Директивы `v-if`, `v-else`, `v-show`
- Привязка классов `:class`
- Привязка атрибутов `:src`, `:href` и т.д.
- Обработка событий `@click`, `@mouseover` и т.д.
- Условная отрисовка элементов

**Безопасность:**
- Все шаблоны проходят валидацию на предмет безопасности
- Блокируются потенциально опасные конструкции (доступ к `window`, `document`, `eval` и т.д.)
- При обнаружении опасного кода шаблон не компилируется и показывается предупреждение
- Ошибки компиляции обрабатываются с уведомлениями пользователю

**Запрещенные конструкции в шаблонах:**
- `$parent`, `$root` - доступ к родительским компонентам
- `document.`, `window.` - доступ к глобальным объектам браузера
- `eval(`, `<script` - выполнение произвольного кода
- `localStorage`, `sessionStorage` - доступ к хранилищу
- `fetch(`, `XMLHttpRequest` - сетевые запросы
- `setTimeout`, `setInterval` - таймеры

**Примеры практического применения:**

```javascript
// Отображение времени в удобном формате
"duration": {
    "type": "number", // минуты в БД
    "template": `
        <span class="duration-badge" @click="$emit('click')">
            {{ value >= 1440 ? Math.floor(value/1440) + 'д ' : '' }}
            {{ Math.floor((value%1440)/60).toString().padStart(2,'0') }}:{{ (value%60).toString().padStart(2,'0') }}
        </span>
    `
}

// Прогресс-бар для процентов
"progress": {
    "type": "decimal",
    "template": `
        <div class="progress-container" @click="$emit('click')">
            <div class="progress-bar" :style="'width: ' + value + '%'"></div>
            <span class="progress-text">{{ value }}%</span>
        </div>
    `
}

// Статус с иконками
"order_status": {
    "type": "text",
    "template": `
        <div class="status-badge" :class="'status-' + value" @click="$emit('click')">
            <i class="pi" :class="{
                'pi-clock': value === 'pending',
                'pi-cog': value === 'processing', 
                'pi-check': value === 'completed',
                'pi-times': value === 'cancelled'
            }"></i>
            {{ value }}
        </div>
    `
}
```

**Совместимость:**
- Работает со всеми типами полей
- Полная обратная совместимость - если `template` не указан, используется стандартное отображение
- Не влияет на производительность при отсутствии шаблона
- Поддерживается в таблицах, формах и модальных окнах

### Multiautocomplete

Новый тип поля `multiautocomplete` позволяет создавать автокомплиты с множественными полями поиска, размещенными в одном InputGroup. Подробная документация доступна в [multiautocomplete-api.md](multiautocomplete-api.md).

**Пример конфигурации:**
```javascript
"product_id": {
    "type": "multiautocomplete",
    "label": "Товар",
    "table": "products",
    "search": {
        "category_id": {
            "label": "Категория",
            "table": "categories",
            "default_row": true
        },
        "brand_id": {
            "label": "Бренд",
            "table": "brands",
            "search": {
                "category_id": {
                    "value": null
                }
            }
        }
    }
}
```

**Особенности:**
- Поддержка зависимых полей поиска
- Компактное размещение в InputGroup
- Полная совместимость с обычными автокомплитами
- Поддержка всех стандартных параметров (show_id, default_row и т.д.)

## Пример простой конфигурации

```javascript
export default {
    mypackage: {
        name: 'mypackage',
        gtsAPITables: {
            users: {
                table: 'users',
                version: 1,
                type: 1,
                authenticated: true,
                groups: 'Administrator',
                active: true,
                properties: {
                    autocomplete: {
                        tpl: '{$name}',
                        where: {
                            "name:LIKE": "%query%"
                        },
                        limit: 0
                    },
                    actions: {
                        read: {},
                        create: { groups: 'Administrator' },
                        update: { groups: 'Administrator' },
                        delete: { groups: 'Administrator' }
                    },
                    fields: {
                        "id": {
                            "type": "view"
                        },
                        "name": {
                            "label": "Имя",
                            "type": "text"
                        },
                        "email": {
                            "label": "Email",
                            "type": "text"
                        },
                        "active": {
                            "label": "Активен",
                            "type": "boolean"
                        }
                    }
                }
            }
        }
    }
}
```

## Специальные возможности

### Для группированных данных
Если вам нужны таблицы с группировкой данных (GROUP BY), обратитесь к файлу `docs/use_group_gtsapipackages.md` для получения подробной информации о параметре `data_fields`.

### Для деревьев UniTree
При использовании `type: 3` доступны дополнительные настройки для работы с иерархическими структурами.

## Ограничения имен полей

При создании полей в gtsAPIPackages следует избегать использования зарезервированных слов и конфликтующих имен:

### Запрещенные имена полей

**JavaScript/Vue зарезервированные слова:**
- `class` - зарезервированное слово JavaScript, используйте `css_class`, `class_name`
- `function`, `var`, `let`, `const`, `sort` - JavaScript ключевые слова
- `data`, `methods`, `computed` - Vue.js зарезервированные имена

### Рекомендуемые альтернативы

```javascript
// Плохо
fields: {
    sort: { type: 'number' },        // Конфликт с JavaScript
    order: { type: 'number' },       // Зарезервированное слово
    class: { type: 'text' }          // JavaScript зарезервированное
}

// Хорошо
fields: {
    sortfield: { type: 'number' },   // Безопасная альтернатива
    order_num: { type: 'number' },   // Описательное имя
    css_class: { type: 'text' }      // Четкое назначение
}
```

### Правила именования

1. **Используйте snake_case** для имен полей: `user_id`, `created_date`
2. **Добавляйте суффиксы** для уточнения: `_id`, `_name`, `_field`, `_num`
3. **Избегайте сокращений** которые могут быть неоднозначными
4. **Проверяйте совместимость** с SQL и JavaScript

## Рекомендации

1. **Всегда увеличивайте версию** при изменении конфигурации
2. **Используйте осмысленные названия** для таблиц и полей
3. **Избегайте зарезервированных слов** при именовании полей
4. **Настраивайте права доступа** через groups и permissions
5. **Тестируйте конфигурацию** после каждого изменения
6. **Документируйте изменения** в комментариях

## Совместимость

Конфигурация gtsAPIPackages полностью совместима с системой MODX и поддерживает все стандартные типы полей и операции.
