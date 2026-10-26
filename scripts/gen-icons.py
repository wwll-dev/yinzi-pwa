"""Rasterize the 銀子 mark into the PWA icon sizes."""

from pathlib import Path

import cairosvg

ROOT = Path(__file__).resolve().parents[1]
SVG = ROOT / "scripts" / "icon.svg"

OUTPUTS = {
    ROOT / "public" / "apple-touch-icon.png": 180,
    ROOT / "public" / "icons" / "icon-180.png": 180,
    ROOT / "public" / "icons" / "icon-192.png": 192,
    ROOT / "public" / "icons" / "icon-512.png": 512,
    ROOT / "public" / "icons" / "favicon-32.png": 32,
}


def main() -> None:
    data = SVG.read_bytes()
    for path, size in OUTPUTS.items():
        path.parent.mkdir(parents=True, exist_ok=True)
        cairosvg.svg2png(
            bytestring=data,
            write_to=str(path),
            output_width=size,
            output_height=size,
        )
        print(f"wrote {path.relative_to(ROOT)} {size}px")


if __name__ == "__main__":
    main()
