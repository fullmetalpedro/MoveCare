import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Heart } from "lucide-react";
import "./SplashScreen.css";

const VISIBLE_MS = 1750;
const FADE_MS = 450;

export default function SplashScreen() {
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
        />
        <div className="splash-title">MoveCare</div>
        <div className="splash-subtitle">FISIOTERAPIA</div>
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
