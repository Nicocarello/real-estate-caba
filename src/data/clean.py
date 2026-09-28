"""
Data ingestion and cleaning routines for real estate listings.
"""

from pathlib import Path
from typing import Union, List, Optional
import pandas as pd
import numpy as np


LOCATION_COLUMNS_MAPPING = {
    "l1": "country",
    "l2": "province",
    "l3": "state",
    "l4": "neighbourhood",
}


def load_raw_data(filepath: Union[str, Path], nrows: Optional[int] = None) -> pd.DataFrame:
    """
    Load raw CSV data from the specified path.
    """
    path = Path(filepath)
    if not path.exists():
        raise FileNotFoundError(f"Raw data file not found at: {path}")
    return pd.read_csv(path, nrows=nrows, low_memory=False)


def drop_duplicate_ids(df: pd.DataFrame, subset: Optional[List[str]] = None) -> pd.DataFrame:
    """
    Drop duplicate records by unique property ID.
    """
    if subset is None:
        subset = ["id"]
    return df.drop_duplicates(subset=subset).copy()


def rename_location_columns(df: pd.DataFrame) -> pd.DataFrame:
    """
    Rename raw geographical level columns:
    - l1 -> country
    - l2 -> province
    - l3 -> state
    - l4 -> neighbourhood
    """
    return df.rename(columns=LOCATION_COLUMNS_MAPPING)


def filter_property_types(
    df: pd.DataFrame,
    valid_types: Optional[List[str]] = None,
) -> pd.DataFrame:
    """
    Keep only specified property types (default: 'departamento', 'casa', 'ph').
    """
    if valid_types is None:
        valid_types = ["departamento", "casa", "ph"]
    valid_types_lower = [t.lower() for t in valid_types]
    if "property_type" in df.columns:
        return df[df["property_type"].astype(str).str.lower().isin(valid_types_lower)].copy()
    return df.copy()


def clean_properties_dataset(
    df: pd.DataFrame,
    country_filter: Optional[str] = "Argentina",
    property_type_filter: Optional[List[str]] = ("departamento", "casa", "ph"),
    drop_na_price: bool = True,
) -> pd.DataFrame:
    """
    Execute standard structural validation and cleaning routines:
    1. Drop duplicate property IDs.
    2. Standardize column names (l1-l4 to geographical names).
    3. Filter country if specified.
    4. Filter property types (Departamento, Casa, PH).
    5. Handle invalid or missing target prices.
    6. Parse dates.
    """
    cleaned_df = drop_duplicate_ids(df)
    cleaned_df = rename_location_columns(cleaned_df)

    if country_filter and "country" in cleaned_df.columns:
        cleaned_df = cleaned_df[cleaned_df["country"] == country_filter].copy()

    if property_type_filter:
        cleaned_df = filter_property_types(cleaned_df, list(property_type_filter))

    if drop_na_price and "price" in cleaned_df.columns:
        cleaned_df = cleaned_df.dropna(subset=["price"]).copy()
        cleaned_df = cleaned_df[cleaned_df["price"] > 0].copy()

    for date_col in ["start_date", "end_date", "created_on"]:
        if date_col in cleaned_df.columns:
            cleaned_df[date_col] = pd.to_datetime(cleaned_df[date_col], errors="coerce")

    return cleaned_df


if __name__ == "__main__":
    raw_path = Path("data/raw/ar_properties_crude.csv")
    interim_dir = Path("data/interim")
    parquet_path = interim_dir / "properties_cleaned.parquet"
    csv_path = interim_dir / "properties_cleaned.csv"

    if raw_path.exists():
        print(f"Loading raw data from {raw_path}...")
        df_raw = load_raw_data(raw_path, nrows=50000)
        df_clean = clean_properties_dataset(df_raw)

        interim_dir.mkdir(parents=True, exist_ok=True)

        try:
            df_clean.to_parquet(parquet_path, index=False)
            output_path = parquet_path
        except ImportError:
            df_clean.to_csv(csv_path, index=False)
            output_path = csv_path

        print(f"Successfully cleaned {len(df_clean)} rows and saved to {output_path}")
    else:
        print(f"Raw data file {raw_path} not found. Clean script ready for invocation.")
