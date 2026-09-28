"""
Feature engineering pipelines, transformations, categorical encodings, and scaling.
"""

from typing import List, Optional, Tuple
import pandas as pd
import numpy as np


def create_engineered_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Generate derived domain features:
    - surface ratios (covered / total)
    - room / bedroom density
    - log transformations for skewed variables
    """
    res = df.copy()

    # Surface ratio
    if "surface_total" in res.columns and "surface_covered" in res.columns:
        res["covered_ratio"] = (
            res["surface_covered"] / res["surface_total"].replace(0, np.nan)
        ).clip(0, 1)

    # Room density
    if "rooms" in res.columns and "bedrooms" in res.columns:
        res["rooms_per_bedroom"] = (
            res["rooms"] / res["bedrooms"].replace(0, np.nan)
        ).clip(0, 5)

    # Surface per room
    if "surface_total" in res.columns and "rooms" in res.columns:
        res["surface_per_room"] = (
            res["surface_total"] / res["rooms"].replace(0, np.nan)
        )

    return res


def encode_categorical_features(
    df: pd.DataFrame,
    categorical_columns: Optional[List[str]] = None,
    drop_first: bool = True,
) -> pd.DataFrame:
    """
    One-hot encode categorical features.
    """
    if categorical_columns is None:
        categorical_columns = ["property_type", "operation_type", "province", "state"]

    cols_to_encode = [c for c in categorical_columns if c in df.columns]
    return pd.get_dummies(df, columns=cols_to_encode, drop_first=drop_first)


def prepare_modeling_features(
    df: pd.DataFrame,
    target_col: str = "price",
    drop_cols: Optional[List[str]] = None,
) -> Tuple[pd.DataFrame, pd.Series]:
    """
    Prepares X and y feature sets ready for model training:
    1. Feature engineering
    2. Categorical encoding
    3. Dropping metadata/text identifiers
    """
    if drop_cols is None:
        drop_cols = ["id", "title", "description", "start_date", "end_date", "created_on", "currency"]

    df_feats = create_engineered_features(df)
    df_encoded = encode_categorical_features(df_feats)

    y = df_encoded[target_col] if target_col in df_encoded.columns else None
    
    cols_to_drop = [c for c in drop_cols + [target_col] if c in df_encoded.columns]
    X = df_encoded.drop(columns=cols_to_drop).select_dtypes(include=[np.number])

    return X, y
