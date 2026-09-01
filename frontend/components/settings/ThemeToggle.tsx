"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";

type ThemePreference = "light" | "dark" | "system";

const STORAGE_KEY = "fincontrol-theme";

function applyTheme(preference: ThemePreference) {
  const isDark =
    preference === "dark" ||
    (preference === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", isDark);
}

export function ThemeToggle() {
  const [preference, setPreference] = useState<ThemePreference>("system");

  useEffect(() => {
    const stored = (localStorage.getItem(STORAGE_KEY) as ThemePreference | null) ?? "system";
    setPreference(stored);
  }, []);

  function handleChange(next: ThemePreference) {
    setPreference(next);
    localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
  }

  const options: { value: ThemePreference; label: string; icon: string }[] = [
    { value: "light", label: "Claro", icon: "☀️" },
    { value: "dark", label: "Escuro", icon: "🌙" },
    { value: "system", label: "Sistema", icon: "🖥️" },
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => handleChange(opt.value)}
          className={clsx(
            "flex flex-col items-center gap-1 rounded-xl border px-3 py-3 text-xs font-medium transition-colors",
            preference === opt.value
              ? "border-emerald bg-emerald-50 text-emerald-600 dark:bg-emerald/10 dark:text-emerald"
              : "border-ink-100 text-ink-400 dark:border-white/10"
          )}
        >
          <span className="text-lg" aria-hidden>
            {opt.icon}
          </span>
          {opt.label}
        </button>
      ))}
    </div>
  );
}
