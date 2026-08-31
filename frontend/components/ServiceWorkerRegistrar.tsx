"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Falha silenciosa: o app continua funcionando normalmente sem o SW.
      });
    }
  }, []);

  return null;
}
