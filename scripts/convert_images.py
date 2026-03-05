from PIL import Image
import os

base = r"d:\TFT-hoho"

# 1. augment-tree.png -> WebP
src1 = os.path.join(base, "src", "assets", "augment-tree", "augment-tree.png")
dst1 = os.path.join(base, "src", "assets", "augment-tree", "augment-tree.webp")
img = Image.open(src1)
print(f"Original augment-tree: {img.size}, {os.path.getsize(src1)} bytes")
ratio = 200 / img.width
new_size = (200, int(img.height * ratio))
img_resized = img.resize(new_size, Image.LANCZOS)
img_resized.save(dst1, "WEBP", quality=80)
print(
    f"New augment-tree.webp: {img_resized.size}, {os.path.getsize(dst1)} bytes")

# 2. gold.png -> WebP
src2 = os.path.join(base, "src", "assets", "golds", "gold.png")
dst2 = os.path.join(base, "src", "assets", "golds", "gold.webp")
img2 = Image.open(src2)
print(f"Original gold.png: {img2.size}, {os.path.getsize(src2)} bytes")
img2_resized = img2.resize((64, 64), Image.LANCZOS)
img2_resized.save(dst2, "WEBP", quality=85)
print(f"New gold.webp: {img2_resized.size}, {os.path.getsize(dst2)} bytes")

print("Done!")
