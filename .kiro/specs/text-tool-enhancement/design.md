# Design Document: Text Tool Enhancement

## Overview

This document describes the technical design for three targeted improvements to the Text Tool in the bimp.us image editor (`editor.jsx`):

1. **Remove the hardcoded drop shadow** — eliminate the `shadowColor`/`shadowBlur` side-effect that produces dark halos around text.
2. **Optional text background** — let users place a padded, color-and-opacity-controlled rectangle behind their text for contrast.
3. **Fix undo history ordering** — snapshot the canvas *before* the Text Input Overlay opens, not inside `commitText`, so undo behaves identically to every other tool.

All changes are confined to `editor.jsx`. No new files, build steps, or external dependencies are required beyond the existing React + Babel setup.

---

## Architecture

bimp.us is a single-file React application. All state lives in the `Bimp.usEditor` component via `useState`/`useRef` hooks. Edits are applied directly to an HTML5 `<canvas>` element; there is no virtual scene graph or layer system.

The relevant data flow for the Text Tool today:

```
User clicks canvas
  → handleMouseDown (tool === "text")
      → setTextPos, setShowTextBox(true)          ← overlay appears

User types, presses Enter
  → commitText()
      → saveHistory()   ← BUG: snapshot taken AFTER click, not before
      → ctx.font / ctx.fillStyle / ctx.shadowBlur / ctx.fillText
      → close overlay
```

After this enhancement the flow becomes:

```
User clicks canvas
  → handleMouseDown (tool === "text")
      → saveHistory()   ← snapshot taken BEFORE overlay opens
      → setTextPos, setShowTextBox(true)

User types, presses Enter
  → commitText()
      → ctx.shadowBlur = 0 / ctx.shadowColor = "transparent"
      → [if bgEnabled] ctx.fillRect (background rectangle)
      → ctx.fillText (text characters)
      → close overlay

User presses Escape / closes without committing
  → cancelText()
      → pop the snapshot saved at click time from History
      → close overlay
```

---

## Components and Interfaces

### State additions

Three new state variables are added to `Bimp.usEditor`:

| Variable | Type | Default | Purpose |
|---|---|---|---|
| `textBgEnabled` | `boolean` | `false` | Whether the text background feature is active |
| `textBgColor` | `string` (CSS hex) | `"#000000"` | Fill color for the text background rectangle |
| `textBgOpacity` | `number` (0–100) | `80` | Opacity percentage for the text background |

No existing state variables are removed or renamed.

### Modified functions

#### `handleMouseDown`

When `tool === "text"` and an image is loaded:

1. Call `saveHistory()` **before** setting `showTextBox(true)`.
2. Remove the early `return` that previously skipped `saveHistory`.

```js
if (tool === "text") {
  if (!image) return;          // guard: no snapshot if no image
  saveHistory();               // snapshot BEFORE overlay
  setTextPos(pos);
  setShowTextBox(true);
  return;
}
```

#### `commitText`

1. Remove the `saveHistory()` call (snapshot already taken at click time).
2. Reset shadow state explicitly before drawing.
3. Optionally draw the background rectangle.

```js
const commitText = () => {
  if (!textInput.trim() || !textPos) {
    cancelText();              // discard snapshot on empty commit
    return;
  }
  const canvas = canvasRef.current;
  const ctx = canvas.getContext("2d");

  // 1. Clear any residual shadow state
  ctx.shadowBlur = 0;
  ctx.shadowColor = "transparent";

  // 2. Set font so measureText is accurate
  ctx.font = `bold ${fontSize}px Inter, Helvetica Neue, sans-serif`;

  // 3. Optional background rectangle
  if (textBgEnabled && textBgOpacity > 0) {
    const metrics = ctx.measureText(textInput);
    const textW = metrics.width;
    const textH = fontSize;          // approximation; ascent+descent ≈ fontSize
    const pad = 4;
    const alpha = textBgOpacity / 100;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = textBgColor;
    ctx.fillRect(
      textPos.x - pad,
      textPos.y - textH - pad,       // fillText baseline is bottom of text
      textW + pad * 2,
      textH + pad * 2
    );
    ctx.restore();
  }

  // 4. Draw text (no shadow)
  ctx.fillStyle = drawColor;
  ctx.fillText(textInput, textPos.x, textPos.y);

  setTextInput("");
  setShowTextBox(false);
  setTextPos(null);
  status("Text added ✓");
};
```

