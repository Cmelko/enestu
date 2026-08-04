from PIL import Image
import os
import numpy as np

im = Image.open(r"C:\Users\patos\Projects\web\enestu\design\homepage.png").convert("RGB")
w, h = im.size
arr = np.array(im)
out = r"C:\Users\patos\Projects\web\enestu\assets\from-mockup"
os.makedirs(out, exist_ok=True)

# Sample colors at key rows
print("=== row colors center ===")
for y in [10, 30, 50, 70, 90, 110, 140, 200, 400, 600, 750, 850]:
    if y < h:
        print(y, tuple(arr[y, 100]), tuple(arr[y, 720]), tuple(arr[y, 1200]))

# Detect section boundaries via brightness jumps
means = arr.mean(axis=(1, 2))
k = 12
sm = np.convolve(means, np.ones(k) / k, mode="same")
diffs = np.abs(np.diff(sm))
thresh = np.percentile(diffs, 99.3)
cuts = [0]
for i, d in enumerate(diffs):
    if d > thresh and (i - cuts[-1]) > 100:
        cuts.append(int(i))
cuts.append(h - 1)
print("cuts count", len(cuts))
print(cuts)

# Save overview strips every ~700px for manual mapping
for i, y0 in enumerate(range(0, h, 700)):
    y1 = min(y0 + 700, h)
    im.crop((0, y0, w, y1)).save(os.path.join(out, f"strip_{i:02d}_{y0}.png"))

print("strips saved")
