import { useState, useRef, useEffect, useCallback } from "react";

// ─── Brand Colors ────────────────────────────────────────────────────────────
const BRAND = {
  bg: "#0F0F1A",
  surface: "#1A1A2E",
  surfaceHover: "#22223A",
  border: "#2E2E4A",
  accent: "#6C63FF",
  accentHover: "#7C75FF",
  accentLight: "#6C63FF22",
  text: "#E8E8F0",
  textMuted: "#8888AA",
  danger: "#FF4757",
  success: "#2ECC71",
};

// ─── Tool definitions ─────────────────────────────────────────────────────────
const TOOLS = [
  { id: "select",   icon: "⬚",  label: "Select",    shortcut: "V" },
  { id: "redact",   icon: "▬",  label: "Redact",    shortcut: "R" },
  { id: "blur",     icon: "◈",  label: "Blur",      shortcut: "B" },
  { id: "pixelate", icon: "⊞",  label: "Pixelate",  shortcut: "P" },
  { id: "crop",     icon: "⊡",  label: "Crop",      shortcut: "C" },
  { id: "arrow",    icon: "↗",  label: "Arrow",     shortcut: "A" },
  { id: "text",     icon: "T",  label: "Text",      shortcut: "T" },
  { id: "draw",     icon: "✏",  label: "Draw",      shortcut: "D" },
];

const REDACT_COLORS = ["#000000", "#1A1A2E", "#FF4757", "#FFFFFF", "#FFD700"];

