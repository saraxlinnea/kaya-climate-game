"""Download Our World in Data CO₂ and energy datasets into data/raw/."""

from __future__ import annotations

from pathlib import Path

import requests

RAW_DIR = Path(__file__).resolve().parents[1] / "data" / "raw"

# Prefer a small number of bulk OWID extracts. The CO₂ file alone includes
# population, GDP, CO₂, and primary energy for the Kaya pipeline; the energy
# file is kept for cross-checks and later electricity-focused work.
DATASETS = {
    "owid-co2-data.csv": "https://owid-public.owid.io/data/co2/owid-co2-data.csv",
    "owid-energy-data.csv": "https://owid-public.owid.io/data/energy/owid-energy-data.csv",
}


def download_file(url: str, dest: Path, timeout: int = 180) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    print(f"Downloading {url}")
    response = requests.get(url, timeout=timeout)
    response.raise_for_status()
    dest.write_bytes(response.content)
    size_mb = dest.stat().st_size / 1e6
    print(f"  -> {dest.name} ({size_mb:.1f} MB)")


def main() -> None:
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    for filename, url in DATASETS.items():
        download_file(url, RAW_DIR / filename)
    print("Download complete.")


if __name__ == "__main__":
    main()