#### `cancelText` (new helper)

Called when the user presses Escape or closes the overlay without committing:

```js
const cancelText = () => {
  // Discard the snapshot saved at click time
  setHistory(h => h.slice(0, -1));
  setTextInput("");
  setShowTextBox(false);
  setTextPos(null);
};
```

The `onKeyDown` handler on the Text Input Overlay is updated:

```js
onKeyDown={e => {
  if (e.key === "Enter") commitText();
  if (e.key === "Escape") cancelText();
}}
```

### Right Panel additions (Text Tool)

When `tool === "text"`, the Right Panel gains three new controls below the existing Font Size slider:

1. **Text Background toggle** — a styled checkbox/toggle that sets `textBgEnabled`.
2. **Background Color picker** — shown only when `textBgEnabled === true`; sets `textBgColor`.
3. **Background Opacity slider** — shown only when `textBgEnabled === true`; range 0–100, sets `textBgOpacity`.

These controls follow the same visual pattern as the existing Font Size slider and Color picker in the Right Panel.

---

## Data Models

No persistent data model changes are required. All state is ephemeral React state within the component lifetime (a single browser session). The canvas itself is the only "persisted" artifact, exported as PNG/JPG on demand.

### Text rendering parameters (logical record)

At the moment `commitText` executes, the following values are consumed:

```
TextRenderParams {
  text:        string          // textInput (trimmed)
  x:           number          // textPos.x (canvas pixels)
  y:           number          // textPos.y (canvas pixels, baseline)
  fontSize:    number          // fontSize state (12–96)
  color:       string          // drawColor (CSS color)
  bgEnabled:   boolean         // textBgEnabled
  bgColor:     string          // textBgColor (CSS hex)
  bgOpacity:   number          // textBgOpacity (0–100)
  padding:     4               // constant canvas pixels
}
```

### Background rectangle geometry

Given `TextRenderParams`, the background rectangle is:

