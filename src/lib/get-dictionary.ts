const dictionaries = {
    en: () => import("../dictionaries/en.json").then((module) => module.default),
    pt: () => import("../dictionaries/pt.json").then((module) => module.default),
    es: () => import("../dictionaries/es.json").then((module) => module.default),
};

const dictionaryPromises: Partial<Record<string, Promise<any>>> = {};

export const getDictionary = (locale: "en" | "pt" | "es") => {
    if (!dictionaryPromises[locale]) {
        dictionaryPromises[locale] = dictionaries[locale] ? dictionaries[locale]() : dictionaries.pt();
    }
    return dictionaryPromises[locale]!;
};
