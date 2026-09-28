"""
Inference pipeline and scoring script.
"""

from pathlib import Path
from typing import Any, Union
import joblib
import numpy as np
import pandas as pd


def load_pipeline(model_path: Union[str, Path] = "models/best_property_pricing_model.joblib") -> Any:
    """
    Load serialized model artifact.
    """
    path = Path(model_path)
    if not path.exists():
        raise FileNotFoundError(f"Model artifact not found at: {path}")
    return joblib.load(path)


def predict(model: Any, X: pd.DataFrame) -> np.ndarray:
    """
    Generate predictions for feature matrix X.
    """
    return model.predict(X)


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Run inference using trained model")
    parser.add_argument("--model-path", default="models/best_property_pricing_model.joblib")
    parser.add_argument("--input-data", required=True, help="Path to input features (CSV or Parquet)")
    parser.add_argument("--output-preds", default="data/processed/predictions.csv")

    args = parser.parse_args()
    
    model = load_pipeline(args.model_path)
    input_path = Path(args.input_data)
    
    if input_path.suffix == ".parquet":
        X = pd.read_parquet(input_path)
    else:
        X = pd.read_csv(input_path)

    preds = predict(model, X.select_dtypes(include=[np.number]))
    out_df = pd.DataFrame({"prediction": preds})
    out_df.to_csv(args.output_preds, index=False)
    print(f"Predictions saved to {args.output_preds}")
