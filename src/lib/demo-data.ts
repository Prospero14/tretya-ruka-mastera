import type { Project } from "./types";

function id(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

export function createEmptyProject(title = "Новый проект"): Project {
  const now = new Date().toISOString();
  return {
    id: id("prj"),
    title,
    logline: "",
    format: "Полный метр",
    createdAt: now,
    updatedAt: now,
    characters: [],
    locations: [],
    relations: [],
    exposition: [],
  };
}

export function createDemoProject(): Project {
  const now = new Date().toISOString();
  const mara = {
    id: "char_mara",
    name: "Мара Волкова",
    role: "protagonist" as const,
    archetype: "Следователь с прошлым",
    goal: "Найти, кто сжигает дневники пропавших",
    flaw: "Не доверяет ничьим показаниям, включая свои",
    exposition:
      "Бывшая оперативница, ушла в архив после дела, которое официально закрыли. Знает город как карту шрамов.",
    notes: "Голос низкий, речь короткая. Не любит зеркала в чужих квартирах.",
    color: "#0f766e",
    mapX: 180,
    mapY: 160,
  };
  const kirill = {
    id: "char_kirill",
    name: "Кирилл Осетров",
    role: "antagonist" as const,
    archetype: "Архивариус-манипулятор",
    goal: "Стереть следы сети информаторов",
    flaw: "Уверен, что правда опаснее лжи",
    exposition:
      "Курирует «тихие» дела в городском архиве. Помогает Маре — и одновременно ведёт её по ложному следу.",
    notes: "Всегда носит бежевые перчатки. Цитирует протоколы наизусть.",
    color: "#b91c1c",
    mapX: 420,
    mapY: 140,
  };
  const lea = {
    id: "char_lea",
    name: "Леа",
    role: "supporting" as const,
    archetype: "Свидетельница / ключ",
    goal: "Остаться невидимой",
    flaw: "Молчит слишком долго",
    exposition:
      "Подросток, который видел обмен дневниками на ночной остановке. Её молчание — главный рычаг второго акта.",
    notes: "Рисует карты маршрутов трамваев на полях тетрадей.",
    color: "#1d4ed8",
    mapX: 300,
    mapY: 320,
  };

  return {
    id: "prj_demo_tram",
    title: "Ночной трамвай",
    logline:
      "Следователь архива ищет пропавшие дневники — и понимает, что город сам редактирует чужие биографии.",
    format: "Сериал · 6 серий",
    createdAt: now,
    updatedAt: now,
    characters: [mara, kirill, lea],
    locations: [
      {
        id: "loc_archive",
        name: "Городской архив",
        type: "Интерьер",
        mood: "Сухой холод, пыль, гул вентиляции",
        description: "Три этажа стеллажей и один закрытый зал «временных изъятий».",
        exposition:
          "Здесь начинается каждый акт. Архив — не склад, а персонаж: он прячет и подсовывает улики.",
      },
      {
        id: "loc_stop",
        name: "Остановка «Мост»",
        type: "Экстерьер / ночь",
        mood: "Сырость, неон, редкие вспышки фар",
        description: "Конечная линия трамвая №7. Здесь Леа видела обмен.",
        exposition:
          "Ключевая локация для экспозиции мира: город живёт по расписанию, которое кто-то переписывает.",
      },
      {
        id: "loc_flat",
        name: "Квартира Мары",
        type: "Интерьер",
        mood: "Полутьма, карта города на стене",
        description: "Комната-кабинет. На столе — копии чужих дневников.",
        exposition: "Безопасное пространство, которое постепенно перестаёт быть безопасным.",
      },
    ],
    relations: [
      {
        id: "rel_1",
        sourceId: mara.id,
        targetId: kirill.id,
        kind: "rival",
        label: "Доверие / ловушка",
        fromPerspective: "Нужен как проводник по архиву",
        toPerspective: "Удобный инструмент, пока не докопается",
      },
      {
        id: "rel_2",
        sourceId: mara.id,
        targetId: lea.id,
        kind: "mentor",
        label: "Защита",
        fromPerspective: "Единственный живой след",
        toPerspective: "Взрослая, которой можно рискнуть довериться",
      },
      {
        id: "rel_3",
        sourceId: kirill.id,
        targetId: lea.id,
        kind: "secret",
        label: "Угроза молчания",
        fromPerspective: "Свидетель, которого нельзя оставить",
        toPerspective: "Человек из перчаток, которого она боится",
      },
    ],
    exposition: [
      {
        id: "exp_1",
        title: "Правило города",
        body: "Каждый пропавший оставлял дневник. Дневники исчезают раньше людей. Тот, кто держит архив, держит версии правды.",
        tags: ["мир", "правило"],
        updatedAt: now,
      },
      {
        id: "exp_2",
        title: "Тон первого акта",
        body: "Не нуар ради нуара: холодный процедурный ритм + личная паранойя Мары. Экспозицию давать через улики, не через монологи.",
        tags: ["тон", "структура"],
        updatedAt: now,
      },
    ],
  };
}
