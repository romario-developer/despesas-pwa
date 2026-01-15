import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import AppRouter from "./routes/AppRouter";
import { registerSW } from "virtual:pwa-register";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element #root not found");
}

const isServiceWorkerSupported =
  typeof navigator !== "undefined" && "serviceWorker" in navigator;

if (isServiceWorkerSupported && import.meta.env.DEV) {
  const cleanDevCache = async () => {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((registration) => registration.unregister()));
      if ("caches" in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
      }
    } catch (error) {
      console.error("Erro ao limpar service worker em dev:", error);
    }
  };

  cleanDevCache();
}

let waitingServiceWorker: ServiceWorker | null = null;
let refreshing = false;

const dispatchRefreshEvent = () => {
  window.dispatchEvent(new Event("pwa:need-refresh"));
};

const skipWaiting = (worker: ServiceWorker) => {
  waitingServiceWorker = worker;
  dispatchRefreshEvent();
  worker.postMessage({ type: "SKIP_WAITING" });
};

const observeUpdateFound = (registration: ServiceWorkerRegistration) => {
  registration.addEventListener("updatefound", () => {
    const installingWorker = registration.installing;
    if (!installingWorker) return;
    installingWorker.addEventListener("statechange", () => {
      if (
        installingWorker.state === "installed" &&
        navigator.serviceWorker.controller
      ) {
        skipWaiting(installingWorker);
      }
    });
  });
};

if (isServiceWorkerSupported) {
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  });
}

registerSW({
  immediate: true,
  onNeedRefresh() {
    dispatchRefreshEvent();
  },
  onOfflineReady() {
    console.log("PWA pronto para uso offline");
  },
  onRegisteredSW(_swUrl, registration) {
    if (!registration) return;

    const tryPendingWorker = () => {
      if (
        registration.waiting &&
        navigator.serviceWorker.controller &&
        registration.waiting.state === "installed"
      ) {
        skipWaiting(registration.waiting);
      }
    };

    tryPendingWorker();
    observeUpdateFound(registration);

    registration.update();
    window.setInterval(() => registration.update(), 60 * 60 * 1000);
  },
});

export const applyUpdate = async () => {
  if (!waitingServiceWorker) return;
  waitingServiceWorker.postMessage({ type: "SKIP_WAITING" });
};

createRoot(rootElement).render(
  <StrictMode>
    <AppRouter />
  </StrictMode>,
);
