// Thin trigger: send the chosen mode to background.js, then close. The popup would
// close on its own the moment the user interacts with the page anyway (selection
// mode), so all actual capture work lives in the background service worker.
const send = (mode) => {
  chrome.runtime.sendMessage({ type: "bimp-capture", mode });
  window.close();
};

document.getElementById("capture-visible").addEventListener("click", () => send("visible"));
document.getElementById("capture-selection").addEventListener("click", () => send("selection"));
document.getElementById("capture-fullpage").addEventListener("click", () => send("fullpage"));
