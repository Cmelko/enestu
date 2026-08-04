from PIL import Image
import os

src = Image.open(r"C:\Users\patos\Projects\web\enestu\design\homepage.png").convert("RGB")
out = r"C:\Users\patos\Projects\web\enestu\assets\mock"
os.makedirs(out, exist_ok=True)

def save(name, box, q=92):
    src.crop(box).save(os.path.join(out, name), quality=q, optimize=True)
    print("ok", name)

# Re-extract from better coordinates after visual review of sec crops
# Read sec-starosti to refine — use full mosaic crop and subpieces

# From mosaic crop file y offset 1480 in full image
# Pas card photo area
save("starosti-pas.jpg", (48, 1680, 920, 2180))
# Blue score card
save("starosti-score.jpg", (940, 1680, 1392, 2180))
# Bottom payment / craftsman — estimate
save("starosti-pay.jpg", (48, 2200, 700, 2680))
save("starosti-pro.jpg", (720, 2200, 1392, 2680))
# Craftsman face alone
save("pro-jan.jpg", (980, 2320, 1280, 2620))

# Services full bleed
save("services-bg.jpg", (48, 2750, 1392, 3180))

# Steps craftsman card
save("steps-pro.jpg", (48, 4150, 620, 4750))

# Yellow CTA houses
save("iso-houses.jpg", (48, 7620, 1392, 7980))

# Audience illustrations cleaner
save("ill-expat.jpg", (70, 1035, 340, 1235))
save("ill-investor.jpg", (400, 1035, 670, 1235))
save("ill-landlord.jpg", (740, 1035, 1010, 1235))
save("ill-portfolio.jpg", (1080, 1035, 1350, 1235))

# Hero
save("hero-visual.jpg", (705, 150, 1390, 670))

print("refined")
