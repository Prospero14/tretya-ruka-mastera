import type { ProjectSchema } from "./types";

export const PROJECT_SCHEMAS: ProjectSchema[] = [
  {
    id: "fantasy",
    name: "Фэнтези / D&D-like",
    description: "Класс, раса, фракция — для классических настольных кампаний.",
    characterFields: [
      {
        key: "class",
        label: "Класс",
        type: "select",
        options: ["Воин", "Маг", "Плут", "Жрец", "Следопыт", "Бард", "Иное"],
        highlight: true,
      },
      {
        key: "race",
        label: "Раса / народ",
        type: "text",
        highlight: true,
      },
      {
        key: "order",
        label: "Орден / дом / гильдия",
        type: "text",
        highlight: true,
      },
      {
        key: "hook",
        label: "Квестовый крючок",
        type: "text",
      },
    ],
    locationFields: [
      {
        key: "realm",
        label: "Тип места",
        type: "select",
        options: ["Город", "Деревня", "Лес", "Замок", "Храм", "Подземелье", "Таверна", "Иное"],
        highlight: true,
      },
      {
        key: "danger",
        label: "Опасность",
        type: "select",
        options: ["Безопасно", "Настороже", "Враждебно", "Проклято"],
      },
    ],
  },
  {
    id: "cyberpunk",
    name: "Киберпанк",
    description: "Корпы, банды, улица — для современных/футур ролёвок.",
    characterFields: [
      {
        key: "faction",
        label: "Фракция",
        type: "select",
        options: [
          "Корпорация",
          "Банда",
          "Официалы",
          "Нетраннеры",
          "Улица",
          "Медиа",
          "Нейтрал",
        ],
        highlight: true,
      },
      {
        key: "corp",
        label: "Корп / банда",
        type: "text",
        highlight: true,
      },
      {
        key: "augment",
        label: "Импланты",
        type: "text",
      },
      {
        key: "debt",
        label: "Долг / рычаг",
        type: "text",
      },
    ],
    locationFields: [
      {
        key: "district",
        label: "Район",
        type: "select",
        options: ["Корп-тауэр", "Нижний город", "Доки", "Сеть", "Свалка", "Клиника", "Клуб"],
        highlight: true,
      },
      {
        key: "security",
        label: "Охрана",
        type: "select",
        options: ["Нулевая", "Уличная", "Корп-охрана", "Военная"],
      },
    ],
  },
  {
    id: "noir",
    name: "Городской нуар",
    description: "Расследования, улица, власть — для детективных one-shot и кампаний.",
    characterFields: [
      {
        key: "affiliation",
        label: "Принадлежность",
        type: "select",
        options: ["Полиция", "Архив", "Улица", "Власть", "Семья", "Нейтрал"],
        highlight: true,
      },
      {
        key: "secret",
        label: "Тайна",
        type: "text",
        highlight: false,
      },
      {
        key: "hook",
        label: "Зацепка для партии",
        type: "text",
      },
    ],
    locationFields: [
      {
        key: "access",
        label: "Доступ",
        type: "select",
        options: ["Открыто", "По пропуску", "Тайно", "Опасно"],
        highlight: true,
      },
    ],
  },
  {
    id: "blank",
    name: "Свой мир",
    description: "Пустой шаблон — добавите поля под свою систему.",
    characterFields: [],
    locationFields: [],
  },
];

export function getSchema(schemaId: string): ProjectSchema {
  return PROJECT_SCHEMAS.find((item) => item.id === schemaId) ?? PROJECT_SCHEMAS[0];
}
