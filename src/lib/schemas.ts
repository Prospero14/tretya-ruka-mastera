import type { ProjectSchema } from "./types";

export const PROJECT_SCHEMAS: ProjectSchema[] = [
  {
    id: "noir",
    name: "Нуар / процедурный",
    description: "Базовые поля для драмы и thrilleр-структуры.",
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
    id: "cyberpunk",
    name: "Киберпанк",
    description: "Корпорации, банды, улица, импланты.",
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
        options: ["Корп-тауэр", "Нижний город", "Доки", "Сеть", "Свалка", "Клиника"],
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
    id: "fantasy",
    name: "Фэнтези",
    description: "Класс, раса, фракция мира.",
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
        label: "Орден / дом",
        type: "text",
      },
      {
        key: "magic",
        label: "Магия / дар",
        type: "text",
      },
    ],
    locationFields: [
      {
        key: "realm",
        label: "Область",
        type: "select",
        options: ["Город", "Лес", "Замок", "Храм", "Подземелье", "Пустошь", "Иное"],
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
    id: "blank",
    name: "Пустой шаблон",
    description: "Только базовые поля — добавите своё позже.",
    characterFields: [],
    locationFields: [],
  },
];

export function getSchema(schemaId: string): ProjectSchema {
  return PROJECT_SCHEMAS.find((item) => item.id === schemaId) ?? PROJECT_SCHEMAS[0];
}
