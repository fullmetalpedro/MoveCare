import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { Heart } from "lucide-react";
import "./SplashScreen.css";

const VISIBLE_MS = 1750;
const FADE_MS = 450;

/**
 * Full-screen animated loading splash rendered over the app on first mount.
 *
 * Visible for {@link VISIBLE_MS} ms, then fades out over {@link FADE_MS} ms
 * before unmounting. Rendered into `document.body` via a portal so it sits
 * above all app content regardless of stacking context. Locks
 * `overflow: hidden` on `<html>` while visible to prevent the scrollbar from
 * appearing and shifting the layout behind the splash.
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
  const [phase, setPhase] = useState<"show" | "hide" | "done">("show");

  useEffect(() => {
    // Lock page scroll while the splash is up so the viewport width stays
    // constant (the dashboard loading behind it would otherwise toggle the
    // scrollbar and shift the centered content horizontally).
    const html = document.documentElement;
    const prevOverflow = html.style.overflow;
    html.style.overflow = "hidden";

    const t1 = setTimeout(() => setPhase("hide"), VISIBLE_MS);
    const t2 = setTimeout(() => {
      setPhase("done");
      html.style.overflow = prevOverflow;
    }, VISIBLE_MS + FADE_MS);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      html.style.overflow = prevOverflow;
    };
  }, []);

  if (phase === "done") return null;

  return createPortal(
    <div className={`splash${phase === "hide" ? " hide" : ""}`} aria-hidden="true">
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
