# App screenshots

Drop real iPhone app screenshots here to replace the placeholder plates on the
homepage. **Light (paper) theme only for now** — dark comes later.

## Expected files (light, portrait PNG)

Each plate below is wired to specific device(s). Duo plates (iPhone **&** iPad)
show the iPad as the base with the iPhone tucked over its bottom-left corner.

| File | Spread | Device | App screen |
|------|--------|--------|------------|
| `today-iphone-light.png`    | Today (Plate 01)    | iPhone | Today front page |
| `today-ipad-light.png`      | Today (Plate 01)    | iPad   | Today front page |
| `schedule-ipad-light.png`   | Schedule (Plate 02) | iPad   | Schedule countdowns |
| `file-iphone-light.png`     | The File (Plate 03) | iPhone | A show's "ON FILE" detail |
| `file-ipad-light.png`       | The File (Plate 03) | iPad   | A show's "ON FILE" detail |
| `library-iphone-light.png`  | Library (Plate 04)  | iPhone | Library grid |

Later: a `*-dark.png` set if/when we wire dark-theme swapping. iPad shots are
**portrait** (≈ 1668×2388, 11").

## Specs

- **Portrait**, full-screen app capture, PNG. iPhone ≈ 1290×2796 (6.7").
- Don't pre-round the corners — the device frame masks them.
- Keep critical UI out of the top-center notch zone (the Dynamic Island overlays there).

## Wiring one in

In `index.html`, find the matching plate's `<div class="device-screen">` and
replace the `<div class="device-placeholder">…</div>` with the `<img>` shown in
the comment right above it, e.g.:

```html
<img class="device-shot" src="images/screenshots/today-iphone-light.png"
     alt="Seriel Today screen on iPhone" loading="lazy">
```

A plain `.device-shot` shows on both site themes. For later dark-swapping, use
two images with classes `shot-ink` (dark) and `shot-paper` (light).
