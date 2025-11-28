// app.js

document.addEventListener("DOMContentLoaded", () => {
  renderApp();

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker.js").catch(err => {
      console.error("Service worker registration failed:", err);
    });
  }
});
