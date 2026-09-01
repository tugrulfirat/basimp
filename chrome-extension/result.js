const BIMP_ORIGIN = "https://bimp.us";
const statusEl = document.getElementById("status");
const sendBtn = document.getElementById("send-btn");
let capturedDataUrl = null;

function setStatus(html) { statusEl.innerHTML = html; }

async function dataUrlToJpeg(dataUrl) {
  const blob = await (await fetch(dataUrl)).blob();
  const bitmap = await createImageBitmap(blob);
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#FFFFFF"; // JPEG has no alpha — flatten onto white first
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0);
  const jpegBlob = await canvas.convertToBlob({ type: "image/jpeg", quality: 0.92 });
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(jpegBlob);
  });
}

function downloadDataUrl(dataUrl, filename) {
  chrome.downloads.download({ url: dataUrl, filename, saveAs: false });
}

// ── Load the capture ─────────────────────────────────────────────────────────
chrome.storage.local.get("bimpCapture", ({ bimpCapture }) => {
  if (!bimpCapture?.dataUrl) {
    setStatus("No capture found — close this window and try again.");
    return;
  }
  capturedDataUrl = bimpCapture.dataUrl;
  document.getElementById("preview-img").src = capturedDataUrl;
});

document.getElementById("download-png").addEventListener("click", () => {
  if (!capturedDataUrl) return;
  downloadDataUrl(capturedDataUrl, `bimp-capture-${Date.now()}.png`);
});

document.getElementById("download-jpg").addEventListener("click", async () => {
  if (!capturedDataUrl) return;
  const jpegUrl = await dataUrlToJpeg(capturedDataUrl);
  downloadDataUrl(jpegUrl, `bimp-capture-${Date.now()}.jpg`);
});

// ── Pro/auth check — only Pro accounts may send into the editor ────────────────
async function findBimpTab() {
  const tabs = await chrome.tabs.query({ url: `${BIMP_ORIGIN}/*` });
  return tabs[0] || null;
}

async function readSessionToken(tabId) {
  const [{ result }] = await chrome.scripting.executeScript({
    target: { tabId },
    func: () => localStorage.getItem("bimp_session"),
  });
  return result;
}

async function checkProAccess() {
  const tab = await findBimpTab();
  if (!tab) {
    setStatus(`Open <a href="${BIMP_ORIGIN}" target="_blank">bimp.us</a> and sign in to send captures to the editor.`);
    return;
  }
  const token = await readSessionToken(tab.id);
  if (!token) {
    setStatus(`Sign in at <a href="${BIMP_ORIGIN}" target="_blank">bimp.us</a> to send captures to the editor.`);
    return;
  }
  try {
    const res = await fetch(`${BIMP_ORIGIN}/api/user`, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error("unauthorized");
    const user = await res.json();
    if (!user.is_pro) {
      setStatus(`Sending to the editor is a Pro feature. <a href="${BIMP_ORIGIN}" target="_blank">Upgrade at bimp.us</a>.`);
      return;
    }
    sendBtn.disabled = false;
    sendBtn.textContent = "✚ Send to bimp.us Editor";
    setStatus("Signed in as Pro — ready to send.");
  } catch {
    setStatus(`Couldn't verify your bimp.us account. Try signing in again at <a href="${BIMP_ORIGIN}" target="_blank">bimp.us</a>.`);
  }
}

checkProAccess();

// ── Send to editor ───────────────────────────────────────────────────────────
sendBtn.addEventListener("click", async () => {
  if (!capturedDataUrl) return;
  sendBtn.disabled = true;
  sendBtn.textContent = "Sending…";
  try {
    let tab = await findBimpTab();
    const appUrl = `${BIMP_ORIGIN}/app.html`;
    if (!tab || !tab.url?.startsWith(appUrl)) {
      tab = await chrome.tabs.create({ url: appUrl });
      await new Promise((resolve) => {
        const listener = (tabId, info) => {
          if (tabId === tab.id && info.status === "complete") {
            chrome.tabs.onUpdated.removeListener(listener);
            resolve();
          }
        };
        chrome.tabs.onUpdated.addListener(listener);
      });
    } else {
      await chrome.tabs.update(tab.id, { active: true });
    }
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (dataUrl) => {
        window.postMessage({ source: "bimp-extension", dataUrl }, window.location.origin);
      },
      args: [capturedDataUrl],
    });
    setStatus("✓ Sent to bimp.us editor.");
    setTimeout(() => window.close(), 900);
  } catch (err) {
    console.error(err);
    setStatus("Something went wrong sending to the editor. Try again.");
    sendBtn.disabled = false;
    sendBtn.textContent = "✚ Send to bimp.us Editor";
  }
});
