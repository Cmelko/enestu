from PIL import Image
import os

im = Image.open(r"C:\Users\patos\Projects\web\enestu\design\homepage.png").convert("RGB")
out = r"C:\Users\patos\Projects\web\enestu\assets\mock"
os.makedirs(out, exist_ok=True)

# Save finer vertical strips around likely mosaic / craftsman zones for manual coord pick
for y0 in range(1400, 3200, 200):
    im.crop((0, y0, 1440, min(y0 + 220, im.size[1]))).save(
        os.path.join(out, f"scan_{y0}.jpg"), quality=85
    )
print("scans saved")

# Also sample mean color to find photo regions (not near-white)
import numpy as np
arr = np.array(im)
# find rows that are photo-like (variance high, not white)
for y in range(1500, 2800, 40):
    row = arr[y, 100:700]
    mean = row.mean(axis=0)
    std = row.std()
    if std > 35 and mean[0] < 240:
        print(f"y={y} mean={tuple(mean.astype(int))} std={std:.1f}")
