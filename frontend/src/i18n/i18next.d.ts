import "i18next";
import type common from "./locales/pt-BR/common.json";
import type nav from "./locales/pt-BR/nav.json";
import type signIn from "./locales/pt-BR/signIn.json";
import type settings from "./locales/pt-BR/settings.json";
import type query from "./locales/pt-BR/query.json";
import type notifications from "./locales/pt-BR/notifications.json";
import type analytics from "./locales/pt-BR/analytics.json";
import type map from "./locales/pt-BR/map.json";
import type reports from "./locales/pt-BR/reports.json";

/** Tipa as chaves de tradução → o `tsc -b` quebra em chave inexistente (pt-BR = fonte). */
declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "common";
    resources: {
      common: typeof common;
      nav: typeof nav;
      signIn: typeof signIn;
      settings: typeof settings;
      query: typeof query;
      notifications: typeof notifications;
      analytics: typeof analytics;
      map: typeof map;
      reports: typeof reports;
    };
  }
}
