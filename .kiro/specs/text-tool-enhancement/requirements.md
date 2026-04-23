# Requirements Document

## Introduction

This feature enhances the Text Tool in the bimp.us browser-based image editor. Three specific problems are addressed:

1. The text tool applies a hardcoded drop shadow (`shadowColor: "rgba(0,0,0,0.6)", shadowBlur: 4`) that produces an unwanted dark halo around text, especially on light images.
2. There is no way for users to add a background color behind text — a common need when annotating screenshots or images where the text color alone does not provide enough contrast.
3. The undo history snapshot is saved *after* text is committed to the canvas, meaning undo restores the state *with* the text rather than the state *before* it, breaking the undo contract shared by all other tools.

## Glossary

- **Editor**: The bimp.us React application rendered in `editor.jsx`.
- **Canvas**: The HTML5 `<canvas>` element on which all image edits are applied.
- **Text Tool**: The Editor tool (shortcut `T`) that places user-typed text onto the Canvas.
- **Text Input Overlay**: The floating `<input>` element shown at the click position while the user types text before committing it.
- **commitText**: The function in the Editor that renders the typed text onto the Canvas and closes the Text Input Overlay.
- **History**: The ordered list of Canvas data-URL snapshots used by the undo mechanism.
- **Text Background**: An optional filled rectangle drawn behind text characters on the Canvas.
- **Background Opacity**: A value in the range 0–100 (percent) controlling the alpha of the Text Background fill.
- **drawColor**: The existing Editor state variable that controls the foreground color of text, arrows, and freehand drawing.
- **Right Panel**: The 200 px sidebar shown on the right side of the Editor when an image is loaded, containing per-tool controls.

## Requirements

### Requirement 1: Remove Hardcoded Text Shadow

**User Story:** As an image editor user, I want text placed on my image to have no automatic shadow, so that the text appears exactly as styled without unexpected dark artifacts.

#### Acceptance Criteria

1. WHEN the user commits text via the Text Tool, THE Editor SHALL render the text onto the Canvas without applying any `shadowColor` or `shadowBlur` effect.
2. THE Editor SHALL reset `ctx.shadowBlur` to `0` and `ctx.shadowColor` to `"transparent"` before rendering text characters, so that no residual shadow state from prior canvas operations affects the text.

---

### Requirement 2: Optional Text Background Color

**User Story:** As an image editor user, I want to optionally place a solid or semi-transparent colored rectangle behind my text, so that my annotations remain readable regardless of the underlying image content.

#### Acceptance Criteria

1. WHEN the Text Tool is active, THE Right Panel SHALL display a "Text Background" toggle that enables or disables the Text Background feature.
2. WHEN the Text Background toggle is disabled, THE Editor SHALL render text onto the Canvas with no background rectangle.
3. WHEN the Text Background toggle is enabled, THE Right Panel SHALL display a color picker for the Text Background color.
4. WHEN the Text Background toggle is enabled, THE Right Panel SHALL display a Background Opacity slider with a range of 0 to 100 (percent).
5. WHEN the user commits text and the Text Background toggle is enabled, THE Editor SHALL draw a filled rectangle behind the text characters using the selected Text Background color at the selected Background Opacity before drawing the text characters.
6. WHEN computing the Text Background rectangle dimensions, THE Editor SHALL derive the rectangle width and height from `ctx.measureText` and the current font size so that the rectangle tightly encloses the rendered text with a consistent padding of 4 canvas pixels on each side.
7. WHEN the Text Background toggle is enabled and Background Opacity is set to 0, THE Editor SHALL draw no visible background rectangle (fully transparent).
8. WHEN the Text Background toggle is enabled and Background Opacity is set to 100, THE Editor SHALL draw a fully opaque background rectangle.
9. THE Editor SHALL persist the Text Background toggle state, background color, and Background Opacity across multiple text placements within the same session.

---

### Requirement 3: Correct Undo History for Text

**User Story:** As an image editor user, I want the undo action to restore the canvas to the state it was in before I placed text, so that the Text Tool behaves consistently with all other editing tools.

#### Acceptance Criteria

1. WHEN the user clicks the Canvas with the Text Tool active, THE Editor SHALL save the current Canvas state to History before opening the Text Input Overlay.
2. WHEN the user commits text via the Text Tool, THE Editor SHALL NOT save an additional History snapshot inside `commitText`.
3. WHEN the user presses Undo after committing text, THE Editor SHALL restore the Canvas to the state captured before the text was placed.
4. WHEN the user opens the Text Input Overlay and then cancels (presses Escape or closes without committing), THE Editor SHALL discard the History snapshot saved at click time so that the History stack is not polluted by cancelled text operations.
5. IF the Canvas has no image loaded, THEN THE Editor SHALL NOT save a History snapshot when the user clicks with the Text Tool active.
