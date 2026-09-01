// Injected on demand (chrome.scripting.executeScript) for the "Capture Selection" mode.
// Draws a full-viewport drag-to-select overlay, then reports the chosen rect back to
// background.js. Cleans itself up whether the user completes or cancels the selection.
(() => {
  if (window.__bimpSelectionActive) return; // avoid double-injection
  window.__bimpSelectionActive = true;

  const overlay = document.createElement("div");
  overlay.style.cssText = `
    position: fixed; inset: 0; z-index: 2147483647; cursor: crosshair;
    background: rgba(0,0,0,0.25);
  `;
  const box = document.createElement("div");
  box.style.cssText = `
    position: fixed; border: 2px dashed #FF4757; background: rgba(255,71,87,0.15);
    z-index: 2147483647; display: none; pointer-events: none;
  `;
  const hint = document.createElement("div");
  hint.textContent = "Drag to select an area — Esc to cancel";
  hint.style.cssText = `
    position: fixed; top: 16px; left: 50%; transform: translateX(-50%);
    background: #111; color: #fff; font: 13px/1.4 -apple-system, sans-serif;
    padding: 8px 16px; border-radius: 8px; z-index: 2147483647; pointer-events: none;
  `;
  document.documentElement.appendChild(overlay);
  document.documentElement.appendChild(box);
  document.documentElement.appendChild(hint);

  let start = null;

  const cleanup = () => {
    overlay.remove(); box.remove(); hint.remove();
    window.removeEventListener("keydown", onKeyDown, true);
    window.__bimpSelectionActive = false;
  };

  const onKeyDown = (e) => {
    if (e.key === "Escape") {
      cleanup();
      chrome.runtime.sendMessage({ type: "bimp-selection-cancelled" });
    }
  };

  overlay.addEventListener("mousedown", (e) => {
    start = { x: e.clientX, y: e.clientY };
    box.style.display = "block";
  });

  overlay.addEventListener("mousemove", (e) => {
    if (!start) return;
    const x = Math.min(start.x, e.clientX);
    const y = Math.min(start.y, e.clientY);
    const w = Math.abs(e.clientX - start.x);
    const h = Math.abs(e.clientY - start.y);
    box.style.left = x + "px"; box.style.top = y + "px";
    box.style.width = w + "px"; box.style.height = h + "px";
  });

  overlay.addEventListener("mouseup", (e) => {
    if (!start) return;
    const x = Math.min(start.x, e.clientX);
    const y = Math.min(start.y, e.clientY);
    const w = Math.abs(e.clientX - start.x);
    const h = Math.abs(e.clientY - start.y);
    cleanup();
    if (w < 4 || h < 4) {
      chrome.runtime.sendMessage({ type: "bimp-selection-cancelled" });
      return;
    }
    chrome.runtime.sendMessage({
      type: "bimp-selection-done",
      rect: { x, y, w, h },
      devicePixelRatio: window.devicePixelRatio || 1,
    });
  });

  window.addEventListener("keydown", onKeyDown, true);
})();
