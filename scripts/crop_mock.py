from PIL import Image
import os

src = Image.open(r"C:\Users\patos\Projects\web\enestu\design\homepage.png").convert("RGB")
w, h = src.size
out = r"C:\Users\patos\Projects\web\enestu\assets\mock"
os.makedirs(out, exist_ok=True)

def save(name, box, q=90):
    src.crop(box).save(os.path.join(out, name), quality=q, optimize=True)
    print(name, box)

# Logo mark from nav
save("logo-mark.png", (48, 58, 88, 105))

# Hero visual as designed (photo + phone) — use as single asset for fidelity
save("hero-visual.jpg", (700, 145, 1395, 675), 92)

# Stats is text — skip

# Audience card illustrations (from features strip ~880-1450)
# 4 cards roughly at x: 48-360, 380-700, 720-1040, 1060-1390; y illust ~1020-1220
save("aud-1.jpg", (60, 1020, 350, 1240), 92)
save("aud-2.jpg", (390, 1020, 680, 1240), 92)
save("aud-3.jpg", (730, 1020, 1020, 1240), 92)
save("aud-4.jpg", (1070, 1020, 1360, 1240), 92)

# Mosaic / tři starosti — need better y. Look at strip_02 starting 1400
# Recrop wider sections for compositing
save("sec-audience.jpg", (0, 880, 1440, 1480), 88)
save("sec-starosti.jpg", (0, 1480, 1440, 2480), 88)
save("sec-services.jpg", (0, 2480, 1440, 3100), 88)
save("sec-app.jpg", (0, 3100, 1440, 4000), 88)
save("sec-steps.jpg", (0, 4000, 1440, 4900), 88)
save("sec-testimonials.jpg", (0, 4900, 1440, 5750), 88)
save("sec-pricing.jpg", (0, 5750, 1440, 7000), 88)
save("sec-faq-cta.jpg", (0, 7000, 1440, 8000), 88)
save("sec-footer.jpg", (0, 8000, 1440, 8391), 88)

# Extract phone-only-ish and interiors from hero
save("hero-interior-only.jpg", (720, 160, 1380, 660), 92)

print("done")
