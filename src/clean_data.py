"""Clean raw data and write processed outputs to data/processed/."""

from pathlib import Path

RAW_DIR = Path(__file__).resolve().parents[1] / "data" / "raw"
PROCESSED_DIR = Path(__file__).resolve().parents[1] / "data" / "processed"


def main() -> None:
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    # TODO: load from RAW_DIR, clean, and save to PROCESSED_DIR
    print(f"Ready to clean data from {RAW_DIR} into {PROCESSED_DIR}")


if __name__ == "__main__":
    main()
