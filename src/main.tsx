import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

async function init() {
  try {
    await document.fonts.ready;
  } catch {
    // proceed if fonts API unavailable
  }
  document.body.classList.add('fonts-loaded');
  createRoot(document.getElementById("root")!).render(<App />);
}

init();