```
rect.x      = params.x - params.padding
rect.y      = params.y - params.fontSize - params.padding
rect.width  = ctx.measureText(params.text).width + params.padding * 2
rect.height = params.fontSize + params.padding * 2
rect.alpha  = params.bgOpacity / 100
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Shadow state is always reset before text is drawn

*For any* prior canvas context shadow state (arbitrary `shadowBlur` value and `shadowColor` value), after `commitText` executes, the canvas context's `shadowBlur` SHALL be `0` and `shadowColor` SHALL be `"transparent"` — regardless of what shadow values were set before the call.

**Validates: Requirements 1.1, 1.2**

---

### Property 2: Background rectangle fully encloses text with correct color and alpha

*For any* non-empty text string, font size in [12, 96], background color, and background opacity in (0, 100], when `textBgEnabled` is `true`, `commitText` SHALL call `fillRect` before `fillText`, the rectangle SHALL have width ≥ `ctx.measureText(text).width + 8` and height ≥ `fontSize + 8` (accounting for 4 px padding on each side), the rectangle's top-left SHALL be offset exactly 4 canvas pixels above and to the left of the text baseline origin, and `globalAlpha` at the time of `fillRect` SHALL equal `bgOpacity / 100`.

**Validates: Requirements 2.5, 2.6, 2.7, 2.8**

---

### Property 3: Disabled or zero-opacity background produces no fillRect call

*For any* text string and canvas state, when `textBgEnabled` is `false` OR `textBgOpacity` is `0`, `commitText` SHALL NOT call `fillRect` on the canvas context.

**Validates: Requirements 2.2, 2.7**

---

### Property 4: Undo restores the pre-text canvas state

*For any* canvas state S and any non-empty text string, after the user clicks the canvas with the Text Tool active (which saves S to History), commits the text, and then invokes undo, the canvas SHALL be restored to exactly state S — the state captured before the text was placed.

**Validates: Requirements 3.1, 3.2, 3.3**

---

### Property 5: Cancelling text leaves the history stack unchanged

*For any* history stack H of length 0–20, after the user clicks the canvas with the Text Tool active (appending one snapshot to produce H') and then cancels (presses Escape without committing), the history stack SHALL revert to H — the same length and same contents as before the click.

**Validates: Requirements 3.4**

---

## Error Handling

| Scenario | Handling |
|---|---|
| `commitText` called with empty/whitespace `textInput` | Delegates to `cancelText()` — discards the snapshot and closes the overlay without drawing anything |
| `commitText` called when `textPos` is `null` | Same as above — guard condition `!textPos` triggers `cancelText()` |
| `cancelText` called when History is empty | `h.slice(0, -1)` on an empty array returns `[]` — safe no-op |
| `textBgOpacity === 0` with `textBgEnabled === true` | The `textBgOpacity > 0` guard in `commitText` skips the `fillRect` call entirely |
| `ctx.measureText` returns zero width (e.g., whitespace-only text) | Guarded by the `textInput.trim()` check before any drawing occurs |
| No image loaded when user clicks with Text Tool | The `if (!image) return` guard in `handleMouseDown` prevents `saveHistory()` and overlay from opening |

---

## Testing Strategy

### Unit tests

The project currently has no test runner configured. The recommended setup is **Vitest** with **@testing-library/react** and **jsdom**, which integrates cleanly with the existing Babel config.

Install:
```
npm install --save-dev vitest @testing-library/react @testing-library/user-event jsdom
```

Unit tests should cover:

- `commitText` with `textBgEnabled = false` — verify no `fillRect` call is made.
- `commitText` with `textBgEnabled = true`, `textBgOpacity = 0` — verify no `fillRect` call.
- `commitText` with `textBgEnabled = true`, `textBgOpacity = 50` — verify `fillRect` is called with `globalAlpha = 0.5`.
- `cancelText` — verify the history stack shrinks by exactly one entry.
- `handleMouseDown` with `tool === "text"` and no image — verify `saveHistory` is not called.
- Shadow state reset — verify `ctx.shadowBlur === 0` and `ctx.shadowColor === "transparent"` after `commitText`.

### Property-based tests

Use **fast-check** for property-based testing (100+ iterations per property).

Install:
```
npm install --save-dev fast-check
```

Each property test mocks the canvas context (`getContext`) to capture draw calls and inspect state.

**Property 1 — Shadow state is always reset before text is drawn**
Generate: arbitrary prior `shadowBlur` (0–40) and `shadowColor` values; arbitrary non-empty text strings.
Assert: after `commitText`, `ctx.shadowBlur === 0` and `ctx.shadowColor === "transparent"`.
Tag: `Feature: text-tool-enhancement, Property 1: Shadow state is always reset before text is drawn`

**Property 2 — Background rectangle fully encloses text with correct color and alpha**
Generate: non-empty strings, font sizes (12–96), valid CSS hex colors, opacity values (1–100).
Assert: `fillRect` is called before `fillText`; `rect.width >= measuredWidth + 8`; `rect.height >= fontSize + 8`; top-left offset is exactly 4 px; `globalAlpha === opacity / 100`.
Tag: `Feature: text-tool-enhancement, Property 2: Background rectangle fully encloses text with correct color and alpha`

**Property 3 — Disabled or zero-opacity background produces no fillRect call**
Generate: arbitrary text strings; `textBgEnabled = false` OR `textBgOpacity = 0`.
Assert: `fillRect` is never called during `commitText`.
Tag: `Feature: text-tool-enhancement, Property 3: Disabled or zero-opacity background produces no fillRect call`

**Property 4 — Undo restores the pre-text canvas state**
Generate: arbitrary canvas data-URL strings as history entries, arbitrary non-empty text strings.
Assert: after click → commit → undo, the canvas is restored to the pre-click snapshot.
Tag: `Feature: text-tool-enhancement, Property 4: Undo restores the pre-text canvas state`

**Property 5 — Cancelling text leaves the history stack unchanged**
Generate: history stacks of length 0–20, arbitrary text strings.
Assert: after click → cancel, `history.length` equals the original length and all entries are identical.
Tag: `Feature: text-tool-enhancement, Property 5: Cancelling text leaves the history stack unchanged`
