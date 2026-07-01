    const { useState, useRef, useEffect, useCallback } = React;

    const BRAND = {
      bg: "#050505", surface: "#111111", surfaceHover: "#1A1A1A",
      border: "#222222", accent: "#FFFFFF", accentHover: "#EEEEEE",
      accentLight: "#FFFFFF22", text: "#F0F0F0", textMuted: "#AAAAAA",
      danger: "#FF4757", success: "#2ECC71",
    };

    const TOOLS = [
      { id: "select", icon: "➚", label: "Select Tool", shortcut: "V" },
      { id: "redact", icon: "▬", label: "Redact Tool", shortcut: "R" },
      { id: "blur", icon: "◈", label: "Blur Tool", shortcut: "B" },
      { id: "pixelate", icon: "⊞", label: "Pixelate Tool", shortcut: "P" },
      { id: "crop", icon: "⊡", label: "Crop Tool", shortcut: "C" },
      { id: "resize", icon: "⤡", label: "Resize Tool", shortcut: "S" },
      { id: "arrow", icon: "↗", label: "Arrow Tool", shortcut: "A" },
      { id: "text", icon: "T", label: "Text Tool", shortcut: "T" },
      { id: "draw", icon: "✎", label: "Draw Tool", shortcut: "D" },
    ];

    const REDACT_COLORS = ["#000000", "#1A1A2E", "#FF4757", "#FFFFFF", "#FFD700"];
    const toolColors = { select: "#6C63FF", redact: "#FF4757", blur: "#6C63FF", pixelate: "#F39C12", crop: "#2ECC71", arrow: "#FF4757", text: "#00BCD4", draw: "#FF9FF3", resize: "#6C63FF" };
    
    // Vignelli's 6 essential fonts (Free equivalents)
    const VIGNELLI_FONTS = [
      { name: "Garamond", family: "'EB Garamond', serif" },
      { name: "Bodoni", family: "'Libre Bodoni', serif" },
      { name: "Century", family: "'Crimson Pro', serif" },
      { name: "Futura", family: "'Jost', sans-serif" },
      { name: "Times", family: "'Times New Roman', serif" },
      { name: "Helvetica", family: "'Inter', sans-serif" }
    ];

    // ── Social media canvas presets ───────────────────────────────────────────
    const SOCIALS = [
      {
        id: "instagram", label: "Instagram", color: "#E1306C",
        icon: React.createElement("svg", { width: 16, height: 16, viewBox: "0 0 24 24", fill: "currentColor" },
          React.createElement("path", { d: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" })
        ),
        sizes: [
          { label: "Post (Square)", w: 1080, h: 1080 },
          { label: "Portrait Post", w: 1080, h: 1350 },
          { label: "Story / Reel", w: 1080, h: 1920 },
          { label: "Landscape Post", w: 1080, h: 566 },
        ]
      },
      {
        id: "youtube", label: "YouTube", color: "#FF0000",
        icon: React.createElement("svg", { width: 16, height: 16, viewBox: "0 0 24 24", fill: "currentColor" },
          React.createElement("path", { d: "M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z" })
        ),
        sizes: [
          { label: "Thumbnail", w: 1280, h: 720 },
          { label: "Channel Banner", w: 2560, h: 1440 },
          { label: "Shorts", w: 1080, h: 1920 },
          { label: "Community Post", w: 1080, h: 1080 },
        ]
      },
      {
        id: "linkedin", label: "LinkedIn", color: "#0A66C2",
        icon: React.createElement("svg", { width: 16, height: 16, viewBox: "0 0 24 24", fill: "currentColor" },
          React.createElement("path", { d: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" })
        ),
        sizes: [
          { label: "Post (Square)", w: 1080, h: 1080 },
          { label: "Post (Landscape)", w: 1200, h: 627 },
          { label: "Story", w: 1080, h: 1920 },
          { label: "Banner", w: 1584, h: 396 },
        ]
      },
      {
        id: "x", label: "X / Twitter", color: "#000000",
        icon: React.createElement("svg", { width: 14, height: 14, viewBox: "0 0 24 24", fill: "currentColor" },
          React.createElement("path", { d: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.741l7.73-8.835L1.254 2.25H8.08l4.713 5.865zm-1.161 17.52h1.833L7.084 4.126H5.117z" })
        ),
        sizes: [
          { label: "Post (Square)", w: 1080, h: 1080 },
          { label: "Post (Landscape)", w: 1600, h: 900 },
          { label: "Header", w: 1500, h: 500 },
          { label: "Card", w: 800, h: 418 },
        ]
      },
      {
        id: "tiktok", label: "TikTok", color: "#010101",
        icon: React.createElement("svg", { width: 14, height: 14, viewBox: "0 0 24 24", fill: "currentColor" },
          React.createElement("path", { d: "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" })
        ),
        sizes: [
          { label: "Video / Story", w: 1080, h: 1920 },
          { label: "Square Post", w: 1080, h: 1080 },
          { label: "Landscape", w: 1920, h: 1080 },
          { label: "Profile Photo", w: 200, h: 200 },
        ]
      },
      {
        id: "pinterest", label: "Pinterest", color: "#E60023",
        icon: React.createElement("svg", { width: 14, height: 14, viewBox: "0 0 24 24", fill: "currentColor" },
          React.createElement("path", { d: "M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" })
        ),
        sizes: [
          { label: "Standard Pin", w: 1000, h: 1500 },
          { label: "Square Pin", w: 1000, h: 1000 },
          { label: "Long Pin", w: 1000, h: 2100 },
          { label: "Story Pin", w: 1080, h: 1920 },
        ]
      },
      {
        id: "bluesky", label: "Bluesky", color: "#0085FF",
        icon: React.createElement("svg", { width: 16, height: 16, viewBox: "0 0 24 24", fill: "currentColor" },
          React.createElement("path", { d: "M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.204-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8z" })
        ),
        sizes: [
          { label: "Post (Square)", w: 1080, h: 1080 },
          { label: "Post (Landscape)", w: 1200, h: 675 },
          { label: "Banner", w: 3000, h: 1000 },
          { label: "Avatar", w: 400, h: 400 },
        ]
      },
    ];

    function btnStyle(BRAND, disabled = false, primary = false) {
      return {
        padding: "6px 12px", borderRadius: 7, fontSize: 12, fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        border: `1px solid ${primary ? BRAND.accent : BRAND.border}`,
        background: primary ? BRAND.accent : "transparent",
        color: disabled ? BRAND.textMuted : primary ? "#000" : BRAND.text,
        opacity: disabled ? 0.4 : 1, transition: "all 0.15s",
        display: "flex", alignItems: "center", gap: 4,
      };
    }

    function BasimpEditor() {
      const canvasRef = useRef(null);
      const overlayRef = useRef(null);
      const fileInputRef = useRef(null);
      const [image, setImage] = useState(null);
      const [imageDimensions, setImageDimensions] = useState({ w: 0, h: 0 });
      const [isFit, setIsFit] = useState(true);
      const [displayZoom, setDisplayZoom] = useState(100);
      const [customZoom, setCustomZoom] = useState(100);
      const [resizePreviewScale, setResizePreviewScale] = useState(null);
      
      const imageCache = useRef(new Map());
      const getCachedImage = useCallback((src) => {
        if (!src) return null;
        if (imageCache.current.has(src)) return imageCache.current.get(src);
        const img = new Image();
        img.src = src;
        img.onload = () => renderAll();
        imageCache.current.set(src, img);
        return img;
      }, []);
      const [resizeDims, setResizeDims] = useState({ w: 0, h: 0 });
      const [resizeMode, setResizeMode] = useState("scale"); // "scale" | "canvas"
      const [aspectLock, setAspectLock] = useState(true);
      const [tool, setTool] = useState("arrow");
      const [layers, setLayers] = useState([]); // [{id, type, x, y, w, h, ...}]
      const [previewLayer, setPreviewLayer] = useState(null);
      const [selectedLayerId, setSelectedLayerId] = useState(null);
      const [baseImage, setBaseImage] = useState(null); // The rendered image (may include mockup)
      const [sourceImage, setSourceImage] = useState(null); // The original image (without mockup)
      const [arrowStyle, setArrowStyle] = useState("classic");
      const [isDrawing, setIsDrawing] = useState(false);
      const [startPos, setStartPos] = useState({ x: 0, y: 0 });
      
      // 🔄 Sync Canvas Internal Resolution with Logical Image Dimensions
      useEffect(() => {
        if (!canvasRef.current || imageDimensions.w === 0) return;
        const canvas = canvasRef.current;
        if (canvas.width !== imageDimensions.w || canvas.height !== imageDimensions.h) {
          canvas.width = imageDimensions.w;
          canvas.height = imageDimensions.h;
          renderAll(); // Redraw immediately when resolution changes
        }
      }, [imageDimensions]);
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
      const [fontFamily, setFontFamily] = useState(VIGNELLI_FONTS[5].family); // Default to Helvetica (Inter)
      const [textBgEnabled, setTextBgEnabled] = useState(false);
      const [textBgColor, setTextBgColor] = useState("#000000");
      const [textBgOpacity, setTextBgOpacity] = useState(80);
      // Sanitize export state
      const [sanitizeMode, setSanitizeMode] = useState(false);
      const [showSanitizeBadge, setShowSanitizeBadge] = useState(false);
      const [sanitizeFirstUse, setSanitizeFirstUse] = useState(true);
      
      // 💎 Pro State 
      const [isPro, setIsPro] = useState(false);
      const [proModalOpen, setProModalOpen] = useState(false);
      const [inputProKey, setInputProKey] = useState("");
      const [verifying, setVerifying] = useState(false);
      const [devModeCount, setDevModeCount] = useState(0); // Secret to enable Pro for devs

      // 👤 Auth & Credits State
      const [user, setUser] = useState(null); // { email, is_pro, credits, credits_spent, byok_unlocked, byok_key }
      const [authModalOpen, setAuthModalOpen] = useState(false);
      const [authEmail, setAuthEmail] = useState("");
      const [authSent, setAuthSent] = useState(false);
      const [authLoading, setAuthLoading] = useState(false);
      const [byokInput, setByokInput] = useState("");
      const [byokSaving, setByokSaving] = useState(false);
      const [activeTab, setActiveTab] = useState("login"); // "login" | "credits" | "byok"

      // Session token stored in localStorage
      const getToken = () => localStorage.getItem("bimp_session");
      const setToken = (t) => t ? localStorage.setItem("bimp_session", t) : localStorage.removeItem("bimp_session");

      // Fetch user from API
      const fetchUser = useCallback(async (token) => {
        if (!token) return;
        try {
          const r = await fetch("/api/user", { headers: { Authorization: `Bearer ${token}` } });
          if (r.ok) {
            const data = await r.json();
            setUser(data);
            setIsPro(data.is_pro);
            if (data.byok_key) setByokInput(data.byok_key);
          } else {
            setToken(null);
            setUser(null);
          }
        } catch {}
      }, []);

      // On mount — check for session token in URL hash or localStorage
      useEffect(() => {
        const hash = window.location.hash;
        if (hash.includes("session=")) {
          const token = hash.split("session=")[1];
          setToken(token);
          window.location.hash = "";
          fetchUser(token);
        } else {
          const token = getToken();
          if (token) fetchUser(token);
        }
      }, [fetchUser]);

      // On mount — pre-enable Sanitize mode when linked from the landing page (?sanitize=1)
      useEffect(() => {
        if (new URLSearchParams(window.location.search).get("sanitize") === "1") {
          setSanitizeMode(true);
        }
      }, []);

      // Send magic link
      const sendMagicLink = async () => {
        if (!authEmail.includes("@")) return;
        setAuthLoading(true);
        try {
          const r = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: authEmail })
          });
          if (r.ok) setAuthSent(true);
          else status("Failed to send magic link — try again");
        } catch { status("Network error — try again"); }
        setAuthLoading(false);
      };

      // Logout
      const logout = async () => {
        const token = getToken();
        if (token) await fetch("/api/auth/logout", { method: "POST", headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
        setToken(null);
        setUser(null);
        setIsPro(false);
        status("Logged out");
      };

      // Save BYOK key
      const saveByok = async () => {
        if (!byokInput.trim()) return;
        setByokSaving(true);
        try {
          const r = await fetch("/api/user/byok", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
            body: JSON.stringify({ key: byokInput.trim() })
          });
          if (r.ok) { status("✓ API key saved"); fetchUser(getToken()); }
          else { const d = await r.json(); status(d.error || "Failed to save key"); }
        } catch { status("Network error"); }
        setByokSaving(false);
      };

      // Use credits for AI feature
      const useCredits = async (amount = 1) => {
        const token = getToken();
        if (!token) { setAuthModalOpen(true); return false; }
        try {
          const r = await fetch("/api/credits/use", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ amount })
          });
          const d = await r.json();
          if (r.ok) { setUser(u => ({ ...u, credits: d.credits, credits_spent: d.credits_spent, byok_unlocked: d.byok_unlocked })); return true; }
          if (r.status === 402) { status("⚠ Not enough credits — top up to continue"); setAuthModalOpen(true); setActiveTab("credits"); return false; }
        } catch {}
        return false;
      };

      const enableDevMode = () => {
        if (devModeCount >= 4) {
          setIsPro(true);
          status("🛠 Developer Mode: Pro Unlocked");
        } else {
          setDevModeCount(c => c + 1);
        }
      };

  // 📦 Batch Mode State
  const [fileQueue, setFileQueue] = useState([]); // Array of File objects
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);

      // Sync sliders when layer is selected
      useEffect(() => {
        if (selectedLayerId) {
          const l = layers.find(x => x.id === selectedLayerId);
          if (l) {
            if (l.radius) setBrushSize(l.radius);
            if (l.fontSize) setFontSize(l.fontSize);
            if (l.fontFamily) setFontFamily(l.fontFamily);
            if (l.color) {
              if (l.type === "redact") setRedactColor(l.color);
              else setDrawColor(l.color);
            }
          }
        }
      }, [selectedLayerId]);

      const updateSelectedLayer = (props) => {
        if (!selectedLayerId || tool !== "select") return;
        setLayers(prev => prev.map(l => l.id === selectedLayerId ? { ...l, ...props } : l));
      };

      const arrowStartRef = useRef(null);
      const [resizeHandle, setResizeHandle] = useState(null); // Which handle of the layer is being dragged?
      const [layerStartPos, setLayerStartPos] = useState(null); // Original coords when drag starts
      const layerStartRef = useRef(null);
      const layerTransformActiveRef = useRef(false);

      // 💎 License Verification
      const verifyProKey = async (key) => {
        if (!key) return; // Silent check
        setVerifying(true);
        try {
          const resp = await fetch(`https://bimp.us/api/verify`, {
            method: "POST", body: JSON.stringify({ key }),
            headers: { "Content-Type": "application/json" }
          });
          const data = await resp.json();
          if (data.valid) {
            setIsPro(true);
            localStorage.setItem("bimp_pro_key", key);
            setStatusMsg("💎 Bimp.us Pro Activated!");
            setProModalOpen(false);
          } else {
            if (proModalOpen) alert("Invalid license key. Please check your purchase receipt.");
          }
        } catch (e) {
          if (proModalOpen) alert("Verification server offline or SSL not ready. Try again in a minute.");
        } finally { setVerifying(false); }
      };

      useEffect(() => {
        const savedKey = localStorage.getItem("bimp_pro_key");
        if (savedKey) verifyProKey(savedKey);
      }, []);

      // 💎 Smart Redact (AI Face Blur)
      const [modelsLoaded, setModelsLoaded] = useState(false);
      const handleAutoRedact = async () => {
        if (!isPro) { setProModalOpen(true); return; }
        if (!image) return;

        setStatusMsg("🤖 AI is looking for faces...");
        try {
          if (!modelsLoaded) {
            const MODEL_URL = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/model/";
            await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
            setModelsLoaded(true);
          }

          const detections = await faceapi.detectAllFaces(canvasRef.current, new faceapi.TinyFaceDetectorOptions());
          
          if (detections.length === 0) {
            setStatusMsg("No faces found. Try manual redact.");
            return;
          }

          const newLayers = [...layers];
          detections.forEach(det => {
            const { x, y, width, height } = det.box;
            newLayers.push({
              id: Date.now() + Math.random(),
              type: "blur",
              x: Math.round(x - 10), y: Math.round(y - 10),
              w: Math.round(width + 20), h: Math.round(height + 20),
              intensity: 20
            });
          });

          setLayers(newLayers);
          setHistory([...history, layers]);
          setStatusMsg(`✓ Auto-redacted ${detections.length} faces`);
        } catch (e) {
          console.error(e);
          setStatusMsg("AI Error. Check console.");
        }
      };

      // 💎 Remove Background (MediaPipe)
      const [mpLoaded, setMpLoaded] = useState(false);
      const handleRemoveBackground = async () => {
        if (!isPro) { setProModalOpen(true); return; }
        if (!image) return;

        setStatusMsg("✂️ Removing background...");
        try {
          if (typeof SelfieSegmentation === 'undefined') {
            throw new Error("MediaPipe script not found. Please refresh.");
          }

          const selfieSegmentation = new SelfieSegmentation({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`
          });

          selfieSegmentation.setOptions({ modelSelection: 0, selfiMode: false });

          selfieSegmentation.onResults((results) => {
            const canvas = document.createElement("canvas");
            canvas.width = sourceImage ? sourceImage.width : imageDimensions.w;
            canvas.height = sourceImage ? sourceImage.height : imageDimensions.h;
            const ctx = canvas.getContext("2d");
            ctx.save();
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Refine mask to remove "glow" using Multi-Pass Erosion
            // We create a temporary mask canvas to "choke" the edges
            const maskOff = document.createElement("canvas");
            maskOff.width = canvas.width; maskOff.height = canvas.height;
            const mCtx = maskOff.getContext("2d");
            
            // 1. Draw original AI mask
            mCtx.drawImage(results.segmentationMask, 0, 0, canvas.width, canvas.height);
            
            // 2. Erode: Draw shifted versions using 'destination-in' to find the intersection
            // This pulls the mask inward by effectively 2-3 pixels
            mCtx.globalCompositeOperation = 'destination-in';
            const SHIFT = 2.5;
            mCtx.drawImage(results.segmentationMask, -SHIFT, 0, canvas.width, canvas.height);
            mCtx.drawImage(results.segmentationMask, SHIFT, 0, canvas.width, canvas.height);
            mCtx.drawImage(results.segmentationMask, 0, -SHIFT, canvas.width, canvas.height);
            mCtx.drawImage(results.segmentationMask, 0, SHIFT, canvas.width, canvas.height);
            
            // 3. Sharpen: Apply high contrast to the eroded mask
            ctx.filter = "contrast(10) brightness(0.6)";
            ctx.drawImage(maskOff, 0, 0);
            ctx.filter = "none";

            // Composite the image
            ctx.globalCompositeOperation = 'source-in';
            ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
            ctx.restore();

            const newSrc = canvas.toDataURL();
            const newImg = new Image();
            newImg.src = newSrc;
            newImg.onload = () => {
              saveHistory();
              setBaseImage(newImg);
              setSourceImage(newImg); // Sync source image after BG removal
              setImage(newSrc);
              setStatusMsg("✓ Background Removed (Refined)!");
            };
          });

          await selfieSegmentation.send({ image: sourceImage || baseImage });
        } catch (e) {
          console.error(e);
          setStatusMsg("Background Removal Error.");
        }
      };

      const applyMockup = (type = "browser") => {
        if (!isPro) { setProModalOpen(true); return; }
        if (!image) return;

        saveHistory();
        const canvas = canvasRef.current;
        const srcImg = sourceImage || baseImage;
        const { width: w, height: h } = srcImg;

        let newW, newH, headerH = 0, footerH = 0, sideW = 0, offsetX = 0, offsetY = 0;
        const off = document.createElement("canvas");

        if (type === "browser") {
          headerH = 36;
          newW = w; newH = h + headerH;
          off.width = newW; off.height = newH;
          const offCtx = off.getContext("2d");
          offCtx.fillStyle = "#1E1E1E"; offCtx.fillRect(0, 0, newW, headerH);
          const colors = ["#FF5F56", "#FFBD2E", "#27C93F"];
          colors.forEach((c, i) => {
            offCtx.fillStyle = c; offCtx.beginPath();
            offCtx.arc(16 + i * 20, headerH / 2, 6, 0, Math.PI * 2); offCtx.fill();
          });
          offCtx.drawImage(srcImg, 0, headerH);
          offsetY = headerH;
        } else if (type === "phone") {
          headerH = 40; footerH = 20; sideW = 10;
          newW = w + sideW * 2; newH = h + headerH + footerH;
          off.width = newW; off.height = newH;
          const offCtx = off.getContext("2d");
          // Frame
          offCtx.fillStyle = "#000"; drawRoundedRect(offCtx, 0, 0, newW, newH, 30); offCtx.fill();
          // Notch
          offCtx.fillStyle = "#111"; drawRoundedRect(offCtx, newW/2 - 40, 8, 80, 18, 9); offCtx.fill();
          offCtx.drawImage(srcImg, sideW, headerH);
          offsetX = sideW; offsetY = headerH;
        } else if (type === "terminal") {
          headerH = 30;
          newW = w; newH = h + headerH;
          off.width = newW; off.height = newH;
          const offCtx = off.getContext("2d");
          offCtx.fillStyle = "#2D2D2D"; offCtx.fillRect(0, 0, newW, headerH);
          offCtx.fillStyle = "#fff"; offCtx.font = "11px monospace";
          offCtx.fillText("bash — 80×24", 14, 19);
          offCtx.drawImage(srcImg, 0, headerH);
          offsetY = headerH;
        }

        const newSrc = off.toDataURL();
        const newImg = new Image();
        newImg.src = newSrc;
        newImg.onload = () => {
          setBaseImage(newImg);
          setImage(newSrc);
          // Reposition layers relative to source
          setLayers(prev => prev.map(l => {
            if (l.type === "arrow") return { ...l, x1: l.x1 + offsetX, y1: l.y1 + offsetY, x2: l.x2 + offsetX, y2: l.y2 + offsetY };
            if (l.type === "draw") return { ...l, points: l.points.map(p => ({ x: p.x + offsetX, y: p.y + offsetY })) };
            return { ...l, x: l.x + offsetX, y: l.y + offsetY };
          }));
          setImageDimensions({ w: newW, h: newH });
          setStatusMsg(`✨ ${type.charAt(0).toUpperCase() + type.slice(1)} Mockup Applied!`);
        };
      };

      function drawRoundedRect(ctx, x, y, width, height, radius) {
        ctx.beginPath(); ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y); ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius); ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height); ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius); ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.fill();
      }

      const [cropSelection, setCropSelection] = useState(null); // { x, y, w, h } in canvas coords
      const cropSelRef = useRef(null); // mirror of cropSelection — used inside getCropHandleAtPos
      const cropDragRef = useRef(null); // { mode, startX, startY, origCrop }
      const resizeDragRef = useRef(null);
      const [socialOpen, setSocialOpen] = useState(false);
      const [activeSocial, setActiveSocial] = useState(null);
      const [saveAsOpen, setSaveAsOpen] = useState(false);
      const socialRef = useRef(null);
      const saveAsRef = useRef(null);
      const lastDrawPos = useRef(null);

      // Core Composition Engine
      const renderAll = useCallback((exporting = false) => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        
        // 1. Clear and Draw Base
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (baseImage) {
          ctx.drawImage(baseImage, 0, 0);
        } else {
          // If no base image but we have dimensions, clear to transparent/checkerboard handled by CSS
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

        // 2. Draw Layers in order
        const allLayers = [...layers, ...(previewLayer ? [previewLayer] : [])];
        allLayers.forEach(layer => {
          drawLayer(ctx, layer);
        });

        // 3. Selection Highlight & Handles
        if (!exporting && selectedLayerId && tool === "select") {
          const l = layers.find(l => l.id === selectedLayerId);
          if (l) {
            const bounds = getLayerBounds(l);
            ctx.save();
            ctx.strokeStyle = BRAND.accent; ctx.lineWidth = 2; ctx.setLineDash([4, 4]);
            if (bounds) {
              ctx.strokeRect(bounds.x, bounds.y, bounds.w, bounds.h);
              ctx.setLineDash([]); ctx.fillStyle = "#fff";
              const hh = [
                [bounds.x, bounds.y], [bounds.x + bounds.w / 2, bounds.y], [bounds.x + bounds.w, bounds.y],
                [bounds.x, bounds.y + bounds.h / 2], [bounds.x + bounds.w, bounds.y + bounds.h / 2],
                [bounds.x, bounds.y + bounds.h], [bounds.x + bounds.w / 2, bounds.y + bounds.h], [bounds.x + bounds.w, bounds.y + bounds.h]
              ];
              hh.forEach(([hx, hy]) => {
                ctx.fillRect(hx - 4, hy - 4, 8, 8); ctx.strokeRect(hx - 4, hy - 4, 8, 8);
              });
            }
            ctx.restore();
          }
        }
      }, [baseImage, layers, previewLayer, selectedLayerId, tool]);

      // Effect to trigger redraw
      useEffect(() => {
        renderAll();
      }, [renderAll]);

      const drawLayer = (ctx, layer) => {
        ctx.save();
        if (layer.type === "redact") {
          ctx.fillStyle = layer.color || "#000";
          ctx.fillRect(layer.x, layer.y, layer.w, layer.h);
        } else if (layer.type === "blur") {
          applyBlur(ctx, layer.x, layer.y, layer.w, layer.h, layer.radius);
        } else if (layer.type === "pixelate") {
          applyPixelate(ctx, layer.x, layer.y, layer.w, layer.h, layer.radius);
        } else if (layer.type === "arrow") {
          drawArrowOnCanvas(ctx, layer.x1, layer.y1, layer.x2, layer.y2, layer.color, layer.size, layer.style);
        } else if (layer.type === "text") {
          ctx.font = `bold ${layer.fontSize}px ${layer.fontFamily || VIGNELLI_FONTS[5].family}`;
          // Clear any residual shadow state — no hardcoded shadow
          ctx.shadowBlur = 0;
          ctx.shadowColor = "transparent";
          // Optional background rectangle
          if (layer.bgEnabled && layer.bgOpacity > 0) {
            const metrics = ctx.measureText(layer.text);
            const pad = 4;
            ctx.save();
            ctx.globalAlpha = layer.bgOpacity / 100;
            ctx.fillStyle = layer.bgColor || "#000000";
            ctx.fillRect(
              layer.x - pad,
              layer.y - layer.fontSize - pad,
              metrics.width + pad * 2,
              layer.fontSize + pad * 2
            );
            ctx.restore();
          }
          ctx.fillStyle = layer.color;
          ctx.fillText(layer.text, layer.x, layer.y);
        } else if (layer.type === "draw") {
          if (layer.points && layer.points.length > 0) {
            ctx.beginPath();
            ctx.strokeStyle = layer.color;
            ctx.lineWidth = layer.size;
            ctx.lineCap = "round"; ctx.lineJoin = "round";
            ctx.moveTo(layer.points[0].x, layer.points[0].y);
            layer.points.forEach(p => ctx.lineTo(p.x, p.y));
            ctx.stroke();
          }
        } else if (layer.type === "image" && layer.src) {
          const img = (layer.img instanceof HTMLImageElement) ? layer.img : getCachedImage(layer.src);
          if (img && img.complete && img.naturalWidth !== 0) {
            ctx.drawImage(img, layer.x, layer.y, layer.w, layer.h);
          }
        }
        ctx.restore();
      };

      const getLayerBounds = (layer) => {
        if (!layer) return null;
        if (["redact", "blur", "pixelate", "image"].includes(layer.type)) {
          return { x: layer.x, y: layer.y, w: layer.w, h: layer.h };
        }
        if (layer.type === "text") {
          const ctx = canvasRef.current?.getContext("2d");
          if (!ctx) return null;
          ctx.save();
          ctx.font = `bold ${layer.fontSize}px ${layer.fontFamily || VIGNELLI_FONTS[5].family}`;
          const w = Math.max(8, ctx.measureText(layer.text || "").width);
          ctx.restore();
          return { x: layer.x, y: layer.y - layer.fontSize, w, h: layer.fontSize };
        }
        if (layer.type === "arrow") {
          const pad = Math.max(8, (layer.size || 4) * 3);
          const x = Math.min(layer.x1, layer.x2);
          const y = Math.min(layer.y1, layer.y2);
          return { x: x - pad, y: y - pad, w: Math.abs(layer.x2 - layer.x1) + pad * 2, h: Math.abs(layer.y2 - layer.y1) + pad * 2 };
        }
        if (layer.type === "draw" && layer.points?.length) {
          const xs = layer.points.map(p => p.x);
          const ys = layer.points.map(p => p.y);
          const pad = Math.max(8, (layer.size || 4) / 2);
          const x = Math.min(...xs) - pad;
          const y = Math.min(...ys) - pad;
          return { x, y, w: Math.max(2, Math.max(...xs) - Math.min(...xs) + pad * 2), h: Math.max(2, Math.max(...ys) - Math.min(...ys) + pad * 2) };
        }
        return null;
      };

      const getBoundsHandle = (bounds, pos) => {
        if (!bounds) return null;
        const { x, y, w, h } = bounds;
        const H = 10;
        const handles = {
          nw: [x, y], n: [x + w / 2, y], ne: [x + w, y],
          w: [x, y + h / 2], e: [x + w, y + h / 2],
          sw: [x, y + h], s: [x + w / 2, y + h], se: [x + w, y + h],
        };
        for (const [name, [hx, hy]] of Object.entries(handles)) {
          if (Math.abs(pos.x - hx) <= H && Math.abs(pos.y - hy) <= H) return name;
        }
        return null;
      };

      const scalePointFromBounds = (p, from, to) => ({
        x: to.x + ((p.x - from.x) / Math.max(1, from.w)) * to.w,
        y: to.y + ((p.y - from.y) / Math.max(1, from.h)) * to.h,
      });

      const transformLayerToBounds = (layer, from, to) => {
        const { _bounds, ...baseLayer } = layer;
        const sx = to.w / Math.max(1, from.w);
        const sy = to.h / Math.max(1, from.h);
        if (["redact", "blur", "pixelate", "image"].includes(layer.type)) {
          return { ...baseLayer, x: to.x, y: to.y, w: to.w, h: to.h, radius: layer.radius ? layer.radius * Math.max(sx, sy) : layer.radius };
        }
        if (layer.type === "text") {
          const scale = Math.max(0.1, Math.max(sx, sy));
          const anchor = scalePointFromBounds({ x: layer.x, y: layer.y }, from, to);
          return { ...baseLayer, x: anchor.x, y: anchor.y, fontSize: Math.max(6, layer.fontSize * scale) };
        }
        if (layer.type === "arrow") {
          const p1 = scalePointFromBounds({ x: layer.x1, y: layer.y1 }, from, to);
          const p2 = scalePointFromBounds({ x: layer.x2, y: layer.y2 }, from, to);
          return { ...baseLayer, x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y, size: Math.max(1, (layer.size || 4) * Math.max(sx, sy)) };
        }
        if (layer.type === "draw" && layer.points?.length) {
          return { ...baseLayer, points: layer.points.map(p => scalePointFromBounds(p, from, to)), size: Math.max(1, (layer.size || 4) * Math.max(sx, sy)) };
        }
        return baseLayer;
      };

      // Effect to measure actual canvas scale for the zoom slider UI
      useEffect(() => {
        if (!canvasRef.current || imageDimensions.w === 0) return;
        const updateZoom = () => {
          if (tool === "resize" && resizePreviewScale) {
            setDisplayZoom(Math.max(1, Math.round(resizePreviewScale * 100)));
            return;
          }
          const canvas = canvasRef.current;
          const rect = canvas.getBoundingClientRect();
          if (isFit) {
            setDisplayZoom(Math.max(1, Math.round((rect.width / imageDimensions.w) * 100)));
          } else {
            setDisplayZoom(customZoom);
          }
        };
        
        // Use ResizeObserver for more reliable zoom updates without the "flicker" of setTimeout
        const observer = new ResizeObserver(updateZoom);
        observer.observe(canvasRef.current);
        updateZoom();
        
        return () => observer.disconnect();
      }, [isFit, customZoom, imageDimensions.w, imageDimensions.h, tool, resizePreviewScale]);

      // Global hotkeys (Enter/Esc) for Apply/Cancel
      useEffect(() => {
        const handleKeyDown = (e) => {
          if (e.key === "Enter") {
            if (tool === "resize") { e.preventDefault(); applyResize(); }
            else if (tool === "crop" && cropSelRef.current) { e.preventDefault(); applyCrop(); }
          } else if (e.key === "Escape") {
            if (tool === "resize") { e.preventDefault(); selectTool("arrow"); }
            else if (tool === "crop" && cropSelRef.current) { e.preventDefault(); cancelCrop(); }
          }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
      }, [tool, resizeDims, imageDimensions, aspectLock]);

      // Curated presets that look great on any screen (light & dark)
      const COLOR_PRESETS = [
        "#FF4757", // red
        "#FF6B35", // orange
        "#FFD700", // yellow
        "#2ECC71", // green
        "#00BCD4", // cyan
        "#6C63FF", // purple (brand)
        "#FF9FF3", // pink
        "#FFFFFF", // white
        "#000000", // black
      ];

      const status = (msg, duration = 2500) => {
        setStatusMsg(msg);
        if (duration) setTimeout(() => setStatusMsg(""), duration);
      };

      const saveHistory = useCallback(() => {
        setHistory(h => [...h.slice(-19), JSON.stringify(layers)]);
      }, [layers]);

      const undo = useCallback(() => {
        if (history.length === 0) return;
        const last = history[history.length - 1];
        try {
          const prevLayers = JSON.parse(last);
          setLayers(prevLayers);
          setHistory(h => h.slice(0, -1));
          status("↩ Undo applied");
        } catch(e) {
          console.error("Undo failed", e);
        }
      }, [history]);

      const addLayerImage = (src) => {
        const img = new Image();
        img.src = src;
        img.onload = () => {
          const canvas = canvasRef.current;
          let w = img.width, h = img.height;
          // Scale down if larger than canvas
          const maxW = canvas.width * 0.8, maxH = canvas.height * 0.8;
          if (w > maxW || h > maxH) {
            const ratio = Math.min(maxW / w, maxH / h);
            w *= ratio; h *= ratio;
          }
          const newLayer = { 
            id: Date.now(), type: "image", img, src, 
            x: (canvas.width - w) / 2, y: (canvas.height - h) / 2, w: Math.round(w), h: Math.round(h),
            ratio: img.width / img.imgHeight || (img.width / img.height) 
          };
          saveHistory();
          setLayers(prev => [...prev, newLayer]);
          setSelectedLayerId(newLayer.id);
          setTool("select");
          status(`+ Image layer added: ${Math.round(w)}×${Math.round(h)}px`);
        };
      };

      const handleFile = (file) => {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          const img = new Image();
          img.onload = () => {
            if (!image) { // If no base image, set it
              setBaseImage(img);
              setSourceImage(img);
              setImage(ev.target.result);
              setImageDimensions({ w: img.width, h: img.height });
              setResizeDims({ w: img.width, h: img.height });
              setIsFit(true); // Default to fit
              setLayers([]);
              setHistory([]);
              setShowDropZone(false);
              status(`✓ Loaded: ${file.name} (${Math.round(file.size/1024)}KB)`);
            } else { // Otherwise, add as a new layer
              addLayerImage(ev.target.result);
            }
          };
          img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
      };

      const handleFiles = (files) => {
        const fileList = Array.from(files).filter(f => f.type.startsWith("image/"));
        if (fileList.length === 0) return;
        
        // Always load the first one immediately
        handleFile(fileList[0]);
        
        if (fileList.length > 1) {
          if (!isPro) {
            setStatusMsg("Pro Tip: Multi-file selection requires Bimp.us Pro.");
            setProModalOpen(true);
            return;
          }
          setFileQueue(fileList);
        }
      };

      const handleFileInput = (e) => handleFiles(e.target.files);
      const handleDrop = (e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); };

      const loadImage = (src) => {
        if (image) { addLayerImage(src); return; }
        const img = new Image();
        img.src = src;
        img.onload = () => {
          setBaseImage(img);
          setImage(src);
          setImageDimensions({ w: img.width, h: img.height });
          setResizeDims({ w: img.width, h: img.height });
          setIsFit(true);
          const canvas = canvasRef.current;
          if (canvas) { canvas.width = img.width; canvas.height = img.height; }
          setLayers([]);
          setShowDropZone(false);
          status(`🖼 Image loaded: ${img.width}×${img.height}px`);
        };
      };

      const runBatchProcess = async () => {
        if (!isPro) { setProModalOpen(true); return; }
        setIsBatchProcessing(true);
        setStatusMsg(`📦 Batch processing ${fileQueue.length} files...`);
        
        try {
          const zip = new JSZip();
          const currentLayers = [...layers]; 
          
          // Use a hidden canvas for background processing
          const offCanvas = document.createElement("canvas");
          const offCtx = offCanvas.getContext("2d");

          for (let i = 0; i < fileQueue.length; i++) {
            const file = fileQueue[i];
            setStatusMsg(`📦 Processing ${i+1}/${fileQueue.length}: ${file.name}`);
            
            // Load file as Image
            const dataUrl = await new Promise(res => {
              const r = new FileReader(); r.onload = x => res(x.target.result); r.readAsDataURL(file);
            });
            const img = await new Promise(res => {
              const m = new Image(); m.onload = () => res(m); m.src = dataUrl;
            });

            offCanvas.width = img.width; offCanvas.height = img.height;
            offCtx.drawImage(img, 0, 0);

            // Render current layers on top
            currentLayers.forEach(l => drawLayer(offCtx, l));

            // Add to zip
            const blob = await new Promise(res => offCanvas.toBlob(res, "image/png"));
            zip.file(file.name.replace(/\.[^/.]+$/, "") + "-bimp.png", blob);
          }

          const content = await zip.generateAsync({ type: "blob" });
          const link = document.createElement("a");
          link.href = URL.createObjectURL(content);
          link.download = `bimp-batch-${Date.now()}.zip`;
          link.click();
          
          setStatusMsg(`✓ Batch complete! ${fileQueue.length} images exported.`);
        } catch (e) {
          console.error(e);
          setStatusMsg("Batch Error. Check console.");
        } finally {
          setIsBatchProcessing(false);
        }
      };

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

      useEffect(() => {
        const handleKey = (e) => {
          if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
          if ((e.metaKey || e.ctrlKey) && e.key === "z") { e.preventDefault(); undo(); return; }
          if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "t") { e.preventDefault(); setTool("select"); status("Select tool active (Ctrl+T)"); return; }
          const t = TOOLS.find(t => t.shortcut === e.key.toUpperCase());
          if (t) setTool(t.id);
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
      }, [undo]);

      const getPos = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
      };

      const applyBlur = (ctx, x, y, w, h, radius = 10) => {
        const sw = Math.floor(w), sh = Math.floor(h);
        if (sw <= 0 || sh <= 0) return;
        ctx.save();
        ctx.filter = `blur(${radius}px)`;
        const d = ctx.getImageData(x, y, sw, sh);
        const o = document.createElement("canvas");
        o.width = sw; o.height = sh;
        o.getContext("2d").putImageData(d, 0, 0);
        ctx.drawImage(o, x, y);
        ctx.restore();
      };

      const applyPixelate = (ctx, x, y, w, h, blockSize = 12) => {
        const sw = Math.floor(w), sh = Math.floor(h);
        if (sw <= 0 || sh <= 0) return;
        const imageData = ctx.getImageData(x, y, sw, sh);
        const { data, width, height } = imageData;
        for (let py = 0; py < height; py += blockSize) {
          for (let px = 0; px < width; px += blockSize) {
            const i = (py * width + px) * 4;
            const r = data[i], g = data[i+1], b = data[i+2], a = data[i+3];
            for (let fy = 0; fy < blockSize && py + fy < height; fy++) {
              for (let fx = 0; fx < blockSize && px + fx < width; fx++) {
                const j = ((py + fy) * width + (px + fx)) * 4;
                data[j] = r; data[j+1] = g; data[j+2] = b; data[j+3] = a;
              }
            }
          }
        }
        ctx.putImageData(imageData, x, y);
      };

      const drawArrowOnCanvas = (ctx, x1, y1, x2, y2, color = "#FF4757", size = 3, style = "classic") => {
        const dx = x2 - x1, dy = y2 - y1;
        const angle = Math.atan2(dy, dx);
        const len = Math.sqrt(dx*dx + dy*dy);
        if (len < 5) return;
        
        ctx.save();
        ctx.strokeStyle = color; ctx.fillStyle = color;
        ctx.lineJoin = "round"; ctx.lineCap = "round";
        
        // Use rounded coordinates to prevent "3D" sub-pixel blurring
        const rx1 = Math.round(x1), ry1 = Math.round(y1);
        const rx2 = Math.round(x2), ry2 = Math.round(y2);
        
        if (style === "elegant") {
          ctx.lineWidth = Math.max(2, size*0.8);
          const headLen = 20 + size * 3;
          const headAngle = Math.PI/10;
          
          // Shaft all the way to end
          ctx.beginPath(); ctx.moveTo(rx1, ry1); ctx.lineTo(rx2, ry2); ctx.stroke();
          
          // Sharp Pinch-Head (Keep filled but simplified)
          ctx.beginPath();
          ctx.moveTo(rx2, ry2);
          ctx.lineTo(rx2 - headLen * Math.cos(angle - headAngle), ry2 - headLen * Math.sin(angle - headAngle));
          ctx.lineTo(rx2 - headLen * 0.4 * Math.cos(angle), ry2 - headLen * 0.4 * Math.sin(angle));
          ctx.lineTo(rx2 - headLen * Math.cos(angle + headAngle), ry2 - headLen * Math.sin(angle + headAngle));
          ctx.closePath();
          ctx.fill();
        } else if (style === "bold") {
          ctx.lineWidth = size * 2.5 + 2;
          const headLen = 22 + size * 4;
          ctx.beginPath(); ctx.moveTo(rx1, ry1); ctx.lineTo(rx2, ry2); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(rx2, ry2);
          ctx.lineTo(rx2 - headLen * Math.cos(angle - Math.PI/6), ry2 - headLen * Math.sin(angle - Math.PI/6));
          ctx.lineTo(rx2 - headLen * Math.cos(angle + Math.PI/6), ry2 - headLen * Math.sin(angle + Math.PI/6));
          ctx.closePath(); ctx.fill();
        } else if (style === "dashed") {
          ctx.lineWidth = size + 1;
          const headLen = 16 + size * 2;
          const headAngle = Math.PI/7;
          ctx.setLineDash([size*4 + 4, size*2 + 2]);
          ctx.beginPath(); ctx.moveTo(rx1, ry1); ctx.lineTo(rx2, ry2); ctx.stroke();
          ctx.setLineDash([]);
          // Open "V" Head
          ctx.beginPath();
          ctx.moveTo(rx2 - headLen * Math.cos(angle - headAngle), ry2 - headLen * Math.sin(angle - headAngle));
          ctx.lineTo(rx2, ry2);
          ctx.lineTo(rx2 - headLen * Math.cos(angle + headAngle), ry2 - headLen * Math.sin(angle + headAngle));
          ctx.stroke();
        } else {
          // Classic "V" Arrow - Ultra Minimal
          ctx.lineWidth = size + 1;
          const headLen = 18 + size * 2.5;
          const headAngle = Math.PI/7;
          
          // 1. One clean shaft
          ctx.beginPath(); ctx.moveTo(rx1, ry1); ctx.lineTo(rx2, ry2); ctx.stroke();
          
          // 2. Open "V" head (no fill, no complex overlap)
          ctx.beginPath();
          ctx.moveTo(rx2 - headLen * Math.cos(angle - headAngle), ry2 - headLen * Math.sin(angle - headAngle));
          ctx.lineTo(rx2, ry2);
          ctx.lineTo(rx2 - headLen * Math.cos(angle + headAngle), ry2 - headLen * Math.sin(angle + headAngle));
          ctx.stroke();
        }
        ctx.restore();
      };

      // Keep cropSelRef in sync so getCropHandleAtPos always sees current value
      const setCrop = (val) => {
        cropSelRef.current = val;
        setCropSelection(val);
      };

      // ── Crop handle hit-test — uses ref, never stale ──────────────────────────
      const HANDLE_R = 10; // hit radius in screen px (generous for usability)
      const getCropHandleAtPos = (clientX, clientY) => {
        const sel = cropSelRef.current;
        if (!sel || !canvasRef.current) return null;
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const scaleX = rect.width / canvas.width;
        const scaleY = rect.height / canvas.height;
        const ox = sel.x * scaleX + rect.left;
        const oy = sel.y * scaleY + rect.top;
        const ow = sel.w * scaleX;
        const oh = sel.h * scaleY;
        const handles = {
          nw:[ox,oy],        n:[ox+ow/2,oy],        ne:[ox+ow,oy],
          w:[ox,oy+oh/2],                             e:[ox+ow,oy+oh/2],
          sw:[ox,oy+oh],     s:[ox+ow/2,oy+oh],     se:[ox+ow,oy+oh],
        };
        for (const [name,[hx,hy]] of Object.entries(handles)) {
          if (Math.abs(clientX-hx) <= HANDLE_R && Math.abs(clientY-hy) <= HANDLE_R) return name;
        }
        if (clientX>=ox && clientX<=ox+ow && clientY>=oy && clientY<=oy+oh) return 'move';
        return null;
      };

      const getResizeHandleAtPos = (clientX, clientY) => {
        if (tool !== "resize" || !canvasRef.current || imageDimensions.w === 0) return null;
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const handles = {
          nw: [rect.left, rect.top],
          ne: [rect.right, rect.top],
          sw: [rect.left, rect.bottom],
          se: [rect.right, rect.bottom],
        };
        for (const [name, [hx, hy]] of Object.entries(handles)) {
          if (Math.abs(clientX - hx) <= HANDLE_R && Math.abs(clientY - hy) <= HANDLE_R) return name;
        }
        return null;
      };

      const handleMouseDown = (e) => {
        if (!image) return;
        if (e.target.setPointerCapture) e.target.setPointerCapture(e.pointerId);
        const pos = getPos(e);
        setStartPos(pos);
        setIsDrawing(true);

        if (tool === "select") {
          const handle = getLayerHandleAtPos(pos);
          if (handle) {
            saveHistory();
            setResizeHandle(handle);
            const l = layers.find(x => x.id === selectedLayerId);
            const startLayer = { ...l, _bounds: getLayerBounds(l) };
            setLayerStartPos(startLayer);
            layerStartRef.current = startLayer;
            layerTransformActiveRef.current = true;
          } else {
            const hit = findLayerAtPos(pos);
            if (hit) {
              saveHistory();
              setSelectedLayerId(hit.id);
              const startLayer = { ...hit, _bounds: getLayerBounds(hit) };
              setLayerStartPos(startLayer);
              layerStartRef.current = startLayer;
              layerTransformActiveRef.current = true;
              setResizeHandle(null);
            } else {
              setSelectedLayerId(null);
              setIsDrawing(false);
              layerStartRef.current = null;
              layerTransformActiveRef.current = false;
            }
          }
          return;
        }

        if (tool === "text") { 
          if (showTextBox) {
            // Commit existing text, then immediately open new input at new position
            commitText();
            saveHistory();
            setTextPos(pos);
            setShowTextBox(true);
            setIsDrawing(false);
            return;
          }
          saveHistory();
          setTextPos(pos); 
          setShowTextBox(true); 
          setIsDrawing(false); 
          return; 
        }
        
        if (tool === "arrow") { 
          setArrowStart(pos); 
          return; 
        }

        if (tool === "crop") {
          const handle = getCropHandleAtPos(e.clientX, e.clientY);
          if (handle && cropSelRef.current) {
            cropDragRef.current = { mode: handle, startX: e.clientX, startY: e.clientY, origCrop: { ...cropSelRef.current } };
          } else {
            setCrop(null);
            cropDragRef.current = null;
          }
          return;
        }

        if (tool === "resize") {
          const handle = getResizeHandleAtPos(e.clientX, e.clientY);
          if (handle) {
            const rect = canvasRef.current.getBoundingClientRect();
            resizeDragRef.current = {
              handle,
              startX: e.clientX,
              startY: e.clientY,
              origW: parseInt(resizeDims.w) || imageDimensions.w,
              origH: parseInt(resizeDims.h) || imageDimensions.h,
              scaleX: resizePreviewScale || (rect.width / imageDimensions.w),
              scaleY: resizePreviewScale || (rect.height / imageDimensions.h),
            };
          } else {
            setIsDrawing(false);
          }
          return;
        }
        
        if (tool === "draw") {
          lastDrawPos.current = pos;
          setPreviewLayer({ id: "pw", type: "draw", points: [pos], color: drawColor, size: brushSize });
        }
      };
      
      const getLayerHandleAtPos = (pos) => {
        if (!selectedLayerId || tool !== "select") return null;
        const l = layers.find(x => x.id === selectedLayerId);
        if (!l) return null;
        return getBoundsHandle(getLayerBounds(l), pos);
      };

      const findLayerAtPos = (pos) => {
        // Search from top to bottom
        for (let i = layers.length - 1; i >= 0; i--) {
          const l = layers[i];
          if (l.type === "redact" || l.type === "blur" || l.type === "pixelate") {
            if (pos.x >= l.x && pos.x <= l.x + l.w && pos.y >= l.y && pos.y <= l.y + l.h) return l;
          } else if (l.type === "text") {
            const ctx = canvasRef.current.getContext("2d");
            ctx.font = `bold ${l.fontSize}px Inter`;
            const m = ctx.measureText(l.text);
            const th = l.fontSize;
            if (pos.x >= l.x && pos.x <= l.x + m.width && pos.y >= l.y - th && pos.y <= l.y) return l;
          } else if (l.type === "arrow") {
            const dist = distToSegment(pos, { x: l.x1, y: l.y1 }, { x: l.x2, y: l.y2 });
            if (dist < 20) return l;
          } else if (l.type === "draw") {
            const b = getLayerBounds(l);
            if (b && pos.x >= b.x && pos.x <= b.x + b.w && pos.y >= b.y && pos.y <= b.y + b.h) return l;
          } else if (l.type === "image") {
            if (pos.x >= l.x && pos.x <= l.x + l.w && pos.y >= l.y && pos.y <= l.y + l.h) return l;
          }
        }
        return null;
      };

      const distToSegment = (p, v, w) => {
        const l2 = (v.x - w.x)**2 + (v.y - w.y)**2;
        if (l2 === 0) return Math.sqrt((p.x - v.x)**2 + (p.y - v.y)**2);
        let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
        t = Math.max(0, Math.min(1, t));
        return Math.sqrt((p.x - (v.x + t * (w.x - v.x)))**2 + (p.y - (v.y + t * (w.y - v.y)))**2);
      };

      const handleMouseMove = (e) => {
        if (!image) return;
        const pos = getPos(e);

        // Update cursors when NOT drawing
        if (!isDrawing) {
          if (tool === "select") {
            const handle = getLayerHandleAtPos(pos);
            const cursorMap = { nw:'nw-resize', n:'n-resize', ne:'ne-resize', w:'w-resize', e:'e-resize', sw:'sw-resize', s:'s-resize', se:'se-resize', p1:'move', p2:'move' };
            canvasRef.current.style.cursor = handle ? cursorMap[handle] : findLayerAtPos(pos) ? "move" : "default";
          }
          if (tool === "crop" && cropSelRef.current) {
             const h = getCropHandleAtPos(e.clientX, e.clientY);
             const cursorMap = { nw:'nw-resize',n:'n-resize',ne:'ne-resize',w:'w-resize',e:'e-resize',sw:'sw-resize',s:'s-resize',se:'se-resize',move:'move' };
             canvasRef.current.style.cursor = cursorMap[h] || 'crosshair';
          }
          if (tool === "resize") {
            const h = getResizeHandleAtPos(e.clientX, e.clientY);
            const cursorMap = { nw:'nw-resize', ne:'ne-resize', sw:'sw-resize', se:'se-resize' };
            canvasRef.current.style.cursor = cursorMap[h] || 'default';
          }
          return;
        }

        // --- DRAWING / DRAGGING LOGIC ---
        if (tool === "select" && selectedLayerId) {
          const startLayer = layerStartRef.current;
          if (!startLayer) return;
          const dx = pos.x - startPos.x;
          const dy = pos.y - startPos.y;
          setLayers(prev => prev.map(l => {
            if (l.id === selectedLayerId) {
              if (resizeHandle) {
                const from = startLayer._bounds || getLayerBounds(startLayer);
                if (!from) return l;
                const dx = pos.x - startPos.x;
                const dy = pos.y - startPos.y;
                let to = { ...from };
                if (resizeHandle.includes("w")) { to.x = from.x + dx; to.w = from.w - dx; }
                if (resizeHandle.includes("e")) { to.w = from.w + dx; }
                if (resizeHandle.includes("n")) { to.y = from.y + dy; to.h = from.h - dy; }
                if (resizeHandle.includes("s")) { to.h = from.h + dy; }
                if (to.w < 10) {
                  if (resizeHandle.includes("w")) to.x = from.x + from.w - 10;
                  to.w = 10;
                }
                if (to.h < 10) {
                  if (resizeHandle.includes("n")) to.y = from.y + from.h - 10;
                  to.h = 10;
                }
                if (e.shiftKey || resizeHandle.length === 2) {
                  const ratio = from.w / Math.max(1, from.h);
                  if (to.w / Math.max(1, to.h) > ratio) to.w = to.h * ratio;
                  else to.h = to.w / ratio;
                  if (resizeHandle.includes("w")) to.x = from.x + from.w - to.w;
                  if (resizeHandle.includes("n")) to.y = from.y + from.h - to.h;
                }
                return transformLayerToBounds(startLayer, from, to);
              }
              // Normal move
              if (l.type === "arrow") {
                return { ...l, x1: startLayer.x1 + dx, y1: startLayer.y1 + dy, x2: startLayer.x2 + dx, y2: startLayer.y2 + dy };
              }
              if (l.type === "draw" && startLayer.points) {
                return { ...l, points: startLayer.points.map(p => ({ x: p.x + dx, y: p.y + dy })) };
              }
              return { ...l, x: startLayer.x + dx, y: startLayer.y + dy };
            }
            return l;
          }));
          return;
        }

        if (tool === "draw") {
          setPreviewLayer(prev => ({ ...prev, points: [...prev.points, pos] }));
          lastDrawPos.current = pos;
          return;
        }

        if (["redact","blur","pixelate"].includes(tool)) {
          const x = Math.floor(Math.min(startPos.x, pos.x)), y = Math.floor(Math.min(startPos.y, pos.y));
          const w = Math.floor(Math.abs(pos.x - startPos.x)), h = Math.floor(Math.abs(pos.y - startPos.y));
          if (w > 0 && h > 0) {
            setPreviewLayer({ id: "pw", type: tool, x, y, w, h, color: redactColor, radius: brushSize });
          } else {
            setPreviewLayer(null);
          }
        }

        if (tool === "arrow") {
          setPreviewLayer({ id: "pw", type: "arrow", x1: startPos.x, y1: startPos.y, x2: pos.x, y2: pos.y, color: drawColor, size: brushSize/8+2, style: arrowStyle });
        }

        if (tool === "crop") {
          const canvas = canvasRef.current;
          const rect = canvas.getBoundingClientRect();
          if (cropDragRef.current) {
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            const dx = (e.clientX - cropDragRef.current.startX) * scaleX;
            const dy = (e.clientY - cropDragRef.current.startY) * scaleY;
            const o = cropDragRef.current.origCrop;
            const mode = cropDragRef.current.mode;
            const MIN = 10;
            let {x, y, w, h} = o;
            if (mode === 'move') {
              x = Math.max(0, Math.min(canvas.width - w, o.x + dx));
              y = Math.max(0, Math.min(canvas.height - h, o.y + dy));
            } else {
              if (mode.includes('e')) w = Math.max(MIN, Math.min(canvas.width - o.x, o.w + dx));
              if (mode.includes('w')) { const nx = Math.max(0, Math.min(o.x + o.w - MIN, o.x + dx)); x = nx; w = o.x + o.w - nx; }
              if (mode.includes('s')) h = Math.max(MIN, Math.min(canvas.height - o.y, o.h + dy));
              if (mode.includes('n')) { const ny = Math.max(0, Math.min(o.y + o.h - MIN, o.y + dy)); y = ny; h = o.y + o.h - ny; }
            }
            setCrop({ x:Math.round(x), y:Math.round(y), w:Math.round(w), h:Math.round(h) });
          } else {
            const x = Math.floor(Math.min(startPos.x, pos.x));
            const y = Math.floor(Math.min(startPos.y, pos.y));
            const w = Math.floor(Math.abs(pos.x - startPos.x));
            const h = Math.floor(Math.abs(pos.y - startPos.y));
            if (w > 2 && h > 2) setCrop({ x, y, w, h });
          }
          return;
        }

        if (tool === "resize" && resizeDragRef.current) {
          const drag = resizeDragRef.current;
          const dx = (e.clientX - drag.startX) / drag.scaleX;
          const dy = (e.clientY - drag.startY) / drag.scaleY;
          let w = drag.origW;
          let h = drag.origH;
          if (drag.handle.includes("e")) w = drag.origW + dx;
          if (drag.handle.includes("w")) w = drag.origW - dx;
          if (drag.handle.includes("s")) h = drag.origH + dy;
          if (drag.handle.includes("n")) h = drag.origH - dy;
          w = Math.max(2, Math.round(w));
          h = Math.max(2, Math.round(h));
          if (aspectLock) {
            const ratio = drag.origW / drag.origH;
            if (Math.abs(w - drag.origW) >= Math.abs(h - drag.origH)) h = Math.max(2, Math.round(w / ratio));
            else w = Math.max(2, Math.round(h * ratio));
          }
          setResizeDims({ w, h });
          return;
        }

        // Overlay for other rect tools
        if (["redact","blur","pixelate"].includes(tool) && overlayRef.current) {
          const canvas = canvasRef.current;
          const rect = canvas.getBoundingClientRect();
          const scaleX = rect.width / canvas.width;
          const scaleY = rect.height / canvas.height;
          const x = Math.min(startPos.x, pos.x);
          const y = Math.min(startPos.y, pos.y);
          const w = Math.abs(pos.x - startPos.x);
          const h = Math.abs(pos.y - startPos.y);
          const containerRect = canvas.parentElement.getBoundingClientRect();
          overlayRef.current.style.left = (x * scaleX + rect.left - containerRect.left) + "px";
          overlayRef.current.style.top  = (y * scaleY + rect.top  - containerRect.top)  + "px";
          overlayRef.current.style.width  = (w * scaleX) + "px";
          overlayRef.current.style.height = (h * scaleY) + "px";
          overlayRef.current.style.display = "block";
        }
      };

      const handleMouseUp = (e) => {
        if (e.target && e.target.releasePointerCapture && e.pointerId) {
          try { e.target.releasePointerCapture(e.pointerId); } catch(err) {}
        }
        if (!image) { setIsDrawing(false); return; }
        if (overlayRef.current) overlayRef.current.style.display = "none";
        
        if (tool === "select") {
          setIsDrawing(false);
          setResizeHandle(null);
          setLayerStartPos(null);
          if (layerTransformActiveRef.current) status("Transform applied");
          layerStartRef.current = null;
          layerTransformActiveRef.current = false;
          return;
        }

        if (tool === "crop") {
          cropDragRef.current = null;
          if (cropSelRef.current && cropSelRef.current.w > 10 && cropSelRef.current.h > 10) {
            status("⊡ Drag handles to resize · drag inside to move · Apply to crop", 0);
          } else {
            setCrop(null);
          }
          setIsDrawing(false);
          return;
        }

        if (tool === "resize") {
          resizeDragRef.current = null;
          setIsDrawing(false);
          status("⤡ Resize preview updated · Apply Resize to commit", 0);
          return;
        }

        if (!isDrawing) { setIsDrawing(false); return; }
        
        if (previewLayer) {
          saveHistory();
          setLayers(prev => [...prev, { ...previewLayer, id: Date.now() }]);
          setPreviewLayer(null);
          status(`+ Layer added: ${tool.charAt(0).toUpperCase() + tool.slice(1)}`);
        }
        setIsDrawing(false);
      };

      const cancelText = () => {
        setHistory(h => h.slice(0, -1));
        setTextInput(""); setShowTextBox(false); setTextPos(null);
      };

      const commitText = () => {
        if (!textInput.trim() || !textPos) { cancelText(); return; }
        const newLayer = {
          id: Date.now(),
          type: "text",
          x: textPos.x,
          y: textPos.y,
          text: textInput,
          color: drawColor,
          fontSize: fontSize,
          fontFamily: fontFamily,
          bgEnabled: textBgEnabled,
          bgColor: textBgColor,
          bgOpacity: textBgOpacity,
        };
        setLayers(prev => [...prev, newLayer]);
        setTextInput(""); setShowTextBox(false); setTextPos(null);
        status("T Text added as layer");
      };

      const exportImage = (format = "png", sanitize = false) => {
        renderAll(true);
        const canvas = canvasRef.current;
        const link = document.createElement("a");
        link.download = sanitize ? `bimp-sanitized.${format}` : `bimp-export.${format}`;
        const mimeMap = { png:"image/png", jpg:"image/jpeg", jpeg:"image/jpeg", webp:"image/webp", bmp:"image/bmp" };
        const mime = mimeMap[format] || "image/png";
        const quality = (format === "jpg" || format === "jpeg" || format === "webp") ? 0.95 : undefined;
        link.href = canvas.toDataURL(mime, quality);
        link.click();
        renderAll(false);
        if (sanitize) {
          status("🛡 Exported — metadata stripped");
          setShowSanitizeBadge(true);
          setTimeout(() => setShowSanitizeBadge(false), 4000);
        } else {
          status(`⬇ Saved as ${format.toUpperCase()}`);
        }
      };

      const copyToClipboard = async () => {
        renderAll(true);
        const canvas = canvasRef.current;
        canvas.toBlob(async (blob) => {
          try {
            await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
            status("📋 Copied to clipboard");
            renderAll(false);
          } catch { 
            status("Export PNG instead — clipboard blocked");
            renderAll(false);
          }
        });
      };

      const applyCrop = (e) => {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        const sel = cropSelRef.current;
        if (!sel || sel.w < 2 || sel.h < 2) { status("No crop selection"); return; }
        const { x, y, w, h } = sel;
        const canvas = canvasRef.current;
        
        const cx = Math.max(0, Math.round(x));
        const cy = Math.max(0, Math.round(y));
        const cw = Math.min(Math.round(w), canvas.width - cx);
        const ch = Math.min(Math.round(h), canvas.height - cy);
        if (cw < 2 || ch < 2) { status("Crop area too small"); return; }
        
        saveHistory();

        // 1. Crop Base Image
        const off = document.createElement("canvas");
        off.width = cw; off.height = ch;
        const offCtx = off.getContext("2d");
        offCtx.drawImage(baseImage, cx, cy, cw, ch, 0, 0, cw, ch);
        const newSrc = off.toDataURL();
        const newImg = new Image();
        newImg.src = newSrc;
        newImg.onload = () => {
          setBaseImage(newImg);
          setSourceImage(newImg); // Sync source on crop
          setImage(newSrc);
          
          // 2. Shift all layers
          setLayers(prev => prev.map(l => {
            if (l.type === "arrow") return { ...l, x1: l.x1 - cx, y1: l.y1 - cy, x2: l.x2 - cx, y2: l.y2 - cy };
            if (l.type === "draw") return { ...l, points: l.points.map(p => ({ x: p.x - cx, y: p.y - cy })) };
            return { ...l, x: l.x - cx, y: l.y - cy };
          }));

          canvas.width = cw; canvas.height = ch;
          setImageDimensions({ w: cw, h: ch });
          setResizeDims({ w: cw, h: ch });
          setCrop(null);
          status("⊡ Cropped (Layers Shifted) ✓");
        };
      };

      const handleResizeChange = (field, val) => {
        const num = parseInt(val) || 0;
        if (field === "w") {
          if (aspectLock && imageDimensions.w > 0) setResizeDims({ w: val, h: Math.round((num / imageDimensions.w) * imageDimensions.h) });
          else setResizeDims(d => ({ ...d, w: val }));
        } else {
          if (aspectLock && imageDimensions.h > 0) setResizeDims({ h: val, w: Math.round((num / imageDimensions.h) * imageDimensions.w) });
          else setResizeDims(d => ({ ...d, h: val }));
        }
      };

      const applyResize = () => {
        const w = parseInt(resizeDims.w);
        const h = parseInt(resizeDims.h);
        if (isNaN(w) || isNaN(h) || w < 2 || h < 2) { status("Invalid resize dimensions"); return; }

        const sw = w / imageDimensions.w;
        const sh = h / imageDimensions.h;

        saveHistory();

        const off = document.createElement("canvas");
        off.width = w; off.height = h;
        const offCtx = off.getContext("2d");
        offCtx.drawImage(baseImage, 0, 0, resizeMode === "scale" ? w : imageDimensions.w, resizeMode === "scale" ? h : imageDimensions.h);
        const newSrc = off.toDataURL();
        const newImg = new Image();
        newImg.src = newSrc;
        newImg.onload = () => {
          setBaseImage(newImg);
          setSourceImage(newImg);
          setImage(newSrc);

          if (resizeMode === "scale") {
            setLayers(prev => prev.map(l => {
              if (l.type === "arrow") {
                return { ...l, x1: l.x1 * sw, y1: l.y1 * sh, x2: l.x2 * sw, y2: l.y2 * sh, size: l.size * sw };
              }
              if (l.type === "draw") {
                return { ...l, points: l.points.map(p => ({ x: p.x * sw, y: p.y * sh })), size: (l.size || 5) * sw };
              }
              if (l.type === "text") {
                return { ...l, x: l.x * sw, y: l.y * sh, fontSize: l.fontSize * sw };
              }
              return { ...l, x: l.x * sw, y: l.y * sh, w: l.w * sw, h: l.h * sh, radius: (l.radius || 10) * sw };
            }));
          }

          const canvas = canvasRef.current;
          canvas.width = w; canvas.height = h;
          setImageDimensions({ w, h });
          setResizePreviewScale(null);
          status(resizeMode === "scale" ? `⤡ Resized image + layers to ${w}×${h}px` : `⤡ Canvas resized to ${w}×${h}px`);
          selectTool("select"); 
        };
      };

      const cancelCrop = () => {
        setCrop(null);
        status("Crop cancelled");
      };

      // Close social dropdown when clicking outside
      useEffect(() => {
        const handler = (e) => {
          if (socialRef.current && !socialRef.current.contains(e.target)) setSocialOpen(false);
          if (saveAsRef.current && !saveAsRef.current.contains(e.target)) setSaveAsOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
      }, []);

      const createSocialCanvas = (preset) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        // Scale to fit screen
        const maxW = window.innerWidth - 300;
        const maxH = window.innerHeight - 130;
        let displayW = preset.w, displayH = preset.h;
        if (displayW > maxW) { displayH = displayH * maxW / displayW; displayW = maxW; }
        if (displayH > maxH) { displayW = displayW * maxH / displayH; displayH = maxH; }
        displayW = Math.round(displayW); displayH = Math.round(displayH);
        canvas.width = displayW; canvas.height = displayH;
        // Fill with a nice gradient background
        const grad = ctx.createLinearGradient(0, 0, displayW, displayH);
        grad.addColorStop(0, "#1A1A2E"); grad.addColorStop(1, "#16213E");
        ctx.fillStyle = grad; ctx.fillRect(0, 0, displayW, displayH);
        // Subtle grid dots
        ctx.fillStyle = "#FFFFFF08";
        for (let x = 40; x < displayW; x += 40) for (let y = 40; y < displayH; y += 40) { ctx.beginPath(); ctx.arc(x, y, 1, 0, Math.PI*2); ctx.fill(); }
        // Dashed border guide
        ctx.setLineDash([6, 4]); ctx.strokeStyle = "#FFFFFF15"; ctx.lineWidth = 1;
        ctx.strokeRect(20, 20, displayW - 40, displayH - 40); ctx.setLineDash([]);
        // Label in center
        ctx.fillStyle = "#FFFFFF22";
        ctx.font = `bold ${Math.min(18, displayW/20)}px Inter, sans-serif`;
        ctx.textAlign = "center";
        ctx.fillText(`${preset.label} — ${preset.w}×${preset.h}px`, displayW/2, displayH/2);
        ctx.textAlign = "left";
        setImageDimensions({ w: displayW, h: displayH });
        setResizeDims({ w: displayW, h: displayH });
        setIsFit(true);
        
        // Convert static social canvas to an image object for mockup/edit support
        const newSrc = canvas.toDataURL();
        const newImg = new Image();
        newImg.src = newSrc;
        newImg.onload = () => {
          setBaseImage(newImg);
          setSourceImage(newImg);
          setImage(newSrc);
        };

        setShowDropZone(false);
        setHistory([]);
        setSocialOpen(false);
        setActiveSocial(null);
        status(`✓ ${preset.label} canvas: ${preset.w}×${preset.h}px`, 3000);
      };

      // Clear crop selection when switching away from crop tool
      const selectTool = (t) => {
        if (layerTransformActiveRef.current) {
          setIsDrawing(false);
          setResizeHandle(null);
          setLayerStartPos(null);
          layerStartRef.current = null;
          layerTransformActiveRef.current = false;
          status("Transform applied");
        }
        if (t !== "crop" && cropSelRef.current) setCrop(null);
        if (t === "resize" && canvasRef.current && imageDimensions.w > 0) {
          const rect = canvasRef.current.getBoundingClientRect();
          setResizePreviewScale(rect.width / imageDimensions.w);
        } else if (t !== "resize") {
          setResizePreviewScale(null);
          resizeDragRef.current = null;
        }
        setTool(t);
      };

      const getCursor = () => {
        if (tool === "draw") return "crosshair";
        if (tool === "text") return "text";
        if (tool === "select") return "default";
        return "crosshair";
      };

      const editingLayer = tool === "select" ? layers.find(l => l.id === selectedLayerId) : null;
      const resizeScale = tool === "resize" && resizePreviewScale ? resizePreviewScale : null;
      const resizePreviewW = parseInt(resizeDims.w) || imageDimensions.w;
      const resizePreviewH = parseInt(resizeDims.h) || imageDimensions.h;
      const canvasDisplayW = resizeScale ? resizePreviewW * resizeScale : imageDimensions.w * (customZoom / 100);
      const canvasDisplayH = resizeScale ? resizePreviewH * resizeScale : imageDimensions.h * (customZoom / 100);

      return React.createElement("div", {
        style: { display: "flex", flexDirection: "column", height: "100vh", background: BRAND.bg, color: BRAND.text, fontFamily: "'Inter', sans-serif", overflow: "hidden" }
      },
        // Top bar
        React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", height: "52px", background: BRAND.surface, borderBottom: `1px solid ${BRAND.border}`, flexShrink: 0 } },
          React.createElement("div", { 
            onClick: enableDevMode,
            style: { display: "flex", alignItems: "center", gap: 10, cursor: "pointer", userSelect: "none" } 
          },
            React.createElement("img", { src: "logo.png", alt: "bimp.us", style: { height: 32, width: "auto", objectFit: "contain", mixBlendMode: "screen" } }),
            React.createElement("span", { style: { fontSize: 10, fontWeight: 700, color: "#000", background: "#FFF", borderRadius: 4, padding: "2px 6px", letterSpacing: 0.5 } }, "BETA")
          ),
          React.createElement("div", { style: { fontSize: 13, color: statusMsg.includes("✓") || statusMsg.includes("⬇") || statusMsg.includes("🛡") ? BRAND.success : BRAND.textMuted } }, statusMsg),
          showSanitizeBadge && React.createElement("div", {
            role: "status",
            "aria-live": "polite",
            style: { fontSize: 12, fontWeight: 700, color: BRAND.success, background: `${BRAND.success}18`, border: `1px solid ${BRAND.success}`, borderRadius: 6, padding: "3px 10px", display: "inline-flex", alignItems: "center", gap: 5 }
          }, "🛡 Sanitized — no metadata"),
          React.createElement("div", { style: { display: "flex", gap: 8, alignItems: "center" } },
            // ── Auth / Credits ──
            user ? React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6 } },
              // Credits badge
              React.createElement("div", {
                onClick: () => { setAuthModalOpen(true); setActiveTab("credits"); },
                style: { display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 7, border: `1px solid ${BRAND.border}`, cursor: "pointer", fontSize: 12, color: user.credits > 0 ? BRAND.success : BRAND.danger, background: "transparent" },
                title: `${user.credits} credits remaining`
              },
                React.createElement("span", null, "⚡"),
                `${user.credits} credits`
              ),
              // User menu
              React.createElement("div", {
                onClick: () => { setAuthModalOpen(true); setActiveTab(user.byok_unlocked ? "byok" : "credits"); },
                style: { display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 7, border: `1px solid ${user.is_pro ? "#FFD700" : BRAND.border}`, cursor: "pointer", fontSize: 12, color: user.is_pro ? "#FFD700" : BRAND.textMuted, background: user.is_pro ? "rgba(255,215,0,0.08)" : "transparent" },
                title: user.email
              },
                React.createElement("span", null, user.is_pro ? "💎" : "👤"),
                user.is_pro ? "Pro" : user.email.split("@")[0]
              )
            ) : React.createElement("button", {
              onClick: () => { setAuthModalOpen(true); setActiveTab("login"); setAuthSent(false); },
              style: { padding: "6px 12px", borderRadius: 7, fontSize: 12, fontWeight: 700, cursor: "pointer", border: "1px solid #FFD700", background: "#FFD700", color: "#000", transition: "all 0.15s", display: "flex", alignItems: "center", gap: 6 }
            },
              React.createElement("span", { style: { fontSize: 14 } }, "💎"),
              "Sign in / Upgrade"
            ),
            // ── Smart Redact ──
            React.createElement("div", { 
              onClick: handleAutoRedact,
              style: { ...btnStyle(BRAND), border: `1px solid ${BRAND.accent}`, background: isPro ? "rgba(255,215,0,0.1)" : "transparent", cursor: "pointer", position: "relative" } 
            },
              React.createElement("span", { style: { fontSize: 14 } }, "🤖"),
              React.createElement("span", { style: { fontWeight: 700 } }, "Smart Redact"),
              !isPro && React.createElement("div", { style: { position: "absolute", top: -6, right: -6, background: "#FFD700", color: "#000", fontSize: 9, padding: "2px 4px", borderRadius: 4, fontStyle: "normal", fontWeight: 900 } }, "PRO")
            ),

            // ── Remove BG ──
            React.createElement("div", { 
              onClick: handleRemoveBackground,
              style: { ...btnStyle(BRAND), border: `1px solid ${BRAND.accent}`, background: isPro ? "rgba(255,215,0,0.1)" : "transparent", cursor: "pointer", position: "relative" } 
            },
              React.createElement("span", { style: { fontSize: 14 } }, "✂️"),
              React.createElement("span", { style: { fontWeight: 700 } }, "Remove BG"),
              !isPro && React.createElement("div", { style: { position: "absolute", top: -6, right: -6, background: "#FFD700", color: "#000", fontSize: 9, padding: "2px 4px", borderRadius: 4, fontStyle: "normal", fontWeight: 900 } }, "PRO")
            ),

            // ── Device Mockups ──
            React.createElement("div", { 
              onClick: () => {
                if (!isPro) setProModalOpen(true);
                else {
                  const types = ["browser", "phone", "terminal"];
                  const idx = types.indexOf(statusMsg.split(" ")[1]?.toLowerCase()) + 1;
                  applyMockup(types[idx % types.length]);
                }
              },
              style: { ...btnStyle(BRAND), border: `1px solid ${BRAND.accent}`, background: isPro ? "rgba(255,215,0,0.1)" : "transparent", cursor: "pointer", position: "relative" } 
            },
              React.createElement("span", { style: { fontSize: 14 } }, "💻"),
              React.createElement("span", { style: { fontWeight: 700 } }, "Mockup"),
              !isPro && React.createElement("div", { style: { position: "absolute", top: -6, right: -6, background: "#FFD700", color: "#000", fontSize: 9, padding: "2px 4px", borderRadius: 4, fontStyle: "normal", fontWeight: 900 } }, "PRO")
            ),

            // ── Batch Process ──
            fileQueue.length > 1 && React.createElement("div", { 
              onClick: runBatchProcess,
              style: { ...btnStyle(BRAND), border: `1px solid ${BRAND.success}`, background: "rgba(46,204,113,0.1)", marginBottom: 12, justifyContent: "center" } 
            },
              React.createElement("span", { style: { fontSize: 14 } }, "📦"),
              React.createElement("span", { style: { fontWeight: 700, color: BRAND.success } }, `Export All (${fileQueue.length})`),
            ),

            // ── Tools list ──
            React.createElement("div", { ref: socialRef, style: { position: "relative" } },
              React.createElement("button", {
                onClick: () => { setSocialOpen(o => !o); setActiveSocial(null); },
                style: { padding: "6px 12px", borderRadius: 7, fontSize: 12, fontWeight: 700, cursor: "pointer", border: `1px solid ${BRAND.border}`, background: socialOpen ? BRAND.accent : "transparent", color: socialOpen ? "#000" : BRAND.text, transition: "all 0.15s", display: "flex", alignItems: "center", gap: 6 }
              },
                React.createElement("span", { style: { fontSize: 14 } }, "📐"),
                "Social Canvas",
                React.createElement("span", { style: { fontSize: 10, opacity: 0.7 } }, socialOpen ? "▲" : "▼")
              ),

              // Dropdown panel
              socialOpen && React.createElement("div", {
                style: { position: "absolute", top: "calc(100% + 8px)", right: 0, background: "#12121F", border: `1px solid ${BRAND.border}`, borderRadius: 12, boxShadow: "0 16px 48px rgba(0,0,0,0.7)", zIndex: 200, minWidth: 220, overflow: "hidden" }
              },
                React.createElement("div", { style: { padding: "10px 14px 6px", fontSize: 11, color: BRAND.textMuted, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" } }, "Choose Platform"),
                SOCIALS.map(platform =>
                  React.createElement(React.Fragment, { key: platform.id },
                    // Platform row
                    React.createElement("div", {
                      onClick: () => setActiveSocial(activeSocial === platform.id ? null : platform.id),
                      style: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 14px", cursor: "pointer", background: activeSocial === platform.id ? platform.color + "18" : "transparent", borderLeft: activeSocial === platform.id ? `3px solid ${platform.color}` : "3px solid transparent", transition: "all 0.12s" }
                    },
                      React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10 } },
                        React.createElement("span", { style: { color: platform.color, display: "flex", alignItems: "center" } }, platform.icon),
                        React.createElement("span", { style: { fontSize: 13, fontWeight: 600, color: BRAND.text } }, platform.label)
                      ),
                      React.createElement("span", { style: { fontSize: 10, color: BRAND.textMuted } }, activeSocial === platform.id ? "▲" : "▶")
                    ),
                    // Size submenu
                    activeSocial === platform.id && React.createElement("div", { style: { background: "#0A0A14", borderTop: `1px solid ${BRAND.border}33`, borderBottom: `1px solid ${BRAND.border}33` } },
                      platform.sizes.map(size =>
                        React.createElement("div", {
                          key: size.label,
                          onClick: () => createSocialCanvas({ ...size, label: size.label }),
                          style: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 14px 8px 36px", cursor: "pointer", transition: "background 0.1s" },
                          onMouseEnter: e => e.currentTarget.style.background = platform.color + "18",
                          onMouseLeave: e => e.currentTarget.style.background = "transparent",
                        },
                          React.createElement("span", { style: { fontSize: 12, color: BRAND.text } }, size.label),
                          React.createElement("span", { style: { fontSize: 11, color: BRAND.textMuted, fontFamily: "monospace" } }, `${size.w}×${size.h}`)
                        )
                      )
                    )
                  )
                ),
                React.createElement("div", { style: { padding: "8px 14px 10px", fontSize: 11, color: BRAND.textMuted, borderTop: `1px solid ${BRAND.border}` } }, "Creates a blank canvas at exact size")
              )
            ),

            image && React.createElement(React.Fragment, null,
              React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, margin: "0 10px 0 0", background: "#12121F", padding: "4px 12px", borderRadius: 8, border: `1px solid ${BRAND.border}` } },
                React.createElement("input", { 
                  type: "range", min: 10, max: 400, 
                  value: displayZoom, 
                  onChange: e => { setIsFit(false); setCustomZoom(parseInt(e.target.value)); },
                  style: { width: 90, accentColor: BRAND.accent, cursor: "pointer" } 
                }),
                React.createElement("span", { 
                  style: { fontSize: 12, color: BRAND.text, fontWeight: 700, width: 38, cursor: "pointer", textAlign: "right", userSelect: "none" },
                  onClick: () => setIsFit(true),
                  title: "Click to auto fit"
                }, `${displayZoom}%`)
              ),
              React.createElement("button", { onClick: undo, disabled: history.length === 0, style: btnStyle(BRAND, history.length === 0), title: "Undo (Ctrl+Z)" }, "↩ Undo"),
              React.createElement("button", { onClick: copyToClipboard, style: btnStyle(BRAND) }, "📋 Copy"),
              React.createElement("label", {
                style: { display: "flex", alignItems: "center", gap: 6, cursor: "pointer", padding: "4px 10px", borderRadius: 7, border: `1px solid ${sanitizeMode ? BRAND.success : BRAND.border}`, background: sanitizeMode ? `${BRAND.success}18` : "transparent", fontSize: 12, color: sanitizeMode ? BRAND.success : BRAND.textMuted, transition: "all 0.15s", userSelect: "none", minWidth: 0 },
                title: "Strips EXIF, GPS, author, and all embedded metadata from the exported file",
              },
                React.createElement("input", {
                  type: "checkbox", checked: sanitizeMode,
                  "aria-label": "Sanitize export: strip all metadata",
                  "aria-checked": sanitizeMode,
                  onChange: () => {
                    const next = !sanitizeMode;
                    setSanitizeMode(next);
                    if (next && sanitizeFirstUse) {
                      status("🛡 Sanitize mode on — EXIF, GPS & author data will be stripped on export");
                      setSanitizeFirstUse(false);
                    }
                  },
                  style: { accentColor: BRAND.success, cursor: "pointer" }
                }),
                "🛡 Sanitize"
              ),
              React.createElement("button", { onClick: () => exportImage("png", sanitizeMode), title: sanitizeMode ? "This export will strip all metadata" : "Export as PNG", style: btnStyle(BRAND, false, true) }, "⬇ PNG"),
              React.createElement("button", { onClick: () => exportImage("jpg", sanitizeMode), title: sanitizeMode ? "This export will strip all metadata" : "Export as JPG", style: btnStyle(BRAND) }, "⬇ JPG"),
              // Save As dropdown
              React.createElement("div", { ref: saveAsRef, style: { position: "relative" } },
                React.createElement("button", {
                  onClick: () => setSaveAsOpen(o => !o),
                  style: { ...btnStyle(BRAND), gap: 4 }
                }, "⬇ More ▾"),
                saveAsOpen && React.createElement("div", {
                  style: { position: "absolute", top: "calc(100% + 6px)", right: 0, background: "#12121F", border: `1px solid ${BRAND.border}`, borderRadius: 10, boxShadow: "0 12px 32px rgba(0,0,0,0.6)", zIndex: 200, minWidth: 160, overflow: "hidden" }
                },
                  React.createElement("div", { style: { padding: "8px 12px 4px", fontSize: 10, color: BRAND.textMuted, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" } }, "Save As"),
                  [
                    { fmt: "webp", label: "WebP", note: "Best for web — smallest size" },
                    { fmt: "bmp",  label: "BMP",  note: "Uncompressed bitmap" },
                  ].map(({fmt, label, note}) =>
                    React.createElement("div", {
                      key: fmt,
                      onClick: () => { exportImage(fmt, sanitizeMode); setSaveAsOpen(false); },
                      style: { padding: "9px 14px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 },
                      onMouseEnter: e => e.currentTarget.style.background = BRAND.surfaceHover,
                      onMouseLeave: e => e.currentTarget.style.background = "transparent",
                    },
                      React.createElement("span", { style: { fontSize: 13, fontWeight: 600, color: BRAND.text } }, `⬇ ${label}`),
                      React.createElement("span", { style: { fontSize: 10, color: BRAND.textMuted } }, note)
                    )
                  )
                )
              ),
            ),
            React.createElement("button", { onClick: () => fileInputRef.current.click(), style: btnStyle(BRAND) }, "📁 Open"),
            React.createElement("input", { ref: fileInputRef, type: "file", accept: "image/*", style: { display: "none" }, onChange: handleFileInput })
          )
        ),

        // Body
        React.createElement("div", { style: { display: "flex", flex: 1, overflow: "hidden" } },

          // Left toolbar — wider to show labels
          React.createElement("div", { style: { width: 76, background: BRAND.surface, borderRight: `1px solid ${BRAND.border}`, display: "flex", flexDirection: "column", alignItems: "center", padding: "10px 0", gap: 2, flexShrink: 0, overflowY: "auto" } },
            TOOLS.map(t =>
              React.createElement("button", {
                key: t.id, onClick: () => selectTool(t.id), title: `${t.label} (${t.shortcut})`,
                "aria-label": t.label,
                style: { width: 64, borderRadius: 9, background: tool === t.id ? toolColors[t.id] + "22" : "transparent", border: tool === t.id ? `1.5px solid ${toolColors[t.id]}` : `1.5px solid transparent`, color: tool === t.id ? toolColors[t.id] : BRAND.textMuted, cursor: "pointer", transition: "all 0.15s", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "6px 0", gap: 2 }
              },
                React.createElement("span", { style: { fontSize: t.id === "text" ? 15 : 18, fontWeight: t.id === "text" ? 900 : 400, lineHeight: 1 } }, t.icon),
                React.createElement("span", { style: { fontSize: 9, fontWeight: 600, letterSpacing: 0.2, opacity: tool === t.id ? 1 : 0.7 } }, t.label)
              )
            ),
            React.createElement("div", { style: { flex: 1 } }),
            // Divider
            React.createElement("div", { style: { width: 44, height: 1, background: BRAND.border, margin: "6px 0" } }),
            
            // Arrow styles (only active if tool is arrow)
            tool === "arrow" && React.createElement("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", gap: 4, paddingBottom: 6, width: "100%" } },
              React.createElement("span", { style: { fontSize: 8, color: BRAND.textMuted, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase" } }, "Style"),
              React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3, width: "100%", padding: "0 6px" } },
                [{id:"classic",icon:"↗"}, {id:"elegant",icon:"⤤"}, {id:"dashed",icon:"⤏"}, {id:"bold",icon:"➔"}].map(s =>
                  React.createElement("div", {
                    key: s.id, onClick: () => setArrowStyle(s.id), title: s.id.charAt(0).toUpperCase() + s.id.slice(1),
                    style: { height: 26, borderRadius: 6, background: arrowStyle === s.id ? BRAND.accent+"33" : "transparent", border: arrowStyle === s.id ? `1px solid ${BRAND.accent}` : `1px solid ${BRAND.border}`, color: arrowStyle === s.id ? BRAND.accent : BRAND.textMuted, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, transition: "all 0.1s" }
                  }, s.icon)
                )
              )
            ),
            tool === "arrow" && React.createElement("div", { style: { width: 44, height: 1, background: BRAND.border, margin: "0 0 6px 0" } }),
            
            // Color presets
            React.createElement("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", gap: 4, paddingBottom: 6 } },
              React.createElement("span", { style: { fontSize: 8, color: BRAND.textMuted, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase" } }, "Color"),
              React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 3 } },
                COLOR_PRESETS.map(c =>
                  React.createElement("div", {
                    key: c, onClick: () => setDrawColor(c),
                    style: { width: 16, height: 16, borderRadius: 4, background: c, border: drawColor === c ? `2px solid white` : c === "#FFFFFF" ? `1px solid ${BRAND.border}` : "2px solid transparent", cursor: "pointer", transition: "transform 0.1s", transform: drawColor === c ? "scale(1.25)" : "scale(1)" }
                  })
                )
              ),
              // Custom color picker dot
              React.createElement("div", { style: { width: 28, height: 28, borderRadius: "50%", background: `conic-gradient(red, yellow, lime, cyan, blue, magenta, red)`, border: `2px solid ${BRAND.border}`, cursor: "pointer", position: "relative", overflow: "hidden", marginTop: 2 }, title: "Custom color" },
                React.createElement("input", { type: "color", value: drawColor, onChange: e => setDrawColor(e.target.value), style: { position: "absolute", inset: 0, opacity: 0, cursor: "pointer", width: "100%", height: "100%" } })
              )
            ),
            
            // ── Carbon Ads Placement ──
            !isPro && React.createElement("div", { id: "carbon-ads-container", style: { width: "100%", marginTop: "auto", padding: "10px 0", borderTop: `1px solid ${BRAND.border}` } },
              React.createElement("div", { id: "carbonads" }, 
                React.createElement("span", { style: { fontSize: 10, color: BRAND.textMuted, opacity: 0.5 } }, "Ad support bimp.us")
              )
            )
          ),

          // Canvas area — canvas is ALWAYS in the DOM so canvasRef is always valid
          React.createElement("div", {
            style: { flex: 1, overflow: "auto", position: "relative", background: showDropZone ? BRAND.bg : "repeating-conic-gradient(#1A1A2E 0% 25%, #0F0F1A 0% 50%) 0 0 / 20px 20px" },
            onDrop: handleDrop, onDragOver: e => e.preventDefault()
          },
            // Drop zone overlay — sits on top when no image loaded
            showDropZone && React.createElement("div", {
              style: { position: "absolute", inset: 0, zIndex: 10, display: "flex", alignItems: "center", justifyContent: "center", background: BRAND.bg, cursor: "pointer" },
              onClick: () => fileInputRef.current.click()
            },
              React.createElement("div", { style: { textAlign: "center", padding: 48, border: `2px dashed ${BRAND.border}`, borderRadius: 20, maxWidth: 420 } },
                React.createElement("div", { style: { fontSize: 52, marginBottom: 16 } }, "🖼"),
                React.createElement("div", { style: { fontSize: 20, fontWeight: 700, marginBottom: 8 } }, "Drop image here"),
                React.createElement("div", { style: { color: BRAND.textMuted, fontSize: 14, lineHeight: 1.7 } },
                  "Press ", React.createElement("kbd", { style: { background: "#2E2E4A", border: "1px solid #4A4A6A", borderRadius: 4, padding: "1px 6px", fontSize: 12 } }, "Ctrl+V"),
                  " to paste from clipboard", React.createElement("br"), "or click to open a file"
                ),
                React.createElement("div", { style: { marginTop: 20, display: "flex", gap: 6, justifyContent: "center" } },
                  ["PNG","JPG","WebP","GIF"].map(f => React.createElement("span", { key: f, style: { fontSize: 11, color: BRAND.textMuted, background: BRAND.surface, padding: "3px 8px", borderRadius: 4, border: `1px solid ${BRAND.border}` } }, f))
                )
              )
            ),
            // Canvas wrapper — always rendered, hidden until image loaded
            React.createElement("div", { style: { display: showDropZone ? "none" : "inline-block", position: "relative", padding: 24 } },
              React.createElement("canvas", {
                ref: canvasRef,
                style: { 
                  display: "block", cursor: getCursor(), boxShadow: "0 8px 40px rgba(0,0,0,0.6)", 
                  borderRadius: 4, touchAction: "none", transformOrigin: "top left",
                  maxWidth: resizeScale ? "none" : isFit ? "100%" : "none",
                  maxHeight: resizeScale ? "none" : isFit ? "calc(100vh - 120px)" : "none",
                  width: resizeScale || !isFit ? `${canvasDisplayW}px` : "auto",
                  height: resizeScale || !isFit ? `${canvasDisplayH}px` : "auto",
                  objectFit: "contain",
                  imageRendering: "auto"
                },
                onPointerDown: handleMouseDown, onPointerMove: handleMouseMove,
                onPointerUp: handleMouseUp, onPointerCancel: handleMouseUp
              }),
              // Live drag selection overlay
              React.createElement("div", {
                ref: overlayRef,
                style: { display: "none", position: "absolute", pointerEvents: "none", border: `2px dashed ${toolColors[tool] || BRAND.accent}`, background: (toolColors[tool] || BRAND.accent) + "20", borderRadius: 2, zIndex: 5 }
              }),
              // Persistent crop selection overlay with Apply/Cancel
              cropSelection && canvasRef.current && (() => {
                const canvas = canvasRef.current;
                const rect = canvas.getBoundingClientRect();
                const scaleX = rect.width / canvas.width;
                const scaleY = rect.height / canvas.height;
                const ox = cropSelection.x * scaleX + 24;
                const oy = cropSelection.y * scaleY + 24;
                const ow = cropSelection.w * scaleX;
                const oh = cropSelection.h * scaleY;
                const HSIZE = 8; // handle square half-size in px
                const handlePos = [
                  { key:'nw', left:ox-HSIZE,      top:oy-HSIZE,      cursor:'nw-resize' },
                  { key:'n',  left:ox+ow/2-HSIZE, top:oy-HSIZE,      cursor:'n-resize'  },
                  { key:'ne', left:ox+ow-HSIZE,   top:oy-HSIZE,      cursor:'ne-resize' },
                  { key:'w',  left:ox-HSIZE,      top:oy+oh/2-HSIZE, cursor:'w-resize'  },
                  { key:'e',  left:ox+ow-HSIZE,   top:oy+oh/2-HSIZE, cursor:'e-resize'  },
                  { key:'sw', left:ox-HSIZE,      top:oy+oh-HSIZE,   cursor:'sw-resize' },
                  { key:'s',  left:ox+ow/2-HSIZE, top:oy+oh-HSIZE,   cursor:'s-resize'  },
                  { key:'se', left:ox+ow-HSIZE,   top:oy+oh-HSIZE,   cursor:'se-resize' },
                ];
                return React.createElement(React.Fragment, null,
                  // Dark outside overlay
                  React.createElement("div", { style: { position:"absolute", inset:0, background:"rgba(0,0,0,0.45)", pointerEvents:"none", zIndex:6 } }),
                  // Crop window (clears darkness via box-shadow trick)
                  React.createElement("div", { style: { position:"absolute", left:ox, top:oy, width:ow, height:oh, boxShadow:"0 0 0 9999px rgba(0,0,0,0.45)", border:"2px solid #2ECC71", zIndex:7, pointerEvents:"none" } },
                    // Rule-of-thirds grid lines
                    React.createElement("div", { style:{position:"absolute",left:"33.3%",top:0,width:1,height:"100%",background:"rgba(255,255,255,0.2)",pointerEvents:"none"} }),
                    React.createElement("div", { style:{position:"absolute",left:"66.6%",top:0,width:1,height:"100%",background:"rgba(255,255,255,0.2)",pointerEvents:"none"} }),
                    React.createElement("div", { style:{position:"absolute",left:0,top:"33.3%",width:"100%",height:1,background:"rgba(255,255,255,0.2)",pointerEvents:"none"} }),
                    React.createElement("div", { style:{position:"absolute",left:0,top:"66.6%",width:"100%",height:1,background:"rgba(255,255,255,0.2)",pointerEvents:"none"} })
                  ),
                  // 8 resize handles
                  ...handlePos.map(h =>
                    React.createElement("div", { key:h.key, style:{ position:"absolute", left:h.left, top:h.top, width:HSIZE*2, height:HSIZE*2, background:"#fff", border:"1.5px solid #2ECC71", borderRadius:2, zIndex:9, pointerEvents:"none", cursor:h.cursor, boxShadow:"0 1px 4px rgba(0,0,0,0.4)" } })
                  ),
                  // Size readout
                  React.createElement("div", { style:{ position:"absolute", left:ox, top:oy-26, background:"rgba(0,0,0,0.75)", color:"#2ECC71", fontSize:11, fontWeight:700, padding:"2px 8px", borderRadius:4, zIndex:9, pointerEvents:"none", whiteSpace:"nowrap" } },
                    `${cropSelection.w} × ${cropSelection.h}px`
                  ),
                  // Apply / Cancel buttons — stopPropagation so pointer down doesn't reach canvas handler and clear the selection
                  React.createElement("div", { onPointerDown: e => e.stopPropagation(), style: { position:"absolute", left:ox, top:oy+oh+10, display:"flex", gap:6, zIndex:9 } },
                    React.createElement("button", { onPointerDown: e => { e.stopPropagation(); applyCrop(e); }, style:{ padding:"6px 14px", borderRadius:6, background:"#2ECC71", color:"#000", border:"none", fontWeight:700, fontSize:12, cursor:"pointer" } }, "✓ Apply Crop"),
                    React.createElement("button", { onPointerDown: e => { e.stopPropagation(); cancelCrop(); }, style:{ padding:"6px 10px", borderRadius:6, background:"rgba(0,0,0,0.7)", color:"#fff", border:"1px solid #555", fontWeight:600, fontSize:12, cursor:"pointer" } }, "✕ Cancel")
                  )
                );
              })(),
              tool === "resize" && canvasRef.current && imageDimensions.w > 0 && (() => {
                const canvas = canvasRef.current;
                const rect = canvas.getBoundingClientRect();
                const parentRect = canvas.parentElement.getBoundingClientRect();
                const left = rect.left - parentRect.left;
                const top = rect.top - parentRect.top;
                const w = rect.width;
                const h = rect.height;
                const HSIZE = 8;
                const handlePos = [
                  { key: "nw", left: left - HSIZE, top: top - HSIZE, cursor: "nw-resize" },
                  { key: "ne", left: left + w - HSIZE, top: top - HSIZE, cursor: "ne-resize" },
                  { key: "sw", left: left - HSIZE, top: top + h - HSIZE, cursor: "sw-resize" },
                  { key: "se", left: left + w - HSIZE, top: top + h - HSIZE, cursor: "se-resize" },
                ];
                return React.createElement(React.Fragment, null,
                  React.createElement("div", {
                    style: { position: "absolute", left, top, width: w, height: h, border: `2px solid ${toolColors.resize}`, background: `${toolColors.resize}12`, boxShadow: "0 0 0 1px rgba(0,0,0,0.35)", zIndex: 8, pointerEvents: "none" }
                  }),
                  ...handlePos.map(hp =>
                    React.createElement("div", {
                      key: hp.key,
                      onPointerDown: handleMouseDown,
                      onPointerMove: handleMouseMove,
                      onPointerUp: handleMouseUp,
                      onPointerCancel: handleMouseUp,
                      style: { position: "absolute", left: hp.left, top: hp.top, width: HSIZE * 2, height: HSIZE * 2, background: "#fff", border: `2px solid ${toolColors.resize}`, borderRadius: 3, zIndex: 9, cursor: hp.cursor, touchAction: "none", boxShadow: "0 1px 5px rgba(0,0,0,0.5)" }
                    })
                  ),
                  React.createElement("div", {
                    style: { position: "absolute", left, top: top - 28, background: "rgba(0,0,0,0.78)", color: toolColors.resize, fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 4, zIndex: 9, pointerEvents: "none", whiteSpace: "nowrap" }
                  }, `${parseInt(resizeDims.w) || imageDimensions.w} × ${parseInt(resizeDims.h) || imageDimensions.h}px`)
                );
              })(),
              showTextBox && textPos && React.createElement("div", {
                style: { position: "absolute", left: 24 + textPos.x / (canvasRef.current ? canvasRef.current.width / canvasRef.current.getBoundingClientRect().width : 1), top: 24 + textPos.y / (canvasRef.current ? canvasRef.current.height / canvasRef.current.getBoundingClientRect().height : 1), zIndex: 20 }
              },
                React.createElement("input", {
                  autoFocus: true, value: textInput, onChange: e => { setTextInput(e.target.value); },
                  onKeyDown: e => { if (e.key === "Enter") { setPreviewLayer(null); commitText(); } if (e.key === "Escape") { setPreviewLayer(null); cancelText(); } },
                  placeholder: "Type → Enter...",
                  style: { 
                    background: textBgEnabled && textBgOpacity > 0
                      ? (() => { const r = parseInt(textBgColor.slice(1,3),16); const g = parseInt(textBgColor.slice(3,5),16); const b = parseInt(textBgColor.slice(5,7),16); return `rgba(${r},${g},${b},${textBgOpacity/100})`; })()
                      : "transparent",
                    color: drawColor, border: `1.5px solid ${drawColor}`, borderRadius: 4, 
                    padding: "4px 10px", fontSize: Math.max(12, fontSize * (canvasRef.current ? canvasRef.current.getBoundingClientRect().width / canvasRef.current.width : 1)), 
                    fontWeight: 700, outline: "none", minWidth: 160, fontFamily: fontFamily
                  }
                })
              )
            )
          ),

          // Right panel
          image && React.createElement("div", { style: { width: 200, background: BRAND.surface, borderLeft: `1px solid ${BRAND.border}`, padding: "16px 14px", display: "flex", flexDirection: "column", gap: 18, flexShrink: 0, overflowY: "auto" } },
            React.createElement("div", null,
              React.createElement("div", { style: { fontSize: 11, color: BRAND.textMuted, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 } }, editingLayer ? "Editing Layer" : "Active Tool"),
              React.createElement("div", { style: { fontSize: 14, fontWeight: 700, color: editingLayer ? BRAND.accent : (toolColors[tool] || BRAND.accent) } },
                 editingLayer
                  ? editingLayer.type.toUpperCase().charAt(0) + editingLayer.type.slice(1)
                  : TOOLS.find(t => t.id === tool)?.label
              ),
              React.createElement("div", { style: { fontSize: 11, color: BRAND.textMuted, marginTop: 4 } }, editingLayer ? "Scale & property adjustments active" : ({
                select: "Click a layer, then drag handles to transform", redact: "Drag to cover text/info", blur: "Drag to blur a region",
                pixelate: "Drag to pixelate a region", crop: "Drag to select, then Apply", arrow: "Drag to draw arrow",
                text: "Click to place text", draw: "Drag to draw freehand"
              }[tool] || ""))
            ),

            // Crop — Apply / Cancel
            tool === "crop" && cropSelection && React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } },
              React.createElement("div", { style: { fontSize: 11, color: BRAND.textMuted, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 } }, "Crop Selection"),
              React.createElement("div", { style: { fontSize: 12, color: BRAND.textMuted } }, `${cropSelection.w} × ${cropSelection.h}px`),
              React.createElement("button", { onMouseDown: e => { e.stopPropagation(); applyCrop(e); }, style: { padding: "8px", borderRadius: 7, background: "#2ECC71", color: "#000", border: "none", fontWeight: 700, fontSize: 13, cursor: "pointer" } }, "✓ Apply Crop"),
              React.createElement("button", { onMouseDown: e => { e.stopPropagation(); cancelCrop(); }, style: { padding: "7px", borderRadius: 7, background: "transparent", color: BRAND.textMuted, border: `1px solid ${BRAND.border}`, fontWeight: 600, fontSize: 12, cursor: "pointer" } }, "✕ Cancel")
            ),

            // Resize — Apply
            tool === "resize" && React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 12, marginTop: 8 } },
              React.createElement("div", null,
                React.createElement("div", { style: { fontSize: 11, color: BRAND.textMuted, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 } }, "Resize Mode"),
                React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 } },
                  [
                    { id: "scale", label: "Image + Layers" },
                    { id: "canvas", label: "Canvas" },
                  ].map(mode =>
                    React.createElement("button", {
                      key: mode.id,
                      onClick: () => setResizeMode(mode.id),
                      style: {
                        minHeight: 34,
                        padding: "6px 8px",
                        borderRadius: 6,
                        border: `1px solid ${resizeMode === mode.id ? toolColors.resize : BRAND.border}`,
                        background: resizeMode === mode.id ? `${toolColors.resize}22` : BRAND.bg,
                        color: resizeMode === mode.id ? toolColors.resize : BRAND.text,
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: "pointer",
                        lineHeight: 1.2,
                      }
                    }, mode.label)
                  )
                ),
                React.createElement("div", { style: { fontSize: 10, color: BRAND.textMuted, marginTop: 6, lineHeight: 1.35 } },
                  resizeMode === "scale" ? "Scales the image and every layer together." : "Changes canvas bounds; layers keep their size and position."
                )
              ),

              React.createElement("div", { style: { fontSize: 11, color: BRAND.textMuted, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 } }, "Resize Dimensions"),
              
              // Width
              React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between" } },
                React.createElement("span", { style: { fontSize: 13, color: BRAND.textMuted, fontWeight: 600 } }, "W"),
                React.createElement("div", { style: { position: "relative" } },
                  React.createElement("input", { type: "number", value: resizeDims.w, onChange: e => handleResizeChange("w", e.target.value), style: { width: 80, background: BRAND.bg, border: `1px solid ${BRAND.border}`, color: "#fff", fontSize: 14, padding: "6px 8px", borderRadius: 6, textAlign: "right", fontFamily: "monospace", outline: "none" } }),
                  React.createElement("span", { style: { position: "absolute", right: 8, top: 7, fontSize: 10, color: BRAND.textMuted, pointerEvents: "none" } }, "px")
                )
              ),
              
              // Height
              React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between" } },
                React.createElement("span", { style: { fontSize: 13, color: BRAND.textMuted, fontWeight: 600 } }, "H"),
                React.createElement("div", { style: { position: "relative" } },
                  React.createElement("input", { type: "number", value: resizeDims.h, onChange: e => handleResizeChange("h", e.target.value), style: { width: 80, background: BRAND.bg, border: `1px solid ${BRAND.border}`, color: "#fff", fontSize: 14, padding: "6px 8px", borderRadius: 6, textAlign: "right", fontFamily: "monospace", outline: "none" } }),
                  React.createElement("span", { style: { position: "absolute", right: 8, top: 7, fontSize: 10, color: BRAND.textMuted, pointerEvents: "none" } }, "px")
                )
              ),

              // Lock Aspect Ratio
              React.createElement("label", { style: { display: "flex", alignItems: "center", gap: 8, marginTop: 4, cursor: "pointer", userSelect: "none" } },
                React.createElement("input", { type: "checkbox", checked: aspectLock, onChange: e => setAspectLock(e.target.checked), style: { accentColor: BRAND.accent, cursor: "pointer", width: 14, height: 14 } }),
                React.createElement("span", { style: { fontSize: 12, color: BRAND.text } }, "Lock Aspect Ratio")
              ),

              // Apply Button
              React.createElement("div", { style: { marginTop: 12, display: "flex", flexDirection: "column", gap: 6 } },
                React.createElement("button", { onClick: applyResize, style: { width: "100%", padding: "10px 0", background: BRAND.accent, border: "none", color: "#000", borderRadius: 6, fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "0.15s" }, onMouseEnter: e => e.currentTarget.style.background = BRAND.accentHover, onMouseLeave: e => e.currentTarget.style.background = BRAND.accent }, resizeMode === "scale" ? "Resize Image + Layers" : "Resize Canvas"),
                React.createElement("div", { style: { fontSize: 10, color: BRAND.textMuted, textAlign: "center" } }, "Press ", React.createElement("b", { style: { color: BRAND.text } }, "Enter"), " to apply or ", React.createElement("b", { style: { color: BRAND.text } }, "Esc"), " to cancel")
              )
            ),

            (() => {
              const type = editingLayer ? editingLayer.type : tool;
              const elements = [];

              if (["blur", "pixelate", "draw", "arrow"].includes(type)) {
                elements.push(React.createElement("div", { key: "brush-size" },
                  React.createElement("div", { style: { fontSize: 11, color: BRAND.textMuted, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 } }, 
                    `${type === "blur" ? "Blur Radius" : type === "pixelate" ? "Block Size" : "Size"} — ${brushSize}`
                  ),
                  React.createElement("input", { 
                    type: "range", min: type === "pixelate" ? 4 : type === "blur" ? 4 : 2, max: 40, value: brushSize, 
                    onChange: e => { const v = Number(e.target.value); setBrushSize(v); updateSelectedLayer({ radius: v, size: v }); }, 
                    style: { width: "100%", accentColor: BRAND.accent } 
                  })
                ));
              }

              if (type === "text") {
                elements.push(React.createElement("div", { key: "font-settings", style: { display: "flex", flexDirection: "column", gap: 12 } },
                  React.createElement("div", null,
                    React.createElement("div", { style: { fontSize: 11, color: BRAND.textMuted, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 } }, `Font Size — ${fontSize}px`),
                    React.createElement("input", { 
                      type: "range", min: 12, max: 96, value: fontSize, 
                      onChange: e => { const v = Number(e.target.value); setFontSize(v); updateSelectedLayer({ fontSize: v }); }, 
                      style: { width: "100%", accentColor: BRAND.accent } 
                    })
                  ),
                  React.createElement("div", null,
                    React.createElement("div", { style: { fontSize: 11, color: BRAND.textMuted, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 } }, "Typeface"),
                    React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 } },
                      VIGNELLI_FONTS.map(f => React.createElement("div", {
                        key: f.name,
                        onClick: () => { setFontFamily(f.family); updateSelectedLayer({ fontFamily: f.family }); },
                        style: {
                          padding: "8px 6px", borderRadius: 6, background: fontFamily === f.family ? BRAND.accent + "33" : BRAND.surfaceHover, border: `1px solid ${fontFamily === f.family ? BRAND.accent : BRAND.border}`, color: fontFamily === f.family ? BRAND.accent : BRAND.text, cursor: "pointer", fontSize: 12, textAlign: "center", fontFamily: f.family, transition: "all 0.1s"
                        }
                      }, f.name))
                    )
                  ),
                  React.createElement("div", null,
                    React.createElement("div", { style: { fontSize: 11, color: BRAND.textMuted, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" } },
                      "Text Background",
                      React.createElement("label", { style: { display: "flex", alignItems: "center", gap: 6, cursor: "pointer" } },
                        React.createElement("input", {
                          type: "checkbox", checked: textBgEnabled,
                          onChange: e => { setTextBgEnabled(e.target.checked); updateSelectedLayer({ bgEnabled: e.target.checked }); },
                          style: { accentColor: BRAND.accent, width: 14, height: 14, cursor: "pointer" }
                        }),
                        React.createElement("span", { style: { fontSize: 11, color: textBgEnabled ? BRAND.accent : BRAND.textMuted } }, textBgEnabled ? "On" : "Off")
                      )
                    ),
                    textBgEnabled && React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } },
                      React.createElement("div", null,
                        React.createElement("div", { style: { fontSize: 11, color: BRAND.textMuted, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 } }, "Background Color"),
                        React.createElement("div", { style: { display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 6 } },
                          COLOR_PRESETS.map(c =>
                            React.createElement("div", {
                              key: c,
                              onClick: () => { setTextBgColor(c); updateSelectedLayer({ bgColor: c }); },
                              style: { width: 22, height: 22, borderRadius: 5, background: c, border: textBgColor === c ? `2px solid white` : c === "#FFFFFF" ? `1px solid ${BRAND.border}` : "1px solid transparent", cursor: "pointer", transition: "transform 0.1s", transform: textBgColor === c ? "scale(1.2)" : "scale(1)" }
                            })
                          )
                        ),
                        React.createElement("input", {
                          type: "color", value: textBgColor,
                          onChange: e => { setTextBgColor(e.target.value); updateSelectedLayer({ bgColor: e.target.value }); },
                          style: { width: "100%", height: 28, borderRadius: 6, border: `1px solid ${BRAND.border}`, cursor: "pointer" }
                        })
                      ),
                      React.createElement("div", null,
                        React.createElement("div", { style: { fontSize: 11, color: BRAND.textMuted, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 } }, `Opacity — ${textBgOpacity}%`),
                        React.createElement("input", {
                          type: "range", min: 0, max: 100, value: textBgOpacity,
                          onChange: e => { const v = Number(e.target.value); setTextBgOpacity(v); updateSelectedLayer({ bgOpacity: v }); },
                          style: { width: "100%", accentColor: BRAND.accent }
                        })
                      )
                    )
                  )
                ));
              }

              if (type === "redact") {
                elements.push(React.createElement("div", { key: "redact-color" },
                  React.createElement("div", { style: { fontSize: 11, color: BRAND.textMuted, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 } }, "Redact Color"),
                  React.createElement("div", { style: { display: "flex", gap: 6, flexWrap: "wrap" } },
                    REDACT_COLORS.map(c => React.createElement("div", { 
                      key: c, 
                      onClick: () => { setRedactColor(c); updateSelectedLayer({ color: c }); }, 
                      style: { width: 28, height: 28, borderRadius: 6, background: c, border: redactColor === c ? `2px solid ${BRAND.accent}` : c === "#FFFFFF" ? `1px solid ${BRAND.border}` : "1px solid transparent", cursor: "pointer" } 
                    }))
                  )
                ));
              }

              if (["draw", "text", "arrow"].includes(type)) {
                elements.push(React.createElement("div", { key: "general-color" },
                  React.createElement("div", { style: { fontSize: 11, color: BRAND.textMuted, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 } }, "Color"),
                  React.createElement("div", { style: { display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 8 } },
                    COLOR_PRESETS.map(c =>
                      React.createElement("div", { 
                        key: c, 
                        onClick: () => { setDrawColor(c); updateSelectedLayer({ color: c }); }, 
                        style: { width: 22, height: 22, borderRadius: 5, background: c, border: drawColor === c ? `2px solid white` : c === "#FFFFFF" ? `1px solid ${BRAND.border}` : "1px solid transparent", cursor: "pointer", transition: "transform 0.1s", transform: drawColor === c ? "scale(1.2)" : "scale(1)" } 
                      })
                    )
                  ),
                  React.createElement("input", { 
                    type: "color", value: drawColor, 
                    onChange: e => { setDrawColor(e.target.value); updateSelectedLayer({ color: e.target.value }); }, 
                    style: { width: "100%", height: 28, borderRadius: 6, border: `1px solid ${BRAND.border}`, cursor: "pointer" } 
                  })
                ));
              }

              return elements;
            })(),

            React.createElement("div", { style: { marginTop: "auto", paddingTop: 16, borderTop: `1px solid ${BRAND.border}` } },
              React.createElement("div", { style: { fontSize: 11, color: BRAND.textMuted, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 } }, "Canvas"),
              React.createElement("div", { style: { fontSize: 12, color: BRAND.textMuted } }, `${imageDimensions.w} × ${imageDimensions.h}px`),
              React.createElement("div", { style: { fontSize: 12, color: BRAND.textMuted, marginTop: 4 } }, `${history.length} edit${history.length !== 1 ? "s" : ""}`)
            ),

            // LAYER LIST (Photopea style)
            layers.length > 0 && React.createElement("div", { style: { borderTop: `1px solid ${BRAND.border}`, paddingTop: 16 } },
              React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: BRAND.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12, display: "flex", justifyContent: "space-between" } }, 
                "Layers",
                React.createElement("span", { style: { color: BRAND.accent } }, layers.length)
              ),
              React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 4, maxHeight: 200, overflowY: "auto", paddingRight: 4 } },
                layers.map((l, idx) => 
                  React.createElement("div", {
                    key: l.id,
                    onClick: () => { setSelectedLayerId(l.id); setTool("select"); },
                    style: { 
                      padding: "8px 10px", borderRadius: 6, cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", gap: 10,
                      background: selectedLayerId === l.id ? `${BRAND.accent}22` : "transparent",
                      border: `1px solid ${selectedLayerId === l.id ? BRAND.accent : "transparent"}`
                    },
                    onMouseEnter: e => { if (selectedLayerId !== l.id) e.currentTarget.style.background = BRAND.surfaceHover; },
                    onMouseLeave: e => { if (selectedLayerId !== l.id) e.currentTarget.style.background = "transparent"; }
                  },
                    React.createElement("span", { style: { opacity: 0.5, fontSize: 10, width: 14 } }, layers.length - idx),
                    React.createElement("span", { style: { fontSize: 14 } }, 
                      l.type === "blur" ? "◈" : l.type === "pixelate" ? "⊞" : l.type === "redact" ? "▬" : l.type === "arrow" ? "↗" : l.type === "text" ? "T" : "✎"
                    ),
                    React.createElement("div", { style: { flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: selectedLayerId === l.id ? 700 : 500, color: selectedLayerId === l.id ? BRAND.text : BRAND.textMuted } }, 
                      l.type.charAt(0).toUpperCase() + l.type.slice(1),
                      l.text ? `: ${l.text}` : ""
                    ),
                    React.createElement("button", { 
                      onClick: (e) => { e.stopPropagation(); saveHistory(); setLayers(prev => prev.filter(x => x.id !== l.id)); setSelectedLayerId(null); },
                      style: { background: "transparent", border: "none", color: BRAND.textMuted, cursor: "pointer", padding: 4, fontSize: 10 }
                    }, "✕")
                  )
                ).reverse()
              )
            ),

            React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } },
              React.createElement("button", { onClick: copyToClipboard, style: { ...btnStyle(BRAND), width: "100%", justifyContent: "center" } }, "📋 Copy to Clipboard"),
              React.createElement("button", { onClick: () => exportImage("png", sanitizeMode), style: { ...btnStyle(BRAND, false, true), width: "100%", justifyContent: "center" } }, "⬇ Export PNG"),
              React.createElement("button", { onClick: () => exportImage("jpg", sanitizeMode), style: { ...btnStyle(BRAND), width: "100%", justifyContent: "center" } }, "⬇ Export JPG")
            )
          ),
        ),

        // Bottom bar
        React.createElement("div", { style: { height: 28, background: BRAND.surface, borderTop: `1px solid ${BRAND.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", fontSize: 11, color: BRAND.textMuted, flexShrink: 0 } },
          React.createElement("span", null, "bimp.us — Basic Image Manipulator"),
          React.createElement("span", null, "Ctrl+Z undo  ·  V select  ·  R redact  ·  B blur  ·  P pixelate  ·  C crop  ·  A arrow  ·  T text  ·  D draw")
        ),

        // 💎 Auth / Credits Modal
        (authModalOpen || proModalOpen) && React.createElement("div", {
          style: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(10px)", zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center" },
          onClick: () => { setAuthModalOpen(false); setProModalOpen(false); }
        },
          React.createElement("div", { 
            style: { width: 420, background: BRAND.surface, border: `1px solid ${BRAND.border}`, borderRadius: 16, padding: 32, boxShadow: "0 20px 40px rgba(0,0,0,0.4)" },
            onClick: e => e.stopPropagation()
          },

            // ── Tabs ──
            React.createElement("div", { style: { display: "flex", gap: 4, marginBottom: 24, borderBottom: `1px solid ${BRAND.border}`, paddingBottom: 12 } },
              [
                { id: "login", label: user ? "👤 Account" : "🔑 Sign In" },
                { id: "credits", label: "⚡ Credits" },
                ...(user?.byok_unlocked ? [{ id: "byok", label: "🔧 BYOK" }] : []),
              ].map(tab => React.createElement("button", {
                key: tab.id,
                onClick: () => setActiveTab(tab.id),
                style: { padding: "6px 14px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "none", background: activeTab === tab.id ? BRAND.accent + "22" : "transparent", color: activeTab === tab.id ? BRAND.accent : BRAND.textMuted, transition: "all 0.15s" }
              }, tab.label))
            ),

            // ── Login Tab ──
            activeTab === "login" && !user && React.createElement("div", null,
              React.createElement("div", { style: { fontSize: 22, fontWeight: 800, marginBottom: 8 } }, "Welcome to bimp.us"),
              React.createElement("div", { style: { fontSize: 13, color: BRAND.textMuted, marginBottom: 24, lineHeight: 1.6 } }, "Sign in with your email to access credits, Pro features, and your BYOK API key."),
              !authSent ? React.createElement("div", null,
                React.createElement("input", {
                  type: "email", placeholder: "you@example.com", value: authEmail,
                  onChange: e => setAuthEmail(e.target.value),
                  onKeyDown: e => e.key === "Enter" && sendMagicLink(),
                  style: { width: "100%", background: BRAND.bg, border: `1px solid ${BRAND.border}`, borderRadius: 8, padding: "12px 16px", color: BRAND.text, fontSize: 14, marginBottom: 12, outline: "none" }
                }),
                React.createElement("button", {
                  onClick: sendMagicLink,
                  disabled: authLoading || !authEmail.includes("@"),
                  style: { ...btnStyle(BRAND, authLoading || !authEmail.includes("@"), true), width: "100%", height: 44, justifyContent: "center", fontSize: 14, color: "#000" }
                }, authLoading ? "Sending..." : "Send Magic Link →")
              ) : React.createElement("div", { style: { textAlign: "center", padding: "20px 0" } },
                React.createElement("div", { style: { fontSize: 40, marginBottom: 12 } }, "📬"),
                React.createElement("div", { style: { fontSize: 16, fontWeight: 700, marginBottom: 8 } }, "Check your email"),
                React.createElement("div", { style: { fontSize: 13, color: BRAND.textMuted } }, `Magic link sent to ${authEmail}. Click it to sign in.`)
              )
            ),

            // ── Account Tab (logged in) ──
            activeTab === "login" && user && React.createElement("div", null,
              React.createElement("div", { style: { fontSize: 16, fontWeight: 700, marginBottom: 4 } }, user.email),
              React.createElement("div", { style: { fontSize: 12, color: user.is_pro ? "#FFD700" : BRAND.textMuted, marginBottom: 20 } }, user.is_pro ? "💎 Pro Member" : "Free Plan"),
              React.createElement("div", { style: { background: BRAND.bg, borderRadius: 10, padding: 16, marginBottom: 20 } },
                React.createElement("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: 8 } },
                  React.createElement("span", { style: { fontSize: 12, color: BRAND.textMuted } }, "Credits remaining"),
                  React.createElement("span", { style: { fontSize: 14, fontWeight: 700, color: BRAND.success } }, `⚡ ${user.credits}`)
                ),
                React.createElement("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: 8 } },
                  React.createElement("span", { style: { fontSize: 12, color: BRAND.textMuted } }, "Credits spent"),
                  React.createElement("span", { style: { fontSize: 12, color: BRAND.textMuted } }, `${user.credits_spent} / ${500} for BYOK`)
                ),
                React.createElement("div", { style: { height: 4, background: BRAND.border, borderRadius: 2, overflow: "hidden" } },
                  React.createElement("div", { style: { height: "100%", width: `${Math.min(100, (user.credits_spent / 500) * 100)}%`, background: user.byok_unlocked ? BRAND.success : BRAND.accent, borderRadius: 2, transition: "width 0.3s" } })
                ),
                !user.byok_unlocked && React.createElement("div", { style: { fontSize: 11, color: BRAND.textMuted, marginTop: 6 } }, `Spend $${((500 - user.credits_spent) * 0.1).toFixed(0)} more in credits to unlock BYOK`)
              ),
              React.createElement("button", {
                onClick: logout,
                style: { ...btnStyle(BRAND), width: "100%", justifyContent: "center" }
              }, "Sign Out")
            ),

            // ── Credits Tab ──
            // NOTE: the three href values below are placeholders — replace with the real
            // Stripe Payment Link URLs once created in the Stripe dashboard (see plan/checklist).
            activeTab === "credits" && React.createElement("div", null,
              React.createElement("div", { style: { fontSize: 18, fontWeight: 800, marginBottom: 8 } }, "⚡ Load Credits"),
              React.createElement("div", { style: { fontSize: 13, color: BRAND.textMuted, marginBottom: 20, lineHeight: 1.6 } }, "Credits power AI features. 1 credit = $0.10. No subscription — top up when you need it."),
              React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 } },
                React.createElement("a", {
                  href: `https://buy.stripe.com/credits-s${user?.email ? `?prefilled_email=${encodeURIComponent(user.email)}` : ""}`,
                  target: "_blank",
                  style: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", borderRadius: 10, border: `1px solid ${BRAND.border}`, textDecoration: "none", color: BRAND.text, background: BRAND.bg, cursor: "pointer" }
                },
                  React.createElement("div", null,
                    React.createElement("div", { style: { fontWeight: 700, fontSize: 14 } }, "50 Credits"),
                    React.createElement("div", { style: { fontSize: 12, color: BRAND.textMuted } }, "Good for ~50 AI operations")
                  ),
                  React.createElement("div", { style: { fontWeight: 800, fontSize: 16, color: BRAND.success } }, "$5")
                ),
                React.createElement("a", {
                  href: `https://buy.stripe.com/credits-l${user?.email ? `?prefilled_email=${encodeURIComponent(user.email)}` : ""}`,
                  target: "_blank",
                  style: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", borderRadius: 10, border: `1px solid ${BRAND.accent}`, textDecoration: "none", color: BRAND.text, background: BRAND.accentLight, cursor: "pointer" }
                },
                  React.createElement("div", null,
                    React.createElement("div", { style: { fontWeight: 700, fontSize: 14 } }, "120 Credits  🔥 Best Value"),
                    React.createElement("div", { style: { fontSize: 12, color: BRAND.textMuted } }, "Good for ~120 AI operations")
                  ),
                  React.createElement("div", { style: { fontWeight: 800, fontSize: 16, color: BRAND.success } }, "$10")
                )
              ),
              React.createElement("div", { style: { borderTop: `1px solid ${BRAND.border}`, paddingTop: 16 } },
                React.createElement("a", {
                  href: `https://buy.stripe.com/pro${user?.email ? `?prefilled_email=${encodeURIComponent(user.email)}` : ""}`,
                  target: "_blank",
                  style: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", borderRadius: 10, border: "1px solid #FFD700", textDecoration: "none", color: BRAND.text, background: "rgba(255,215,0,0.06)", cursor: "pointer" }
                },
                  React.createElement("div", null,
                    React.createElement("div", { style: { fontWeight: 700, fontSize: 14, color: "#FFD700" } }, "💎 bimp.us Pro — One-time"),
                    React.createElement("div", { style: { fontSize: 12, color: BRAND.textMuted } }, "Unlocks BYOK immediately + all Pro features")
                  ),
                  React.createElement("div", { style: { fontWeight: 800, fontSize: 16, color: "#FFD700" } }, "$25")
                )
              )
            ),

            // ── BYOK Tab ──
            activeTab === "byok" && user?.byok_unlocked && React.createElement("div", null,
              React.createElement("div", { style: { fontSize: 18, fontWeight: 800, marginBottom: 8 } }, "🔧 Bring Your Own Key"),
              React.createElement("div", { style: { fontSize: 13, color: BRAND.textMuted, marginBottom: 20, lineHeight: 1.6 } }, "Enter your OpenAI or Replicate API key. It's stored securely on our server and used only for your AI requests."),
              React.createElement("input", {
                type: "password", placeholder: "sk-...", value: byokInput,
                onChange: e => setByokInput(e.target.value),
                style: { width: "100%", background: BRAND.bg, border: `1px solid ${BRAND.border}`, borderRadius: 8, padding: "12px 16px", color: BRAND.text, fontSize: 13, fontFamily: "monospace", marginBottom: 12, outline: "none" }
              }),
              React.createElement("button", {
                onClick: saveByok,
                disabled: byokSaving || !byokInput.trim(),
                style: { ...btnStyle(BRAND, byokSaving || !byokInput.trim(), true), width: "100%", height: 44, justifyContent: "center", fontSize: 14, color: "#000" }
              }, byokSaving ? "Saving..." : "Save API Key")
            )
          )
        )
      );
    }

    const root = ReactDOM.createRoot(document.getElementById("root"));
    root.render(React.createElement(BasimpEditor));
