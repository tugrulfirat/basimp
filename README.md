# basimp — Basic Image Manipulator

> The fastest way to clean up an image before sharing it.

**basimp** is a free, browser-based image editor built for one thing: quickly redact, blur, crop, and annotate images before sharing them. No Photoshop. No sign-up. No complexity.

🌐 **Live:** [basimp.com](https://basimp.com)

---

## Why basimp?

Most people reach for a red marker brush to hide a name in a screenshot — and it never covers it properly. basimp gives you the right tools for the job, in seconds.

The gap it fills:

| Too simple | **basimp** ✅ | Too complex |
|---|---|---|
| MS Paint | Smart basic tools | Photopea / GIMP |
| Screenshot markup | Works in the browser | Photoshop |

---

## Features

### Core Tools (Free)
| Tool | Shortcut | What it does |
|---|---|---|
| **Redact** | R | Solid fill box — proper redaction, not a brush |
| **Blur** | B | Gaussian blur over any selected region |
| **Pixelate** | P | Classic pixel censor effect |
| **Crop** | C | Select → preview → Apply (non-destructive until confirmed) |
| **Arrow** | A | Draw arrows to highlight or annotate |
| **Text** | T | Click to place text anywhere |
| **Draw** | D | Freehand brush |
| **Select** | V | Default pointer |

### Social Canvas Presets
Create blank canvases at exact platform dimensions — one click:

- **Instagram** — Post (1080×1080), Portrait (1080×1350), Story/Reel (1080×1920)
- **YouTube** — Thumbnail (1280×720), Channel Banner (2560×1440), Shorts
- **LinkedIn** — Post, Story, Banner
- **X / Twitter** — Post, Header, Card
- **TikTok** — Video, Square, Landscape
- **Pinterest** — Standard Pin, Long Pin, Story Pin
- **Bluesky** — Post, Banner, Avatar

### Workflow
- **Ctrl+V** — paste from clipboard instantly
- **Drag & drop** — drop any image file
- **Copy to clipboard** — one click, back to Slack/email
- **Export PNG / JPG** — download the result
- **Undo** — Ctrl+Z, up to 20 steps

---

## Tech Stack

- **Pure HTML + React (via CDN)** — zero build step, runs in any browser
- **HTML5 Canvas API** — all image processing happens client-side
- **No server** — 100% static, full privacy (images never leave your machine)

---

## Roadmap

- [ ] Layers support for social post creation
- [ ] AI background removal (Pro)
- [ ] AI object eraser / inpainting (Pro)
- [ ] "Describe what to remove" prompt (Pro, Ollama)
- [ ] Batch processing (Pro)
- [ ] Mobile touch support

---

## Deploy

This is a 100% static project — just upload `index.html` and `app.html` to any host:

```bash
# Netlify (drag & drop the basimp/ folder)
# Vercel
npx vercel

# GitHub Pages
# Push to repo → Settings → Pages → Deploy from branch
```

No build step. No dependencies to install.

---

## Contributing

PRs welcome. The entire editor is in `app.html` — one self-contained file with inline React (Babel transform). No bundler needed.

```bash
git clone https://github.com/tugrulfirat/basimp
cd basimp
open app.html   # that's it
```

---

## License

MIT — free to use, fork, and build on.

---

Built by [@tugrulfirat](https://twitter.com/SlackPixel) · [Rapidlander.com](https://rapidlander.com)