export default function BasimpEditor() {
  const canvasRef = useRef(null);
  const overlayRef = useRef(null);
  const fileInputRef = useRef(null);
  const [image, setImage] = useState(null);
  const [imageDimensions, setImageDimensions] = useState({ w: 0, h: 0 });
  const [tool, setTool] = useState("select");
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [history, setHistory] = useState([]);
  const [redactColor, setRedactColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(20);
  const [drawColor, setDrawColor] = useState("#FF4757");
  const [textInput, setTextInput] = useState("");
  const [textPos, setTextPos] = useState(null);
  const [showTextBox, setShowTextBox] = useState(false);
  const [statusMsg, setStatusMsg] = useState("Paste an image or drop a file to start");
  const [showDropZone, setShowDropZone] = useState(true);
  const [fontSize, setFontSize] = useState(24);
  const [arrowStart, setArrowStart] = useState(null);
  const lastDrawPos = useRef(null);

  // ── Status helper ─────────────────────────────────────────────────
  const status = (msg, duration = 2000) => {
    setStatusMsg(msg);
    if (duration) setTimeout(() => setStatusMsg(""), duration);
  };

  // ── Save canvas state to history ──────────────────────────────────
  const saveHistory = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setHistory(h => [...h.slice(-19), canvas.toDataURL()]);
  }, []);

  // ── Undo ──────────────────────────────────────────────────────────
  const undo = useCallback(() => {
    if (history.length === 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const last = history[history.length - 1];
    setHistory(h => h.slice(0, -1));
    const img = new Image();
    img.onload = () => { ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.drawImage(img, 0, 0); };
    img.src = last;
    status("Undone");
  }, [history]);

  // ── Load image onto canvas ────────────────────────────────────────
  const loadImage = useCallback((src) => {
    const img = new Image();
    img.onload = () => {
      const maxW = window.innerWidth - 280;
      const maxH = window.innerHeight - 120;
      let w = img.width, h = img.height;
      if (w > maxW) { h = h * maxW / w; w = maxW; }
      if (h > maxH) { w = w * maxH / h; h = maxH; }
      w = Math.round(w); h = Math.round(h);
      setImageDimensions({ w, h });
      const canvas = canvasRef.current;
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, w, h);
      setImage(src);
      setShowDropZone(false);
      setHistory([]);
      status(`Image loaded — ${img.width}×${img.height}px`, 3000);
    };
    img.src = src;
  }, []);

  // ── Clipboard paste ───────────────────────────────────────────────
  useEffect(() => {
    const handlePaste = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const blob = item.getAsFile();
          const reader = new FileReader();
          reader.onload = (ev) => loadImage(ev.target.result);
          reader.readAsDataURL(blob);
          break;
        }
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [loadImage]);

  // ── Keyboard shortcuts ────────────────────────────────────────────
  useEffect(() => {
    const handleKey = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if ((e.metaKey || e.ctrlKey) && e.key === "z") { e.preventDefault(); undo(); return; }
      const t = TOOLS.find(t => t.shortcut === e.key.toUpperCase());
      if (t) setTool(t.id);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [undo]);

  // ── Drop zone ─────────────────────────────────────────────────────
  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (ev) => loadImage(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => loadImage(ev.target.result);
    reader.readAsDataURL(file);
  };

  // ── Canvas coordinate helper ──────────────────────────────────────
  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
  };

  // ── Apply blur to region ──────────────────────────────────────────
  const applyBlur = (ctx, x, y, w, h, radius = 10) => {
    ctx.save();
    ctx.filter = `blur(${radius}px)`;
    const imageData = ctx.getImageData(x, y, w, h);
    const offscreen = document.createElement("canvas");
    offscreen.width = w; offscreen.height = h;
    const octx = offscreen.getContext("2d");
    octx.putImageData(imageData, 0, 0);
    ctx.filter = `blur(${radius}px)`;
    ctx.drawImage(offscreen, x, y);
    ctx.restore();
    // Second pass for stronger blur
    ctx.save();
    ctx.filter = `blur(${radius}px)`;
    const d2 = ctx.getImageData(x, y, w, h);
    const o2 = document.createElement("canvas");
    o2.width = w; o2.height = h;
    const c2 = o2.getContext("2d");
    c2.putImageData(d2, 0, 0);
    ctx.drawImage(o2, x, y);
    ctx.restore();
  };

  // ── Apply pixelate to region ──────────────────────────────────────
  const applyPixelate = (ctx, x, y, w, h, blockSize = 12) => {
    const imageData = ctx.getImageData(x, y, w, h);
    const d = imageData.data;
    for (let py = 0; py < h; py += blockSize) {
      for (let px = 0; px < w; px += blockSize) {
        const i = (py * w + px) * 4;
        const r = d[i], g = d[i+1], b = d[i+2], a = d[i+3];
        for (let fy = 0; fy < blockSize && py + fy < h; fy++) {
          for (let fx = 0; fx < blockSize && px + fx < w; fx++) {
            const j = ((py + fy) * w + (px + fx)) * 4;
            d[j] = r; d[j+1] = g; d[j+2] = b; d[j+3] = a;
          }
        }
      }
    }
    ctx.putImageData(imageData, x, y);
  };

  // ── Draw arrow ────────────────────────────────────────────────────
  const drawArrow = (ctx, x1, y1, x2, y2, color = "#FF4757", size = 3) => {
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const headLen = 20 + size * 3;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = size + 1;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - headLen * Math.cos(angle - Math.PI/7), y2 - headLen * Math.sin(angle - Math.PI/7));
    ctx.lineTo(x2 - headLen * Math.cos(angle + Math.PI/7), y2 - headLen * Math.sin(angle + Math.PI/7));
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };

  // ── Mouse down ────────────────────────────────────────────────────
  const handleMouseDown = (e) => {
    if (!image) return;
    const pos = getPos(e);
    if (tool === "text") {
      setTextPos(pos);
      setShowTextBox(true);
      return;
    }
    if (tool === "arrow") {
      setArrowStart(pos);
      setIsDrawing(true);
      return;
    }
    saveHistory();
    setIsDrawing(true);
    setStartPos(pos);
    lastDrawPos.current = pos;
    if (tool === "draw") {
      const ctx = canvasRef.current.getContext("2d");
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, brushSize / 2, 0, Math.PI * 2);
      ctx.fillStyle = drawColor;
      ctx.fill();
    }
  };

  // ── Mouse move ────────────────────────────────────────────────────
  const handleMouseMove = (e) => {
    if (!isDrawing || !image) return;
    const pos = getPos(e);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (tool === "draw") {
      ctx.beginPath();
      ctx.moveTo(lastDrawPos.current.x, lastDrawPos.current.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.strokeStyle = drawColor;
      ctx.lineWidth = brushSize;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();
      lastDrawPos.current = pos;
    }
  };

  // ── Mouse up ──────────────────────────────────────────────────────
  const handleMouseUp = (e) => {
    if (!isDrawing || !image) return;
    const pos = getPos(e);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (tool === "arrow" && arrowStart) {
      saveHistory();
      drawArrow(ctx, arrowStart.x, arrowStart.y, pos.x, pos.y, drawColor, brushSize / 8 + 2);
      setArrowStart(null);
      status("Arrow drawn");
    }

    if (tool === "redact") {
      const x = Math.min(startPos.x, pos.x);
      const y = Math.min(startPos.y, pos.y);
      const w = Math.abs(pos.x - startPos.x);
      const h = Math.abs(pos.y - startPos.y);
      if (w > 2 && h > 2) {
        ctx.fillStyle = redactColor;
        ctx.fillRect(x, y, w, h);
        status("Redacted ✓");
      }
    }

    if (tool === "blur") {
      const x = Math.min(startPos.x, pos.x);
      const y = Math.min(startPos.y, pos.y);
      const w = Math.abs(pos.x - startPos.x);
      const h = Math.abs(pos.y - startPos.y);
      if (w > 4 && h > 4) {
        applyBlur(ctx, Math.floor(x), Math.floor(y), Math.floor(w), Math.floor(h), brushSize);
        status("Blurred ✓");
      }
    }

    if (tool === "pixelate") {
      const x = Math.min(startPos.x, pos.x);
      const y = Math.min(startPos.y, pos.y);
      const w = Math.abs(pos.x - startPos.x);
      const h = Math.abs(pos.y - startPos.y);
      if (w > 4 && h > 4) {
        applyPixelate(ctx, Math.floor(x), Math.floor(y), Math.floor(w), Math.floor(h), brushSize);
        status("Pixelated ✓");
      }
    }

    if (tool === "crop") {
      const x = Math.min(startPos.x, pos.x);
      const y = Math.min(startPos.y, pos.y);
      const w = Math.abs(pos.x - startPos.x);
      const h = Math.abs(pos.y - startPos.y);
      if (w > 10 && h > 10) {
        const imageData = ctx.getImageData(Math.floor(x), Math.floor(y), Math.floor(w), Math.floor(h));
        canvas.width = Math.floor(w);
        canvas.height = Math.floor(h);
        ctx.putImageData(imageData, 0, 0);
        setImageDimensions({ w: Math.floor(w), h: Math.floor(h) });
        status("Cropped ✓");
      }
    }

    setIsDrawing(false);
  };

  // ── Selection preview overlay ─────────────────────────────────────
  const handleMouseMoveOverlay = (e) => {
    if (!isDrawing) return;
    const overlay = overlayRef.current;
    if (!overlay) return;
    const canvas = canvasRef.current;
    const pos = getPos(e);
    const x = Math.min(startPos.x, pos.x);
    const y = Math.min(startPos.y, pos.y);
    const w = Math.abs(pos.x - startPos.x);
    const h = Math.abs(pos.y - startPos.y);

    const rect = canvas.getBoundingClientRect();
    const scaleX = rect.width / canvas.width;
    const scaleY = rect.height / canvas.height;

    if (["redact", "blur", "pixelate", "crop"].includes(tool)) {
      overlay.style.left = (x * scaleX + rect.left - canvas.parentElement.getBoundingClientRect().left) + "px";
      overlay.style.top = (y * scaleY) + "px";
      overlay.style.width = (w * scaleX) + "px";
      overlay.style.height = (h * scaleY) + "px";
      overlay.style.display = "block";
    }

    if (tool === "draw") handleMouseMove(e);
  };

  const handleMouseUpOverlay = (e) => {
    if (overlayRef.current) overlayRef.current.style.display = "none";
    handleMouseUp(e);
  };

  // ── Add text ──────────────────────────────────────────────────────
  const commitText = () => {
    if (!textInput.trim() || !textPos) { setShowTextBox(false); return; }
    saveHistory();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.font = `bold ${fontSize}px Inter, Helvetica Neue, sans-serif`;
    ctx.fillStyle = drawColor;
    ctx.shadowColor = "rgba(0,0,0,0.6)";
    ctx.shadowBlur = 4;
    ctx.fillText(textInput, textPos.x, textPos.y);
    ctx.shadowBlur = 0;
    setTextInput("");
    setShowTextBox(false);
    setTextPos(null);
    status("Text added ✓");
  };

  // ── Export ────────────────────────────────────────────────────────
  const exportImage = (format = "png") => {
    const canvas = canvasRef.current;
    const link = document.createElement("a");
    link.download = `basimp-export.${format}`;
    link.href = canvas.toDataURL(format === "jpg" ? "image/jpeg" : "image/png", 0.95);
    link.click();
    status(`Saved as ${format.toUpperCase()} ✓`);
  };

  const copyToClipboard = async () => {
    const canvas = canvasRef.current;
    canvas.toBlob(async (blob) => {
      try {
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
        status("Copied to clipboard ✓");
      } catch {
        status("Copy failed — try exporting instead");
      }
    });
  };

  // ── Cursor style ──────────────────────────────────────────────────
  const getCursor = () => {
    if (tool === "draw") return "crosshair";
    if (tool === "text") return "text";
    if (tool === "select") return "default";
    return "crosshair";
  };

  // ── Tool accent color ─────────────────────────────────────────────
  const toolColors = { redact: "#FF4757", blur: "#6C63FF", pixelate: "#F39C12", crop: "#2ECC71", arrow: "#FF4757", text: "#00BCD4", draw: "#FF9FF3", select: "#6C63FF" };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: BRAND.bg, color: BRAND.text, fontFamily: "'Inter', 'Helvetica Neue', sans-serif", overflow: "hidden" }}>

      {/* ── Top Bar ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", height: "52px", background: BRAND.surface, borderBottom: `1px solid ${BRAND.border}`, flexShrink: 0, zIndex: 10 }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "#1A1A2E", border: `1px solid ${BRAND.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, color: BRAND.accent }}>b</div>
          <span style={{ fontWeight: 700, fontSize: 17, letterSpacing: "-0.3px" }}>
            bas<span style={{ color: BRAND.accent }}>imp</span>
          </span>
          <span style={{ fontSize: 11, color: BRAND.textMuted, marginLeft: 4, background: BRAND.accentLight, border: `1px solid ${BRAND.accent}44`, borderRadius: 4, padding: "2px 6px" }}>BETA</span>
        </div>

        {/* Status */}
        <div style={{ fontSize: 13, color: BRAND.textMuted }}>{statusMsg}</div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 8 }}>
          {image && (
            <>
              <button onClick={undo} disabled={history.length === 0} style={btnStyle(BRAND, history.length === 0)} title="Undo (Ctrl+Z)">↩ Undo</button>
              <button onClick={copyToClipboard} style={btnStyle(BRAND)} title="Copy to clipboard">📋 Copy</button>
              <button onClick={() => exportImage("png")} style={btnStyle(BRAND, false, true)}>⬇ PNG</button>
              <button onClick={() => exportImage("jpg")} style={btnStyle(BRAND)}>⬇ JPG</button>
            </>
          )}
          <button onClick={() => fileInputRef.current.click()} style={btnStyle(BRAND)}>📁 Open</button>
          <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileInput} />
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* ── Left Toolbar ── */}
        <div style={{ width: 64, background: BRAND.surface, borderRight: `1px solid ${BRAND.border}`, display: "flex", flexDirection: "column", alignItems: "center", padding: "12px 0", gap: 4, flexShrink: 0 }}>
          {TOOLS.map(t => (
            <button
              key={t.id}
              onClick={() => setTool(t.id)}
              title={`${t.label} (${t.shortcut})`}
              style={{
                width: 44, height: 44, borderRadius: 10,
                background: tool === t.id ? toolColors[t.id] + "22" : "transparent",
                border: tool === t.id ? `1.5px solid ${toolColors[t.id]}` : `1.5px solid transparent`,
                color: tool === t.id ? toolColors[t.id] : BRAND.textMuted,
                fontSize: t.id === "text" ? 16 : 20,
                fontWeight: t.id === "text" ? 800 : 400,
                cursor: "pointer", transition: "all 0.15s", display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", gap: 2,
              }}
            >
              <span>{t.icon}</span>
              <span style={{ fontSize: 8, fontWeight: 600, letterSpacing: 0.5, opacity: 0.7 }}>{t.shortcut}</span>
            </button>
          ))}

          <div style={{ flex: 1 }} />

          {/* Color picker dot */}
          <div style={{ position: "relative" }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: drawColor, border: `2px solid ${BRAND.border}`, cursor: "pointer", position: "relative", overflow: "hidden" }}>
              <input type="color" value={drawColor} onChange={e => setDrawColor(e.target.value)} style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", width: "100%", height: "100%" }} title="Pick color" />
            </div>
          </div>
        </div>

        {/* ── Canvas Area ── */}
        <div
          style={{ flex: 1, overflow: "auto", position: "relative", display: "flex", alignItems: showDropZone ? "center" : "flex-start", justifyContent: showDropZone ? "center" : "flex-start", padding: showDropZone ? 0 : "24px" }}
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
        >
          {showDropZone ? (
            <div style={{ textAlign: "center", padding: 48, border: `2px dashed ${BRAND.border}`, borderRadius: 20, maxWidth: 420, cursor: "pointer" }} onClick={() => fileInputRef.current.click()}>
              <div style={{ fontSize: 52, marginBottom: 16 }}>🖼</div>
              <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Drop image here</div>
              <div style={{ color: BRAND.textMuted, fontSize: 14, lineHeight: 1.6 }}>
                Or press <kbd style={kbdStyle}>Ctrl+V</kbd> to paste from clipboard<br/>
                or click to open a file
              </div>
              <div style={{ marginTop: 24, display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                {["PNG", "JPG", "WebP", "GIF", "TIFF"].map(f => (
                  <span key={f} style={{ fontSize: 11, color: BRAND.textMuted, background: BRAND.surface, padding: "3px 8px", borderRadius: 4, border: `1px solid ${BRAND.border}` }}>{f}</span>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ position: "relative", display: "inline-block" }}>
              <canvas
                ref={canvasRef}
                style={{ display: "block", cursor: getCursor(), boxShadow: "0 8px 40px rgba(0,0,0,0.5)", borderRadius: 4, maxWidth: "100%" }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMoveOverlay}
                onMouseUp={handleMouseUpOverlay}
                onMouseLeave={handleMouseUpOverlay}
              />
              {/* Selection preview overlay */}
              <div ref={overlayRef} style={{
                display: "none", position: "absolute", pointerEvents: "none",
                border: `2px dashed ${toolColors[tool] || BRAND.accent}`,
                background: (toolColors[tool] || BRAND.accent) + "20",
                borderRadius: 2, zIndex: 5,
              }} />
              {/* Text input overlay */}
              {showTextBox && textPos && (
                <div style={{ position: "absolute", left: textPos.x / (canvasRef.current.width / canvasRef.current.getBoundingClientRect().width), top: textPos.y / (canvasRef.current.height / canvasRef.current.getBoundingClientRect().height), zIndex: 20 }}>
                  <input
                    autoFocus
                    value={textInput}
                    onChange={e => setTextInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") commitText(); if (e.key === "Escape") setShowTextBox(false); }}
                    placeholder="Type then Enter..."
                    style={{ background: "rgba(0,0,0,0.85)", color: drawColor, border: `1.5px solid ${drawColor}`, borderRadius: 4, padding: "4px 8px", fontSize: fontSize * (canvasRef.current.getBoundingClientRect().width / canvasRef.current.width), fontWeight: 700, outline: "none", minWidth: 160 }}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Right Panel ── */}
        {image && (
          <div style={{ width: 200, background: BRAND.surface, borderLeft: `1px solid ${BRAND.border}`, padding: "16px 14px", display: "flex", flexDirection: "column", gap: 20, flexShrink: 0, overflowY: "auto" }}>

            {/* Tool name */}
            <div>
              <div style={{ fontSize: 11, color: BRAND.textMuted, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Active Tool</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: toolColors[tool] || BRAND.accent }}>
                {TOOLS.find(t => t.id === tool)?.label}
              </div>
            </div>

            {/* Brush / block size */}
            {["blur", "pixelate", "draw", "arrow"].includes(tool) && (
              <div>
                <div style={{ fontSize: 11, color: BRAND.textMuted, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>
                  {tool === "blur" ? "Blur Radius" : tool === "pixelate" ? "Block Size" : "Size"} — {brushSize}
                </div>
                <input type="range" min={tool === "pixelate" ? 4 : tool === "blur" ? 5 : 2} max={tool === "pixelate" ? 40 : tool === "blur" ? 40 : 40} value={brushSize} onChange={e => setBrushSize(Number(e.target.value))} style={{ width: "100%", accentColor: BRAND.accent }} />
              </div>
            )}

            {/* Font size for text */}
            {tool === "text" && (
              <div>
                <div style={{ fontSize: 11, color: BRAND.textMuted, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Font Size — {fontSize}px</div>
                <input type="range" min={12} max={96} value={fontSize} onChange={e => setFontSize(Number(e.target.value))} style={{ width: "100%", accentColor: BRAND.accent }} />
              </div>
            )}

            {/* Redact color */}
            {tool === "redact" && (
              <div>
                <div style={{ fontSize: 11, color: BRAND.textMuted, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Redact Color</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {REDACT_COLORS.map(c => (
                    <div key={c} onClick={() => setRedactColor(c)} style={{ width: 28, height: 28, borderRadius: 6, background: c, border: redactColor === c ? `2px solid ${BRAND.accent}` : `1px solid ${BRAND.border}`, cursor: "pointer" }} />
                  ))}
                </div>
              </div>
            )}

            {/* Color for text/draw/arrow */}
            {["draw", "text", "arrow"].includes(tool) && (
              <div>
                <div style={{ fontSize: 11, color: BRAND.textMuted, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Color</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                  {["#FF4757", "#6C63FF", "#2ECC71", "#F39C12", "#00BCD4", "#FF9FF3", "#FFFFFF", "#1A1A2E"].map(c => (
                    <div key={c} onClick={() => setDrawColor(c)} style={{ width: 24, height: 24, borderRadius: 5, background: c, border: drawColor === c ? `2px solid white` : `1px solid ${BRAND.border}`, cursor: "pointer" }} />
                  ))}
                </div>
                <input type="color" value={drawColor} onChange={e => setDrawColor(e.target.value)} style={{ width: "100%", height: 32, borderRadius: 6, border: `1px solid ${BRAND.border}`, cursor: "pointer", background: "none" }} />
              </div>
            )}

            {/* Image info */}
            <div style={{ marginTop: "auto", paddingTop: 16, borderTop: `1px solid ${BRAND.border}` }}>
              <div style={{ fontSize: 11, color: BRAND.textMuted, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Image</div>
              <div style={{ fontSize: 12, color: BRAND.textMuted }}>{imageDimensions.w} × {imageDimensions.h}px</div>
              <div style={{ fontSize: 12, color: BRAND.textMuted, marginTop: 4 }}>{history.length} edit{history.length !== 1 ? "s" : ""}</div>
            </div>

            {/* Export buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button onClick={copyToClipboard} style={{ ...btnStyle(BRAND), width: "100%", justifyContent: "center" }}>📋 Copy</button>
              <button onClick={() => exportImage("png")} style={{ ...btnStyle(BRAND, false, true), width: "100%", justifyContent: "center" }}>⬇ Export PNG</button>
              <button onClick={() => exportImage("jpg")} style={{ ...btnStyle(BRAND), width: "100%", justifyContent: "center" }}>⬇ Export JPG</button>
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom Bar ── */}
      <div style={{ height: 28, background: BRAND.surface, borderTop: `1px solid ${BRAND.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", fontSize: 11, color: BRAND.textMuted, flexShrink: 0 }}>
        <span>basimp.com — Basic Image Manipulator</span>
        <span>Ctrl+Z undo · V select · R redact · B blur · P pixelate · C crop · A arrow · T text · D draw</span>
      </div>
    </div>
  );
}

// ─── Style helpers ─────────────────────────────────────────────────────────────
function btnStyle(BRAND, disabled = false, primary = false) {
  return {
    padding: "6px 12px", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer",
    border: `1px solid ${primary ? BRAND.accent : BRAND.border}`,
    background: primary ? BRAND.accent : "transparent",
    color: disabled ? BRAND.textMuted : primary ? "#fff" : BRAND.text,
    opacity: disabled ? 0.4 : 1, transition: "all 0.15s", display: "flex", alignItems: "center", gap: 4,
  };
}

function kbdStyle() {
  return { background: "#2E2E4A", border: "1px solid #4A4A6A", borderRadius: 4, padding: "1px 6px", fontSize: 12, fontFamily: "monospace" };
}

// Make kbdStyle a proper object for JSX
const kbdStyle2 = { background: "#2E2E4A", border: "1px solid #4A4A6A", borderRadius: 4, padding: "1px 6px", fontSize: 12, fontFamily: "monospace" };
