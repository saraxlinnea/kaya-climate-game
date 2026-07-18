"""Calculate Kaya identity components from processed data.

Kaya identity:
    CO2 = Population × (GDP / Population) × (Energy / GDP) × (CO2 / Energy)
"""

from pathlib import Path

PROCESSED_DIR = Path(__file__).resolve().parents[1] / "data" / "processed"


def main() -> None:
    # TODO: load processed data and compute Kaya factors
    print(f"Ready to calculate Kaya identity from {PROCESSED_DIR}")


if __name__ == "__main__":
    main()
