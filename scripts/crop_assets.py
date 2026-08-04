from PIL import Image
import os

im = Image.open(r"C:\Users\patos\Projects\web\enestu\design\homepage.png").convert("RGBA")
w, h = im.size
out = r"C:\Users\patos\Projects\web\enestu\assets\from-mockup"
os.makedirs(out, exist_ok=True)

# Precise crops based on visual inspection of 1440-wide artboard
# Announce ~0-44, nav ~44-120, hero to ~700, stats ~700-860

crops = {
    # chrome
    "announce": (0, 0, 1440, 44),
    "nav": (0, 44, 1440, 120),
    # hero
    "hero_full": (0, 120, 1440, 700),
    "hero_photo": (700, 140, 1400, 680),
    "hero_phone": (980, 280, 1240, 720),
    # stats
    "stats": (0, 700, 1440, 880),
    # features 4 cards area - estimate from strips
    "features": (0, 880, 1440, 1450),
    # mosaic
    "mosaic": (0, 1450, 1440, 2300),
    # services strip interior
    "services_bg": (0, 2300, 1440, 2750),
    # app section
    "app": (0, 2750, 1440, 3600),
    # yellow cta banner
    "cta_yellow": (0, 3600, 1440, 3950),
    # steps
    "steps": (0, 3950, 1440, 4700),
    # testimonials
    "testimonials": (0, 4700, 1440, 5600),
    # pricing dark
    "pricing": (0, 5600, 1440, 6800),
    # faq
    "faq": (0, 6800, 1440, 7400),
    # final cta + iso
    "final": (0, 7400, 1440, 8000),
    # footer
    "footer": (0, 8000, 1440, 8391),
}

for name, box in crops.items():
    im.crop(box).save(os.path.join(out, f"{name}.png"), optimize=True)
    print(name, box)

# Also export high-quality hero photo only (try tighter)
im.crop((720, 150, 1390, 670)).save(os.path.join(out, "hero_interior.jpg"), quality=92)
print("done", len(crops))
