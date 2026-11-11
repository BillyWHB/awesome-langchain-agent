import { useState, useRef, useCallback, useEffect } from "react";

import type { ToolCallFromTool } from "@langchain/react";
import type { weatherTool } from "@langchain/playground-agents";

type WeatherTheme = "sunny" | "cloudy" | "rainy";

function getWeatherTheme(condition: string): WeatherTheme {
  const c = condition.toLowerCase();
  if (c.includes("sunny") || c.includes("clear")) return "sunny";
  if (c.includes("rain") || c.includes("storm") || c.includes("drizzle")) return "rainy";
  return "cloudy";
}

const WEATHER_FONT = '"SF Pro Display", "SF Pro Text", Inter, "Noto Sans", system-ui, sans-serif';

const weatherGradients: Record<WeatherTheme, { bg: string; overlay: string }> = {
  sunny: {
    bg: "linear-gradient(135deg, #38bdf8 0%, #0ea5e9 40%, #2563eb 100%)",
    overlay: "radial-gradient(ellipse at 80% 20%, rgba(250,204,21,0.25) 0%, transparent 60%)",
  },
  cloudy: {
    bg: "linear-gradient(135deg, #94a3b8 0%, #64748b 50%, #475569 100%)",
    overlay: "radial-gradient(ellipse at 30% 30%, rgba(203,213,225,0.2) 0%, transparent 60%)",
  },
  rainy: {
    bg: "linear-gradient(135deg, #64748b 0%, #475569 40%, #334155 100%)",
    overlay: "radial-gradient(ellipse at 50% 0%, rgba(148,163,184,0.15) 0%, transparent 50%)",
  },
};

const weatherGradientsDark: Record<WeatherTheme, { bg: string; overlay: string }> = {
  sunny: {
    bg: "linear-gradient(135deg, #1e3a5f 0%, #0c4a6e 40%, #1e40af 100%)",
    overlay: "radial-gradient(ellipse at 80% 20%, rgba(250,204,21,0.12) 0%, transparent 60%)",
  },
  cloudy: {
    bg: "linear-gradient(135deg, #334155 0%, #1e293b 50%, #0f172a 100%)",
    overlay: "radial-gradient(ellipse at 30% 30%, rgba(148,163,184,0.08) 0%, transparent 60%)",
  },
  rainy: {
    bg: "linear-gradient(135deg, #1e293b 0%, #0f172a 40%, #020617 100%)",
    overlay: "radial-gradient(ellipse at 50% 0%, rgba(100,116,139,0.1) 0%, transparent 50%)",
  },
};

function sineEasedGradient(
  x: number,
  y: number,
  radius: number,
  peakOpacity: number,
  steps = 8,
): string {
  const stops: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const eased = Math.sin((t * Math.PI) / 2);
    const opacity = peakOpacity * (1 - eased);
    const position = t * 100;
    stops.push(`rgba(255,255,255,${opacity.toFixed(4)}) ${position.toFixed(1)}%`);
  }
  return `radial-gradient(circle ${radius}px at ${x}px ${y}px, ${stops.join(", ")})`;
}

