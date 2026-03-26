import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Register service worker (injectManifest + prompt mode)
import { registerSW } from "virtual:pwa-register";
registerSW({
  onNeedRefresh() {
    // SWUpdateBanner handles the UI prompt via SW events
  },
  onOfflineReady() {
    console.log("[SW] Offline ready");
  },
});

async function init() {
  try {
    await document.fonts.ready;
  } catch {
    // proceed if fonts API unavailable
  }
  document.body.classList.add("fonts-loaded");
  createRoot(document.getElementById("root")!).render(<App />);
}

init();
