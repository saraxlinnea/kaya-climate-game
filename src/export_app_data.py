"""Copy processed CSVs into app/public/data for the Vite explorer."""

from __future__ import annotations

import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PROCESSED = ROOT / "data" / "processed"
APP_DATA = ROOT / "app" / "public" / "data"

FILES = ("kaya_dataset.csv", "kaya_scores.csv")


def main() -> None:
    APP_DATA.mkdir(parents=True, exist_ok=True)
    for name in FILES:
        src = PROCESSED / name
        if not src.exists():
            raise FileNotFoundError(
                f"Missing {src}. Run the data pipeline and: python src/kaya_score.py"
            )
        dest = APP_DATA / name
        shutil.copy2(src, dest)
        print(f"Copied {src.name} -> {dest} ({dest.stat().st_size / 1e6:.2f} MB)")


if __name__ == "__main__":
    main()
