# Implementation Plan: Text Tool Enhancement

## Overview

All changes are confined to `editor.jsx`. The implementation covers three targeted fixes in order of dependency: (1) remove the hardcoded shadow, (2) add optional text background controls, and (3) fix the undo history ordering. A `cancelText` helper is introduced to support both the undo fix and the empty-commit guard. Tests use Vitest + fast-check, which must be installed before the test tasks run.

## Tasks

- [x] 1. Remove hardcoded text shadow
  - In `commitText`, set `ctx.shadowBlur = 0` and `ctx.shadowColor = "transparent"` immediately after obtaining the canvas context, before any drawing
  - Remove the existing `ctx.shadowColor = "rgba(0,0,0,0.6)"` and `ctx.shadowBlur = 4` lines
  - _Requirements: 1.1, 1.2_

- [x] 2. Fix undo history ordering
  - [x] 2.1 Add `cancelText` helper
    - Add `const cancelText = () => { setHistory(h => h.slice(0, -1)); setTextInput(""); setShowTextBox(false); setTextPos(null); };` inside the component
    - Update the `onKeyDown` handler on the Text Input Overlay to call `cancelText()` on `Escape`
    - _Requirements: 3.4_
  - [x] 2.2 Move `saveHistory()` to `handleMouseDown`
    - In `handleMouseDown`, when `tool === "text"` and `image` is truthy, call `saveHistory()` before `setTextPos` and `setShowTextBox(true)`
    - Remove the `saveHistory()` call from inside `commitText`
    - In `commitText`, replace the empty-commit guard `setShowTextBox(false)` with `cancelText()` so the snapshot is discarded on empty commits
    - _Requirements: 3.1, 3.2, 3.3_

- [x] 3. Add text background state variables
  - Add `const [textBgEnabled, setTextBgEnabled] = useState(false);`
  - Add `const [textBgColor, setTextBgColor] = useState("#000000");`
  - Add `const [textBgOpacity, setTextBgOpacity] = useState(80);`
  - _Requirements: 2.1, 2.9_

- [x] 4. Add Text Background controls to the Right Panel
  - Below the existing Font Size slider (inside the `tool === "text"` block in the Right Panel), add:
    - A labelled toggle bound to `textBgEnabled` / `setTextBgEnabled`
    - Conditionally (when `textBgEnabled === true`): a color picker bound to `textBgColor` / `setTextBgColor`
    - Conditionally (when `textBgEnabled === true`): a range slider (0–100) bound to `textBgOpacity` / `setTextBgOpacity`, labelled "Background Opacity — {textBgOpacity}%"
  - Match the visual style of the existing Font Size slider and Color picker
  - _Requirements: 2.1, 2.3, 2.4, 2.9_

- [x] 5. Implement background rectangle drawing in `commitText`
  - After setting `ctx.font` and before `ctx.fillText`, add:
    ```js
    if (textBgEnabled && textBgOpacity > 0) {
      const metrics = ctx.measureText(textInput);
      const pad = 4;
      ctx.save();
      ctx.globalAlpha = textBgOpacity / 100;
      ctx.fillStyle = textBgColor;
      ctx.fillRect(
        textPos.x - pad,
        textPos.y - fontSize - pad,
        metrics.width + pad * 2,
        fontSize + pad * 2
      );
      ctx.restore();
    }
    ```
  - _Requirements: 2.2, 2.5, 2.6, 2.7, 2.8_

## Notes

- All changes are in `editor.jsx` only
- After editing `editor.jsx`, the Babel transpile step must be run to update `editor.js` (which is what `app.html` actually loads)
