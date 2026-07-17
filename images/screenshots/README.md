# App screenshots

Drop real iPhone app screenshots here to replace the placeholder plates on the
homepage. **Light (paper) theme only for now** — dark comes later.

## Expected files (light, iPhone, portrait PNG)

| File | Spread | App screen |
|------|--------|------------|
| `today-iphone-light.png`    | Today (Plate 01)      | Today front page |
| `schedule-iphone-light.png` | Schedule (Plate 02)   | Schedule countdowns |
| `file-iphone-light.png`     | The File (Plate 03)   | A show's "ON FILE" detail |
| `library-iphone-light.png`  | Library (Plate 04)    | Library grid |
| `record-iphone-light.png`   | The Record (Plate 05) | Profile → The Record |

Later: `file-ipad-light.png` (iPad, portrait) for the paired File plate, and a
`*-dark.png` set if/when we wire dark-theme swapping.

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
