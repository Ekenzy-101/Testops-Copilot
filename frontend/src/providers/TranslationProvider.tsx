import i18next from "i18next";
import { ReactNode, useEffect } from "react";
import { I18nextProvider, initReactI18next } from "react-i18next";
import en from "../translations/en/translation.json";
import ru from "../translations/ru/translation.json";

i18next.use(initReactI18next).init({
  debug: process.env.NODE_ENV !== "test",
  fallbackLng: "ru",
  interpolation: { escapeValue: false },
  resources: { en: { translation: en }, ru: { translation: ru } },
});

interface TranslationProviderProps {
  children?: ReactNode;
  language: "en" | "ru";
}

export const TranslationProvider = ({
  children,
  language,
}: TranslationProviderProps) => {
  useEffect(() => {
    i18next.changeLanguage(language);
  }, [language]);

  return <I18nextProvider i18n={i18next}>{children}</I18nextProvider>;
};
