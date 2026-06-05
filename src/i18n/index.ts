import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

/**
 * Languages the app ships translations for. The `code` matches the resource
 * bundle key and the value persisted to `localStorage`; `label`/`flag` are used
 * by the in-app {@link LanguageSwitcher}.
 */
export const SUPPORTED_LANGUAGES = [
  { code: "pt", label: "Português", flag: "🇧🇷" },
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "es", label: "Español", flag: "🇪🇸" },
] as const;

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]["code"];

/** Persisted-language key, also used by the language detector below. */
export const LANG_STORAGE_KEY = "movecare-lang";

/**
 * Eagerly import every locale JSON under `./locales/<lng>/<namespace>.json`.
 * Using a glob means a new translation file is registered automatically — no
 * central list to keep in sync — which lets each page own its own namespace
 * file without merge conflicts.
 */
const localeModules = import.meta.glob<{ default: Record<string, unknown> }>(
  "./locales/*/*.json",
  { eager: true },
);

type Resources = Record<string, { translation: Record<string, unknown> }>;

const resources: Resources = {};
for (const path in localeModules) {
  const match = path.match(/\.\/locales\/([^/]+)\/([^/]+)\.json$/);
  if (!match) continue;
  const [, lng, namespace] = match;
  resources[lng] ??= { translation: {} };
  resources[lng].translation[namespace] =
    localeModules[path].default ?? localeModules[path];
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "pt",
    supportedLngs: SUPPORTED_LANGUAGES.map((l) => l.code),
    nonExplicitSupportedLngs: true, // map "pt-BR" → "pt", "en-US" → "en", etc.
    interpolation: { escapeValue: false }, // React already escapes
    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      lookupLocalStorage: LANG_STORAGE_KEY,
      caches: ["localStorage"],
    },
  });

// Keep the document language attribute in sync for assistive tech & SEO.
i18n.on("languageChanged", (lng) => {
  document.documentElement.lang = lng;
});
document.documentElement.lang = i18n.language || "pt";

export default i18n;
