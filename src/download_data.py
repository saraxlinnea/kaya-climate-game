"""Download raw climate / emissions data into data/raw/."""

from pathlib import Path

RAW_DIR = Path(__file__).resolve().parents[1] / "data" / "raw"


def main() -> None:
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    # TODO: fetch source datasets
    print(f"Ready to download data into {RAW_DIR}")


if __name__ == "__main__":
    main()
