"""Optional asset-maintenance helper; Pillow is not needed to install/build the website."""
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1]
source = root / "public/picture/pic-1.png"
target = root / "public/picture/pic-1.webp"
with Image.open(source) as original:
    # No resize, quantization, or quality loss. Strip unnecessary editorial metadata.
    pixels = original.convert("RGBA")
    options = {"lossless": True, "quality": 100, "method": 6, "exact": True}
    if original.info.get("icc_profile"):
        options["icc_profile"] = original.info["icc_profile"]
    pixels.save(target, "WEBP", **options)
    with Image.open(target) as encoded:
        assert encoded.size == pixels.size
        assert encoded.convert("RGBA").tobytes() == pixels.tobytes(), "Pixel verification failed"
print(f"PNG: {source.stat().st_size} bytes; lossless WebP: {target.stat().st_size} bytes; RGBA pixels identical")
