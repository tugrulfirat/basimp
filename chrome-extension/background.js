// bimp.us Capture — background service worker
// Orchestrates all capture modes. Popups in MV3 close as soon as they lose focus
// (e.g. the instant the user clicks into the page to drag a selection), so the
// actual capture work lives here, not in popup.js — the popup just fires a
// "start capture" message and then closes itself.

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

async function captureVisible(windowId) {
  return chrome.tabs.captureVisibleTab(windowId, { format: "png" });
}

async function dataUrlToImageBitmap(dataUrl) {
  const blob = await (await fetch(dataUrl)).blob();
  return createImageBitmap(blob);
}

async function canvasToDataUrl(canvas) {
  const blob = await canvas.convertToBlob({ type: "image/png" });
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function storeCaptureAndOpenResult(dataUrl) {
  await chrome.storage.local.set({ bimpCapture: { dataUrl, at: Date.now() } });
  chrome.windows.create({
    url: chrome.runtime.getURL("result.html"),
    type: "popup",
    width: 420,
    height: 560,
  });
}

// ── Visible area ─────────────────────────────────────────────────────────────
async function captureVisibleMode() {
  const tab = await getActiveTab();
  const dataUrl = await captureVisible(tab.windowId);
  await storeCaptureAndOpenResult(dataUrl);
}

// ── Selection ─────────────────────────────────────────────────────────────────
async function captureSelectionMode() {
  const tab = await getActiveTab();
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["selection-overlay.js"],
  });
  // Result arrives async via the onMessage listener below (bimp-selection-done/cancelled).
}

async function handleSelectionDone(rect, devicePixelRatio) {
  const tab = await getActiveTab();
  const dataUrl = await captureVisible(tab.windowId);
  const bitmap = await dataUrlToImageBitmap(dataUrl);
  const canvas = new OffscreenCanvas(Math.round(rect.w * devicePixelRatio), Math.round(rect.h * devicePixelRatio));
  const ctx = canvas.getContext("2d");
  ctx.drawImage(
    bitmap,
    Math.round(rect.x * devicePixelRatio), Math.round(rect.y * devicePixelRatio),
    Math.round(rect.w * devicePixelRatio), Math.round(rect.h * devicePixelRatio),
    0, 0, canvas.width, canvas.height
  );
  const cropped = await canvasToDataUrl(canvas);
  await storeCaptureAndOpenResult(cropped);
}

// ── Full page (scroll + stitch) ────────────────────────────────────────────────
async function captureFullPageMode() {
  const tab = await getActiveTab();

  const [{ result: dims }] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => ({
      scrollHeight: document.documentElement.scrollHeight,
      viewportHeight: window.innerHeight,
      viewportWidth: window.innerWidth,
      dpr: window.devicePixelRatio || 1,
      startScrollY: window.scrollY,
    }),
  });

  const { scrollHeight, viewportHeight, viewportWidth, dpr, startScrollY } = dims;
  const slices = Math.max(1, Math.ceil(scrollHeight / viewportHeight));
  const shots = [];

  for (let i = 0; i < slices; i++) {
    const y = Math.min(i * viewportHeight, scrollHeight - viewportHeight);
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (scrollY) => window.scrollTo(0, scrollY),
      args: [y],
    });
    await delay(250); // let sticky/lazy content settle
    const dataUrl = await captureVisible(tab.windowId);
    shots.push({ dataUrl, y });
  }

  // Restore original scroll position.
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: (scrollY) => window.scrollTo(0, scrollY),
    args: [startScrollY],
  });

  const canvas = new OffscreenCanvas(Math.round(viewportWidth * dpr), Math.round(scrollHeight * dpr));
  const ctx = canvas.getContext("2d");

  for (let i = 0; i < shots.length; i++) {
    const bitmap = await dataUrlToImageBitmap(shots[i].dataUrl);
    const destY = Math.round(shots[i].y * dpr);
    ctx.drawImage(bitmap, 0, destY);
  }

  const stitched = await canvasToDataUrl(canvas);
  await storeCaptureAndOpenResult(stitched);
}

// ── Message routing ─────────────────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "bimp-capture") {
    const run = { visible: captureVisibleMode, selection: captureSelectionMode, fullpage: captureFullPageMode }[msg.mode];
    if (run) run().catch((err) => console.error("bimp capture failed:", err));
    return false;
  }
  if (msg.type === "bimp-selection-done") {
    handleSelectionDone(msg.rect, msg.devicePixelRatio).catch((err) => console.error("bimp selection capture failed:", err));
    return false;
  }
  // bimp-selection-cancelled needs no action.
  return false;
});
