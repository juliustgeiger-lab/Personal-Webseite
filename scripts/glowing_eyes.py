from PIL import Image, ImageDraw, ImageFilter, ImageChops

SRC = "public/Grafics/Monkey White.png"
OUT = "public/Grafics/monkey_glowing_eyes.png"

src = Image.open(SRC).convert("RGBA")
W, H = src.size
eyes = [(int(0.625 * W), int(0.420 * H)), (int(0.715 * W), int(0.425 * H))]
core_px = int(0.006 * W)
halo_px = int(0.032 * W)

print(f"W={W} H={H}")
print(f"eye1=({eyes[0][0]}, {eyes[0][1]})  eye2=({eyes[1][0]}, {eyes[1][1]})")
print(f"core_px={core_px}  halo_px={halo_px}")

# 1. Halo layer on black background (RGB so additive blend works as expected)
glow = Image.new("RGB", (W, H), (0, 0, 0))
gd = ImageDraw.Draw(glow)
for cx, cy in eyes:
    gd.ellipse(
        [cx - halo_px, cy - halo_px, cx + halo_px, cy + halo_px],
        fill=(200, 200, 210),
    )
glow = glow.filter(ImageFilter.GaussianBlur(radius=halo_px * 0.55))

# 2. Inner glow ring, slightly brighter
gd2 = ImageDraw.Draw(glow)
for cx, cy in eyes:
    gd2.ellipse(
        [cx - core_px * 2, cy - core_px * 2, cx + core_px * 2, cy + core_px * 2],
        fill=(240, 240, 245),
    )
glow = glow.filter(ImageFilter.GaussianBlur(radius=core_px * 0.6))

# 3. Hot white cores on top (sharp)
gd3 = ImageDraw.Draw(glow)
for cx, cy in eyes:
    gd3.ellipse(
        [cx - core_px, cy - core_px, cx + core_px, cy + core_px],
        fill=(255, 255, 255),
    )

# 4. Additive composite onto source RGB, then re-attach original alpha
src_rgb = src.convert("RGB")
combined = ImageChops.add(src_rgb, glow)
out = Image.merge("RGBA", (*combined.split(), src.split()[3]))
out.save(OUT)
print(f"saved -> {OUT}")
