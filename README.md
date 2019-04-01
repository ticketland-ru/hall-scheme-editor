## Юридическая информация

Copyright (c) 2019 ООО «МДТЗК» (ticketland.ru)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense copies of the Software,  and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## Системные требования

На машине должен быть установлен Node.js и NPM -  менеджер пакетов, 
зависимости - https://www.npmjs.com/package/canvas Для сборки модуля 
требуется установка библиотек и компилятора - cc-c++ cairo-devel pango-devel 
libjpeg-turbo-devel giflib-devel

## Порядок установки:

1. Скачиваем проект с гитлаба - Git clone
3. Выполняем команду `npm install` - это устанавливает локально модули 
    требуемые для проекта из Package.json
4. Сконфигурировать проект можно в папке src/ts/configs/config.ts
5. В процессе разработки можно запускать локальный дев-сервер webpack: `npm start`. 
   В этом случае автоматически откроется страница в браузере. При внесении каких-либо правок в код 
   происходит автоматическая перекомпиляция и обновление страницы в браузере. 
   Index.html проекта должен открыться автоматически.
6. После того, как разработка закончена выполнить команду `npm run build` - 
   в папку .dist попадет готовая сборка проекта

Внятный [туториал](https://www.tutorialspoint.com/typescript/index.htm) по TypeScript

## Структура программы:

Центральный элемент - класс TicketlandCanvas. Он отвечает за хранение объектов,
отрисовку рабочей области и за действия пользователя на рабочей области.

Связь между компонентами осуществляется классом EventBus. Каждое сообщение имеет тип,
заданный в перечислении TlandEvents.

Точка входа - файл `index.ts`

## Структура данных 
### Формат схемы зала
```JSON
{
    "type":"schema",
    "version":"1.0",
    "offsetX":number,
    "offsetY":number,
    "width": number,
    "height": number,
    "objects": Object[],
}
```

### Типы объектов на схеме

Seat (место):
```JSON
{
    "type": "seat",
    "x": number,
    "y": number,
    "hidden": boolean default false
    "attrs": {
        "sectionId": number,
        "row": string,
        "seat": string
        "section": string,
    },
    "objectId": number
}
```

ControlPoint (тянучка для модификации сектора) - служебный класс, не должен сериализоваться, данные о нём будут внутри объекта типа сектор

Section (базовый класс - полигон):
```JSON
{
    "type": "section",
    "name": string,//можно ввести вручную
    "freeSeating": boolean,//можно указать вручную
    "points": Point[],
    "fill": string, //можно выбрать вручную
    "objectId": number
}
```

Point:
```{ "x":number, "y":number}```

Text
```JSON
{
    "type":"text",
    "x":number,
    "y":number,
    "text":String
    "angle":number,
    "objectId": number,
    "hidden": boolean default false,
    "attrs":{
       "fontSize":number,
       "fontFamily":string,
       "fontWeight":String,
       "fill":String,
       ... }
}
```

SvgObject (все чисто визуальные объекты):
```JSON
{
    "type":string,
    "x":number,
    "y":number,
    "heigth":number,
    "width":number,
    "angle":number,
    "hidden": boolean default false
    "attrs":{     
    },
    "objectId": number
}
```

#### Соответствие сущностей, унаследованных от SvgObject, и их типов

Имя класса в редакторе | сущность            | type            | примечание
-----------------------|---------------------|-----------------|-----------
Arena                  |Круглая сцена        |arena            |
ArtistsPassage         |Выход артистов       |artists_passage  |
Couch                  |прямой диван         |couch            |
CouchCurved            |угловой диван        |couch_curved     |
Exit                   |выход                |exit             |
PillarCircle           |круглая колонна      |pillar_circle    |
PillarRectangle        |прямоугольная колонна|pillar_rectangle |
Stage                  |сцена                |stage            |```"attrs":{"centerX":number,"centerY":number}```
StairwayCurved         |скруглённая лестница |stairway_curved  |
StairwayStraight       |прямая лестница      |straight_stairway|
TableRectangle         |прямоугольный стол   |table_rectangle  |

StageCenter - ```"type":"stage_center"```, этот класс не сериализуется, так как данные о нём содержатся 
внутри объекта типа Stage

#### внутренние сущности редактора

Empty - представляет пустое выделение. Содержит массив секций.
```JSON
{
  "type":"empty",
  "sections":Section[]
}
``` 

Selection - представляет множественное выделение. Содержит информацию о количестве выделенных объектов.
```json
{
  "type":"selection",
  "objectCount":number,
  "objects": object[]
}
```

## Покрытие кода Unit-тестами

Для обеспечения качества разрабоки рекомендуется покрывать код тестами.

В данном проекте используется js-библиотека для тестирования *Mocha*. Для удобной реализации проверок в тестах используется библиотека *Chai*.

Рекомендуемая последовательность действий:

К примеру, в классе `Context` мы только что реализовали функцию `toJson()`, которая сериализует в Json схему расположения объектов в зале.
В директории `test/` создаем файл `Context_test.js` и в нем пишем следующее:

```javascript
const assert = require('chai').assert;
const c = require('/path/to/Context');

describe("название функции (toJson)", function() {
    it("описание теста (сериализация скольких-то мест там-то и там-то)", function() {
        const context = new c.Context();
        // код добавления объектов в контекст
        assert.equal(context.toJson(), "сюда пишется ожидаемый json", "сообщение при неудачном результате теста")
    })
});
```

Для запуска теста вызвать скрипт test из package.json. Варианты:
1. Intellij: открыть package.json, он покажет кнопку для запуска каждого скрипта. Можно сохранить скрипт как конфигурацию для запуска.
1. ```npm run test``` или аналогичная задача запускают тесты. Тесты разделены по папкам

