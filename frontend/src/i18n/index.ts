import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import type { ApiLanguage } from "@/types";

import ptBRCommon from "./locales/pt-BR/common.json";
import ptBRNav from "./locales/pt-BR/nav.json";
import ptBRSignIn from "./locales/pt-BR/signIn.json";
import ptBRSettings from "./locales/pt-BR/settings.json";
import ptBRQuery from "./locales/pt-BR/query.json";
import ptBRNotifications from "./locales/pt-BR/notifications.json";
import ptBRAnalytics from "./locales/pt-BR/analytics.json";
import ptBRMap from "./locales/pt-BR/map.json";
import ptBRReports from "./locales/pt-BR/reports.json";
import enCommon from "./locales/en/common.json";
import enNav from "./locales/en/nav.json";
import enSignIn from "./locales/en/signIn.json";
import enSettings from "./locales/en/settings.json";
import enQuery from "./locales/en/query.json";
import enNotifications from "./locales/en/notifications.json";
import enAnalytics from "./locales/en/analytics.json";
import enMap from "./locales/en/map.json";
import enReports from "./locales/en/reports.json";
import esCommon from "./locales/es/common.json";
import esNav from "./locales/es/nav.json";
import esSignIn from "./locales/es/signIn.json";
import esSettings from "./locales/es/settings.json";
import esQuery from "./locales/es/query.json";
import esNotifications from "./locales/es/notifications.json";
import esAnalytics from "./locales/es/analytics.json";
import esMap from "./locales/es/map.json";
import esReports from "./locales/es/reports.json";

/** Idiomas suportados — pt-BR é o padrão/fallback. */
export const LANGUAGES = ["pt-BR", "en", "es"] as const;
export type Language = (typeof LANGUAGES)[number];

/** Idioma do app (i18n) → código enviado à API (body): pt-BR→pt, en→en, es→es. */
const APP_TO_API_LANGUAGE: Record<Language, ApiLanguage> = {
  "pt-BR": "pt",
  en: "en",
  es: "es",
};

/** Converte o idioma atual do app no código da API; fallback `pt`. */
export function toApiLanguage(lang: string): ApiLanguage {
  return APP_TO_API_LANGUAGE[lang as Language] ?? "pt";
}

/** Traduções bundladas (offline-friendly p/ o PWA). Lazy por namespace fica p/ depois. */
export const resources = {
  "pt-BR": {
    common: ptBRCommon,
    nav: ptBRNav,
    signIn: ptBRSignIn,
    settings: ptBRSettings,
    query: ptBRQuery,
    notifications: ptBRNotifications,
    analytics: ptBRAnalytics,
    map: ptBRMap,
    reports: ptBRReports,
  },
  en: {
    common: enCommon,
    nav: enNav,
    signIn: enSignIn,
    settings: enSettings,
    query: enQuery,
    notifications: enNotifications,
    analytics: enAnalytics,
    map: enMap,
    reports: enReports,
  },
  es: {
    common: esCommon,
    nav: esNav,
    signIn: esSignIn,
    settings: esSettings,
    query: esQuery,
    notifications: esNotifications,
    analytics: esAnalytics,
    map: esMap,
    reports: esReports,
  },
} as const;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "pt-BR",
    supportedLngs: LANGUAGES,
    defaultNS: "common",
    interpolation: { escapeValue: false }, // React já escapa
    detection: {
      // navegador na 1ª visita; depois persiste a escolha do usuário
      order: ["localStorage", "navigator"],
      lookupLocalStorage: "appbit.lang",
      caches: ["localStorage"],
    },
    react: { useSuspense: false }, // resources bundlados → sem Suspense
  });

export default i18n;
