from PIL import Image
import os

im = Image.open(r"C:\Users\patos\Projects\web\enestu\design\homepage.png").convert("RGB")
out = r"C:\Users\patos\Projects\web\enestu\assets\mock"
os.makedirs(out, exist_ok=True)

def save(name, box, q=93):
    path = os.path.join(out, name)
    im.crop(box).save(path, quality=q, optimize=True)
    print(name, box, os.path.getsize(path))

# Full-bleed section slices (content area ~48-1392 or full 1440)
# Measured from previous scans + strips

save("s01-hero.jpg", (0, 120, 1440, 700))
save("s01-hero-visual.jpg", (700, 145, 1392, 680))

save("s02-stats.jpg", (0, 700, 1440, 880))

# Audience block including header + 4 cards
save("s03-audience.jpg", (0, 900, 1440, 1480))
# Individual audience cards (full card including text) for responsive stack
# cards ~ y 1080-1440, x gaps
save("aud-card-1.jpg", (48, 1085, 370, 1455))
save("aud-card-2.jpg", (388, 1085, 710, 1455))
save("aud-card-3.jpg", (728, 1085, 1050, 1455))
save("aud-card-4.jpg", (1068, 1085, 1390, 1455))

# Bento full
save("s04-bento.jpg", (0, 1520, 1440, 2520))
save("s04-bento-cards.jpg", (48, 1645, 1392, 2485))

# Services
save("s05-services.jpg", (48, 2580, 1392, 3180))

# App section
save("s06-app.jpg", (0, 3200, 1440, 4050))

# Yellow CTA band
save("s07-cta-band.jpg", (48, 3680, 1392, 3920))

# Steps
save("s08-steps.jpg", (0, 4000, 1440, 4850))

# Testimonials
save("s09-reviews.jpg", (0, 4880, 1440, 5750))

# Pricing
save("s10-pricing.jpg", (0, 5750, 1440, 7050))

# FAQ + final CTA + iso
save("s11-faq-final.jpg", (0, 7050, 1440, 8050))

# Footer
save("s12-footer.jpg", (0, 8050, 1440, 8391))

# Nav reference
save("s00-nav.jpg", (0, 0, 1440, 120))

print("DONE")
