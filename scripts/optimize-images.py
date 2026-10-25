"""Create web-ready copies of the Vorthak marketing renders.

The originals in the marketing folder are never modified. Each output is a
resized/re-encoded copy of a real Unity render; nothing is repainted.

Usage:
    python scripts/optimize-images.py "D:/IAS/AssetStore/MON001_Marketing"

Writes images to public/images/products/vorthak/ and their real pixel sizes
to data/media-manifest.json, which the site build reads for width/height.
"""
import json
import shutil
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "public" / "images" / "products" / "vorthak"
MANIFEST = ROOT / "data" / "media-manifest.json"
PUBLIC_PREFIX = "images/products/vorthak/"

# public key -> (source path relative to the marketing folder, widths to emit)
SCREENSHOT_WIDTHS = [800, 1920]
SOURCES = {
    "hero-transparent": ("Source/Transparent/MON001_Transparent_threequarter_2400x2400.png", [480, 700, 1200]),
    "card": ("KeyImages/MON001_Card_420x280.png", [420]),
    "card-2x": ("Source/RawRenders/k_card_1260x840.png", [840]),
    "01-hero-three-quarter": ("Screenshots/01_Hero_ThreeQuarter.png", SCREENSHOT_WIDTHS),
    "02-front-view": ("Screenshots/02_Front_View.png", SCREENSHOT_WIDTHS),
    "03-back-view": ("Screenshots/03_Back_View.png", SCREENSHOT_WIDTHS),
    "04-side-view": ("Screenshots/04_Side_View.png", SCREENSHOT_WIDTHS),
    "05-closeup-details": ("Screenshots/05_Closeup_Details.png", SCREENSHOT_WIDTHS),
    "06-rig-wireframe": ("Screenshots/06_Rig_Wireframe.png", SCREENSHOT_WIDTHS),
    "07-attack-action": ("Screenshots/07_Attack_Action.png", SCREENSHOT_WIDTHS),
    "08-unity-demo": ("Screenshots/08_Unity_Demo.png", SCREENSHOT_WIDTHS),
    "09-animations-overview": ("Screenshots/09_Animations_Overview.png", SCREENSHOT_WIDTHS),
}
SOCIAL_SOURCE = "KeyImages/MON001_Social_1200x630.png"
VIDEO_SOURCE = "Videos/MON001_Vorthak_Showcase_1080p30.mp4"


def resize(img, width):
    if img.width <= width:
        return img
    height = round(img.height * width / img.width)
    return img.resize((width, height), Image.LANCZOS)


def main(src_root):
    src_root = Path(src_root)
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    manifest = {}

    for key, (rel, widths) in SOURCES.items():
        img = Image.open(src_root / rel)
        img.load()
        if img.mode == "RGBA":
            # Trim empty transparent margins so the hero frames the model, not padding.
            img = img.crop(img.getchannel("A").getbbox())
        else:
            img = img.convert("RGB")
        variants = []
        for width in widths:
            out = resize(img, width)
            name = f"vorthak-{key}-{out.width}.webp"
            out.save(OUT_DIR / name, "WEBP", quality=82, method=6)
            variants.append({"src": PUBLIC_PREFIX + name, "width": out.width, "height": out.height})
        manifest[key] = variants

    social = Image.open(src_root / SOCIAL_SOURCE).convert("RGB")
    social.save(OUT_DIR / "vorthak-social-1200x630.jpg", "JPEG", quality=85, optimize=True, progressive=True)
    manifest["social"] = [{"src": PUBLIC_PREFIX + "vorthak-social-1200x630.jpg", "width": social.width, "height": social.height}]

    video_src = src_root / VIDEO_SOURCE
    if video_src.exists():
        shutil.copyfile(video_src, OUT_DIR / "vorthak-showcase-1080p.mp4")
        manifest["video"] = [{"src": PUBLIC_PREFIX + "vorthak-showcase-1080p.mp4", "width": 1920, "height": 1080}]

    MANIFEST.parent.mkdir(exist_ok=True)
    MANIFEST.write_text(json.dumps({"vorthak": manifest}, indent=2) + "\n", encoding="utf-8")
    total = sum(p.stat().st_size for p in OUT_DIR.iterdir())
    print(f"Wrote {len(list(OUT_DIR.iterdir()))} files, {total / 1e6:.1f} MB to {OUT_DIR}")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "D:/IAS/AssetStore/MON001_Marketing")
