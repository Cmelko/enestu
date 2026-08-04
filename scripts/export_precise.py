from PIL import Image

im = Image.open(r"C:\Users\patos\Projects\web\enestu\design\homepage.png").convert("RGB")
out = r"C:\Users\patos\Projects\web\enestu\assets\mock"

# Overview strips for QA
for name, y0, y1 in [
    ("ov-01-hero", 0, 700),
    ("ov-02-stats-aud", 700, 1500),
    ("ov-03-bento", 1500, 2550),
    ("ov-04-svc-app", 2550, 3950),
    ("ov-05-steps-rev", 3950, 5400),
    ("ov-06-price-faq", 5400, 7500),
    ("ov-07-cta-foot", 7500, 8391),
]:
    crop = im.crop((0, y0, 1440, y1))
    crop.resize((720, int(crop.height * 720 / 1440)), Image.Resampling.LANCZOS).save(
        f"{out}/{name}.jpg", quality=80, optimize=True
    )
    print(name, y1 - y0)

exports = {
    "s01-hero-visual": (720, 150, 1400, 680),
    "s04-bento-cards": (48, 1680, 1392, 2520),
    "s05-services": (0, 2495, 1440, 2995),
    "s06-app": (0, 2995, 1440, 3685),
    "s07-cta-band": (48, 3685, 1392, 3915),
    "s08-steps": (0, 3915, 1440, 4660),
    "s09-reviews": (0, 4660, 1440, 5380),
    "s10-pricing": (0, 5380, 1440, 6980),
    "s11-faq": (0, 6980, 1440, 7480),
    "s12-final": (0, 7480, 1440, 8120),
    "s13-footer": (0, 8120, 1440, 8391),
}
for name, box in exports.items():
    im.crop(box).save(f"{out}/{name}.jpg", quality=92, optimize=True)
    print("saved", name, box[3] - box[1])

for i, x0 in enumerate([48, 388, 728, 1068], 1):
    im.crop((x0, 1105, x0 + 324, 1485)).save(f"{out}/aud-card-{i}.jpg", quality=93, optimize=True)
print("aud done")
