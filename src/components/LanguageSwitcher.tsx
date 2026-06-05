import { useTranslation } from "react-i18next";
import { Languages } from "lucide-react";
import { SUPPORTED_LANGUAGES } from "../i18n";
import "./LanguageSwitcher.css";

/**
 * Compact language selector that switches the active i18next language.
 *
 * Renders a native `<select>` (keyboard- and screen-reader-friendly out of the
 * box) labelled with a globe icon. The chosen language is persisted to
 * `localStorage` by the i18next language detector, so the choice survives
 * reloads.
 *
 * @returns A labelled `<select>` control wrapped in a styled row.
 *
 * @example
 * // Rendered in the sidebar footer
 * <LanguageSwitcher />
 */
export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const current =
    SUPPORTED_LANGUAGES.find((l) => i18n.language?.startsWith(l.code))?.code ??
    "pt";

  return (
    <div className="lang-switcher">
      <Languages size={15} className="lang-switcher__icon" aria-hidden="true" />
      <label className="sr-only" htmlFor="lang-select">
        {t("common.language")}
      </label>
      <select
        id="lang-select"
        className="lang-switcher__select"
        value={current}
        onChange={(e) => i18n.changeLanguage(e.target.value)}
        title={t("common.language")}
      >
        {SUPPORTED_LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.label}
          </option>
        ))}
      </select>
    </div>
  );
}
