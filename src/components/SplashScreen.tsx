import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { Heart } from "lucide-react";
import { useDashboard, usePacientes } from "../hooks";
import "./SplashScreen.css";

const MIN_VISIBLE_MS = 900;
const FADE_MS = 450;

/**
 * Full-screen animated splash that doubles as the app's loading screen.
 *
 * It stays visible until **both** the initial data has loaded (the live
 * dashboard and patient queries have resolved) **and** a minimum
 * {@link MIN_VISIBLE_MS} has elapsed so the animation isn't cut off on a fast
 * load — then fades out over {@link FADE_MS} ms before unmounting. Rendered into
 * `document.body` via a portal so it sits above all app content, and locks
 * `overflow: hidden` on `<html>` while visible to avoid scrollbar layout shifts.
 *
 * @returns A portal wrapping the animated splash `<div>`, or `null` once the
 *   fade-out completes.
 *
 * @example
 * // Mount once at the top of the component tree (App.tsx):
 * <>
 *   <SplashScreen />
 *   <Routes>...</Routes>
 * </>
 */
export default function SplashScreen() {
  const { t } = useTranslation();
  const [done, setDone] = useState(false);
  const [minElapsed, setMinElapsed] = useState(false);

  // The initial data is ready once these live queries have produced a value.
  const overview = useDashboard();
  const pacientes = usePacientes();
  const dataReady = overview !== undefined && pacientes !== undefined;

  // Hide once the data has loaded and the minimum animation time has elapsed.
  const hiding = minElapsed && dataReady;

  useEffect(() => {
    // Lock page scroll while the splash is up so the viewport width stays
    // constant (content loading behind it would otherwise toggle the scrollbar
    // and shift the centered layout horizontally).
    const html = document.documentElement;
    const prevOverflow = html.style.overflow;
    html.style.overflow = "hidden";

    const t1 = setTimeout(() => setMinElapsed(true), MIN_VISIBLE_MS);
    return () => {
      clearTimeout(t1);
      html.style.overflow = prevOverflow;
    };
  }, []);

  // Once hiding, unmount after the fade completes.
  useEffect(() => {
    if (!hiding) return;
    const tDone = setTimeout(() => setDone(true), FADE_MS);
    return () => clearTimeout(tDone);
  }, [hiding]);

  if (done) return null;

  return createPortal(
    <div className={`splash${hiding ? " hide" : ""}`} aria-hidden="true">
      <div className="splash-content">
        <svg width="0" height="0" style={{ position: "absolute" }}>
          <defs>
            <linearGradient id="splash-heart-gradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#007AFF" />
              <stop offset="100%" stopColor="#5AC8FA" />
            </linearGradient>
          </defs>
        </svg>
        <Heart
          className="splash-heart"
          size={84}
          strokeWidth={0}
          fill="url(#splash-heart-gradient)"
          aria-hidden="true"
        />
        <div className="splash-title">{t("notifications.splash.brand")}</div>
        <div className="splash-subtitle">{t("notifications.splash.tagline")}</div>
        <div className="splash-loader">
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>,
    document.body
  );
}
