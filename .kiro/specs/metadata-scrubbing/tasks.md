# Implementation Plan: Metadata Scrubbing

## Overview

All changes are confined to `editor.js`. The canvas pipeline already strips metadata via `toDataURL()` — this implementation makes that behaviour visible through a sanitize toggle, modified export filenames, status messages, a transient badge, and tooltip wiring.

## Tasks

- [ ] 1. Add sanitize state variables
  - Add three `useState` hooks inside the `App` component: `sanitizeMode` (false), `showSanitizeBadge` (false), `sanitizeFirstUse` (true)
  - Place them alongside the existing state declarations at the top of the component
  - _Requirements: 1.2, 2.1_

- [ ] 2. Modify `exportImage` to accept a `sanitize` parameter
  - [ ] 2.1 Add optional `sanitize = false` parameter to the existing `exportImage` function signature
    - Change `link.download` to `bimp-sanitized.${format}` when `sanitize` is true, otherwise keep `bimp-export.${format}`
    - After `link.click()`, branch on `sanitize`: call `status("🛡 Exported — metadata stripped")` and trigger the badge timer; otherwise keep the existing `status(\`⬇ Saved as ${format.toUpperCase()}\`)` call
    - Badge timer: `setShowSanitizeBadge(true)` then `setTimeout(() => setShowSanitizeBadge(false), 4000)`
    - _Requirements: 2.2, 2.3, 2.4, 3.1_

  - [ ]* 2.2 Write property test for export filename (Property 3 & 4)
    - **Property 3: Sanitized export filename follows the pattern for all formats**
    - **Property 4: Non-sanitized export filename follows the existing pattern for all formats**
    - **Validates: Requirements 2.2, 2.4**

  - [ ]* 2.3 Write property test for quality/MIME consistency (Property 5)
    - **Property 5: Quality settings are identical regardless of sanitize state**
    - **Validates: Requirements 2.5**

- [ ] 3. Update all export call sites to pass `sanitizeMode`
  - Pass `sanitizeMode` as the second argument to every `exportImage(...)` call: the PNG button, the JPG button, and each item in the More ▾ / Save As dropdown
  - No logic change — existing behaviour is preserved when `sanitizeMode` is false
  - _Requirements: 2.1, 2.5_

- [ ] 4. Add the Sanitize Toggle to the export button group
  - Render a `<label>` wrapping a `<input type="checkbox">` immediately before the PNG export button in the top-bar button group
  - Label text: "🛡 Sanitize"; `title` attribute: "Strips EXIF, GPS, author, and all embedded metadata from the exported file"
  - `aria-label="Sanitize export: strip all metadata"`, `aria-checked={sanitizeMode}`
  - `checked={sanitizeMode}`, `onChange` handler: toggle `sanitizeMode`; on first activation (`sanitizeFirstUse` true) call the status message and set `sanitizeFirstUse` to false
  - Active styles: `border` and `color` use `BRAND.success`, background `${BRAND.success}18`; inactive styles use `BRAND.border` / `BRAND.textMuted`
  - `accentColor: BRAND.success` on the checkbox input; `fontSize: 12`, `minWidth: 0`
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 4.1, 4.3, 5.1, 5.2, 5.3_

  - [ ]* 4.1 Write property test for aria-checked / toggle state (Property 7 & 8)
    - **Property 7: aria-checked always reflects actual toggle state**
    - **Property 8: Keyboard toggle is a round-trip**
    - **Validates: Requirements 5.1, 5.2**

- [ ] 5. Add the Sanitize Badge to the top bar
  - Render the badge conditionally (`showSanitizeBadge &&`) adjacent to the status message area
  - Text: "🛡 Sanitized — no metadata"; `role="status"`, `aria-live="polite"`
  - Styles: `color: BRAND.success`, `background: ${BRAND.success}18`, `border: 1px solid BRAND.success`, `borderRadius: 6`, `padding: "3px 10px"`, `fontSize: 12`, `fontWeight: 700`
  - Badge is hidden when `showSanitizeBadge` is false (satisfies the "hidden when inactive" requirement)
  - _Requirements: 3.1, 3.3, 3.4, 5.4_

- [ ] 6. Wire export button tooltips to sanitize state
  - Add a helper `exportTitle(label)` that returns `"This export will strip all metadata"` when `sanitizeMode` is true, otherwise returns `label`
  - Apply `title={exportTitle(...)}` to the PNG button, JPG button, and each More ▾ dropdown item
  - _Requirements: 3.2_

  - [ ]* 6.1 Write property test for tooltip wiring (Property 6)
    - **Property 6: Export button tooltips reflect sanitize state for all buttons**
    - **Validates: Requirements 3.2**

- [ ] 7. Final checkpoint — verify all changes integrate correctly
  - Ensure all existing export paths still work with `sanitize = false` (no regression)
  - Ensure the toggle, badge, and status messages appear and disappear as specified
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- All changes are in `editor.js` only — no new files, no build step, no dependencies
- The canvas pipeline is unchanged; `toDataURL()` already strips metadata
- Each task references specific requirements for traceability
- Property tests reference the numbered properties in `design.md`