function WeatherConditionIcon({ condition, theme }: { condition: string; theme: WeatherTheme }) {
  const c = condition.toLowerCase();
  if (c.includes("sunny") || c.includes("clear")) {
    return (
      <svg className="w-12 h-12 drop-shadow-lg" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="4" fill="#fbbf24" opacity={0.9} />
        <circle cx="12" cy="12" r="5.5" stroke="#fbbf24" strokeWidth={0.6} opacity={0.3} />
        <path
          d="M12 3v2.5M12 18.5V21M5.64 5.64l1.77 1.77M16.59 16.59l1.77 1.77M3 12h2.5M18.5 12H21M5.64 18.36l1.77-1.77M16.59 7.41l1.77-1.77"
          stroke="#fcd34d"
          strokeWidth={1.5}
          strokeLinecap="round"
          opacity={0.8}
        />
      </svg>
    );
  }
  if (c.includes("rain")) {
    return (
      <svg className="w-12 h-12 drop-shadow-lg" viewBox="0 0 24 24" fill="none">
        <path
          d="M4 14.2A4 4 0 0 1 6.2 7a5.5 5.5 0 0 1 10.6-.5A4.5 4.5 0 0 1 18 15H6a4 4 0 0 1-2-.8z"
          fill="rgba(255,255,255,0.25)"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth={0.8}
          strokeLinejoin="round"
        />
        <path
          d="M8.5 17.5v2M12 17.5v2M15.5 17.5v2"
          stroke="rgba(147,197,253,0.8)"
          strokeWidth={1.5}
          strokeLinecap="round"
        />
      </svg>
    );
  }
  if (c.includes("partly")) {
    return (
      <svg className="w-12 h-12 drop-shadow-lg" viewBox="0 0 24 24" fill="none">
        <circle cx="9" cy="7" r="3" fill="#fbbf24" opacity={0.7} />
        <path
          d="M9 2.5v1.5M9 10.5v1.5M5.17 3.67l1.06 1.06M11.77 10.27l1.06 1.06M3 7h1.5M13 7h1.5M5.17 10.33l1.06-1.06M11.77 3.73l1.06-1.06"
          stroke="#fcd34d"
          strokeWidth={1}
          strokeLinecap="round"
          opacity={0.5}
        />
        <path
          d="M7 17.2A3.5 3.5 0 0 1 8.8 11a5 5 0 0 1 9.2-.5A4 4 0 0 1 19 18H9a3.5 3.5 0 0 1-2-.8z"
          fill="rgba(255,255,255,0.3)"
          stroke="rgba(255,255,255,0.45)"
          strokeWidth={0.8}
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return (
    <svg className="w-12 h-12 drop-shadow-lg" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 17.2A4 4 0 0 1 6.2 10a5.5 5.5 0 0 1 10.6-.5A4.5 4.5 0 0 1 18 18H6a4 4 0 0 1-2-.8z"
        fill={theme === "cloudy" ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.2)"}
        stroke="rgba(255,255,255,0.4)"
        strokeWidth={0.8}
        strokeLinejoin="round"
      />
    </svg>
  );
}

function RainAnimation() {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${5 + i * 4.5}%`,
            width: "1px",
            height: `${6 + (i % 4) * 3}px`,
            background: "linear-gradient(to bottom, transparent, rgba(147,197,253,0.4))",
            animationName: "rain",
            animationDuration: `${0.7 + (i % 3) * 0.3}s`,
            animationTimingFunction: "linear",
            animationIterationCount: "infinite",
            animationDelay: `${(i * 0.08) % 1}s`,
          }}
        />
      ))}
    </div>
  );
}

function useIsDark() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === "undefined") return false;
    return document.documentElement.classList.contains("dark");
  });
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);
  return isDark;
}

export function WeatherToolCard({ toolCall }: { toolCall: ToolCallFromTool<typeof weatherTool> }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [glowState, setGlowState] = useState({ x: 0, y: 0, intensity: 0 });
  const isDark = useIsDark();

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));
    const dx =
      e.clientX < rect.left
        ? rect.left - e.clientX
        : e.clientX > rect.right
          ? e.clientX - rect.right
          : 0;
    const dy =
      e.clientY < rect.top
        ? rect.top - e.clientY
        : e.clientY > rect.bottom
          ? e.clientY - rect.bottom
          : 0;
    const dist = Math.sqrt(dx * dx + dy * dy);
    setGlowState({ x, y, intensity: Math.max(0, 1 - dist / 120) });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setGlowState((prev) => ({ ...prev, intensity: 0 }));
  }, []);

  if (!toolCall.output) {
    return (
      <div
        className="relative overflow-hidden rounded-2xl p-5"
        data-testid="sdk-preview-chat-turn"
        style={{
          background: isDark
            ? "linear-gradient(135deg, #334155 0%, #1e293b 100%)"
            : "linear-gradient(135deg, #94a3b8 0%, #64748b 100%)",
          fontFamily: WEATHER_FONT,
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm animate-pulse" />
          <div className="flex-1 space-y-2">
            <div
              className="text-sm font-medium text-white/90"
              style={{ textShadow: "0 1px 4px rgba(0,0,0,0.2)" }}
            >
              Checking weather in {toolCall.input.city}…
            </div>
            <div className="flex gap-2">
              <div className="h-2 w-16 rounded-full bg-white/15 animate-pulse" />
              <div
                className="h-2 w-10 rounded-full bg-white/10 animate-pulse"
                style={{ animationDelay: "0.15s" }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const theme = getWeatherTheme(toolCall.output?.condition);
  const gradients = isDark ? weatherGradientsDark[theme] : weatherGradients[theme];
  const unitSymbol = toolCall.output.unit === "fahrenheit" ? "F" : "C";

  return (
    <div
      ref={cardRef}
      className="relative overflow-hidden rounded-2xl select-none"
      data-testid="sdk-preview-chat-turn"
      style={{ fontFamily: WEATHER_FONT }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="absolute inset-0" style={{ background: gradients.bg }} />
      <div className="absolute inset-0" style={{ background: gradients.overlay }} />
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-300 ease-out"
        style={{
          opacity: glowState.intensity,
          background: sineEasedGradient(glowState.x, glowState.y, 120, isDark ? 0.12 : 0.2),
        }}
      />
      {theme === "rainy" && <RainAnimation />}

      <div className="relative p-5">
        <div className="flex items-start justify-between">
          <div>
            <h3
              className="text-[11px] font-semibold uppercase tracking-widest text-white/70 mb-1"
              style={{ textShadow: "0 1px 3px rgba(0,0,0,0.15)" }}
            >
              {toolCall.output.city}
            </h3>
            <div className="flex items-start">
              <span
                className="font-[250] tabular-nums leading-none tracking-tight text-white/95"
                style={{
                  fontSize: "48px",
                  fontFeatureSettings: '"tnum" 1, "case" 1',
                  textShadow: isDark
                    ? "0 2px 16px rgba(0,0,0,0.3)"
                    : "0 2px 16px rgba(255,255,255,0.2)",
                }}
              >
                {toolCall.output.temperature}
              </span>
              <span
                className="mt-1 ml-0.5 font-light tabular-nums text-white/60"
                style={{
                  fontSize: "18px",
                  fontFeatureSettings: '"tnum" 1, "case" 1',
                }}
              >
                °{unitSymbol}
              </span>
            </div>
            <div
              className="text-[13px] mt-1 capitalize text-white/75 font-medium tracking-wide"
              style={{ textShadow: "0 1px 3px rgba(0,0,0,0.1)" }}
            >
              {toolCall.output.condition}
            </div>
          </div>
          <div className="mt-1">
            <WeatherConditionIcon condition={toolCall.output.condition} theme={theme} />
          </div>
        </div>
      </div>

      <div
        className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-300 ease-out"
        style={{
          opacity: glowState.intensity * 0.6,
          background: sineEasedGradient(glowState.x, glowState.y, 100, isDark ? 0.5 : 0.8),
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          maskComposite: "exclude",
          WebkitMaskComposite: "xor",
          padding: "0.5px",
        }}
      />
    </div>
  );
}
