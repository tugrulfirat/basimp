# Requirements Document

## Introduction

The Metadata Scrubbing feature adds an explicit "Sanitize" export mode to the bimp.us browser-based image editor. Although the existing `canvas.toDataURL()` export path already strips EXIF data by design, security-conscious users (legal, medical, journalism, and tech professionals) have no visible confirmation of this. The feature makes metadata removal visible, verifiable, and trustworthy through UI affordances: a persistent sanitize toggle, a "Sanitized" badge on exported files, and clear in-app messaging. No server-side processing is required; all sanitization is client-side.

---

## Glossary

- **Editor**: The bimp.us browser-based image editor application.
- **Sanitize_Mode**: The export state in which the Editor explicitly strips all metadata from the output image and communicates this to the user.
- **Metadata**: Embedded non-pixel data in an image file, including EXIF tags, GPS coordinates, author names, copyright strings, ICC profiles beyond sRGB, XMP data, and IPTC records.
- **Sanitize_Toggle**: The UI control (checkbox or toggle switch) that enables or disables Sanitize_Mode for the current export session.
- **Sanitize_Badge**: A visual indicator rendered in the Editor UI confirming that the exported image contains no Metadata.
- **Export_Panel**: The area of the Editor UI containing export format buttons (PNG, JPG, More ▾) and the Sanitize_Toggle.
- **Status_Bar**: The existing in-app notification area that displays transient messages such as "⬇ Saved as PNG".
- **Canvas_Pipeline**: The internal rendering path that uses `HTMLCanvasElement.toDataURL()` or `toBlob()` to produce the output image bytes.

---

## Requirements

### Requirement 1: Sanitize Toggle in Export Panel

**User Story:** As a security-conscious user, I want a clearly labelled toggle in the export area, so that I can choose to export with explicit metadata removal and know it is active before I click export.

#### Acceptance Criteria

1. THE Export_Panel SHALL display a Sanitize_Toggle labelled "Sanitize (strip metadata)" adjacent to the existing PNG and JPG export buttons.
2. WHEN the Editor first loads, THE Sanitize_Toggle SHALL default to the off (disabled) state.
3. WHEN the user activates the Sanitize_Toggle, THE Export_Panel SHALL visually distinguish the toggle as active using a colour or icon change consistent with the existing `BRAND.success` colour (`#2ECC71`).
4. WHEN the user deactivates the Sanitize_Toggle, THE Export_Panel SHALL revert the toggle to its inactive visual state.
5. THE Sanitize_Toggle SHALL persist its state across format selections (PNG, JPG, WebP, BMP) within the same editing session.

---

### Requirement 2: Sanitized Export Execution

**User Story:** As a security-conscious user, I want every export triggered while Sanitize_Mode is active to produce a file that is provably free of Metadata, so that I can share images without leaking sensitive information.

#### Acceptance Criteria

1. WHEN the user triggers an export and the Sanitize_Toggle is active, THE Canvas_Pipeline SHALL produce the output image exclusively via `HTMLCanvasElement.toDataURL()` or `HTMLCanvasElement.toBlob()`, ensuring no original file bytes are passed through.
2. WHEN the user triggers an export and the Sanitize_Toggle is active, THE Editor SHALL name the downloaded file `bimp-sanitized.<format>` (e.g., `bimp-sanitized.png`) to distinguish it from a standard export.
3. WHEN the user triggers an export and the Sanitize_Toggle is active, THE Status_Bar SHALL display the message "🛡 Exported — metadata stripped" upon download completion.
4. WHEN the user triggers an export and the Sanitize_Toggle is inactive, THE Editor SHALL follow the existing export behaviour unchanged, naming the file `bimp-export.<format>`.
5. THE Canvas_Pipeline SHALL support Sanitize_Mode for PNG, JPG, WebP, and BMP formats without degrading image quality beyond the existing per-format quality settings.

---

### Requirement 3: Sanitize Badge Confirmation

**User Story:** As a security-conscious user, I want a visible badge or confirmation in the UI after a sanitized export, so that I have a clear record that the file I downloaded is metadata-free.

#### Acceptance Criteria

1. WHEN a sanitized export completes, THE Editor SHALL display the Sanitize_Badge containing the text "🛡 Sanitized — no metadata" in the Export_Panel for a minimum of 4 seconds.
2. WHEN the Sanitize_Toggle is active and the user hovers over any export button, THE Editor SHALL display a tooltip reading "This export will strip all metadata".
3. WHEN the Sanitize_Toggle is inactive, THE Sanitize_Badge SHALL remain hidden.
4. THE Sanitize_Badge SHALL use a colour and icon consistent with the `BRAND.success` palette to signal a positive security action.

---

### Requirement 4: Informational Disclosure

**User Story:** As a first-time user of the Sanitize feature, I want a brief explanation of what metadata scrubbing does, so that I understand why it matters and can make an informed choice.

#### Acceptance Criteria

1. THE Sanitize_Toggle SHALL include an accessible `title` attribute containing the text "Strips EXIF, GPS, author, and all embedded metadata from the exported file".
2. WHEN the user activates the Sanitize_Toggle for the first time in a session, THE Status_Bar SHALL display the message "🛡 Sanitize mode on — EXIF, GPS & author data will be stripped on export".
3. THE Editor SHALL render the Sanitize_Toggle and its label at a font size no smaller than 12px to ensure legibility.

---

### Requirement 5: Accessibility

**User Story:** As a user relying on assistive technology, I want the Sanitize_Toggle to be fully keyboard-navigable and screen-reader-friendly, so that I can use the feature without a mouse.

#### Acceptance Criteria

1. THE Sanitize_Toggle SHALL be implemented as a native `<input type="checkbox">` or a `<button>` with `role="switch"` and `aria-checked` reflecting the current state.
2. WHEN the Sanitize_Toggle has keyboard focus and the user presses the Space or Enter key, THE Editor SHALL toggle the Sanitize_Mode state.
3. THE Sanitize_Toggle SHALL carry an `aria-label` attribute with the value "Sanitize export: strip all metadata".
4. THE Sanitize_Badge SHALL carry `role="status"` and `aria-live="polite"` so that screen readers announce its appearance without interrupting the user.
