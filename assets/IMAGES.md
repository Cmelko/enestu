# Brand & content assets — drop files here

Replace Unsplash placeholders in HTML once files are ready.

## Expected files

| Path | Use |
|------|-----|
| `images/hero-interior.jpg` | Homepage hero background (@2x, ~2400px) |
| `images/services-interior.jpg` | „Vyřešíte“ strip |
| `images/craftsman.jpg` | Remeselník / process section |
| `images/case-study.jpg` | Case study (if added) |
| `images/phone-hari.webp` | Optional phone UI export |
| `illustrations/houses.svg` | Isometric houses from Figma |
| `illustrations/coins.svg` | Coins / vault motifs |
| `avatars/eva.jpg` … | Testimonial photos |
| `logo-wordmark.svg` | Optional wordmark |

## Kapacity mapy

Edit `js/regions.json` — `slots`, `taken`, `trades` per kraj.

## After dropping images

Update `url(...)` in `css/style.css` and inline backgrounds in `index.html` to point at `/assets/images/...`.
