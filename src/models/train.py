import time
import json
from pathlib import Path
import numpy as np
import pandas as pd
import joblib

from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_predict
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer, TransformedTargetRegressor
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import OneHotEncoder
from xgboost import XGBRegressor

def safe_expm1(pred):
    return np.expm1(np.clip(pred, 8.0, 16.5))

def calculate_mdape(y_true, y_pred):
    return float(np.median(np.abs((y_true - y_pred) / y_true)) * 100)

def main():
    print("=" * 65)
    print("TRAINING ADVANCED REAL-ESTATE VALUATION PIPELINE (NOMINAL USD)")
    print("=" * 65)

    data_path = Path("data/processed/properties_features.parquet")
    df = pd.read_parquet(data_path)
    initial_rows = len(df)
    print(f"Loaded {initial_rows:,} raw listings.")

    target_col = "target_price_usd"
    p_low_price, p_high_price = df[target_col].quantile(0.005), df[target_col].quantile(0.995)
    p_low_surf, p_high_surf = df["surface_total"].quantile(0.005), df["surface_total"].quantile(0.995)

    outlier_mask = (
        (df[target_col] >= p_low_price) &
        (df[target_col] <= p_high_price) &
        (df["surface_total"] >= p_low_surf) &
        (df["surface_total"] <= p_high_surf) &
        (df["surface_covered"] >= 10.0) &
        (df["surface_covered"] <= df["surface_total"] * 1.05) &
        ~((df["is_monoambiente"] == 1) & (df["surface_total"] > 150))
    )

    df_clean = df[outlier_mask].copy()
    print(f"Cleaned dataset: {len(df_clean):,} listings.")

    # --- ADVANCED FEATURE ENGINEERING FOR TAIL & LUXURY CONTROL ---
    # 1. Non-linear surface damping (diminishing marginal returns on space > 150 m2)
    df_clean["log_surface_total"] = np.log1p(df_clean["surface_total"])
    df_clean["log_surface_covered"] = np.log1p(df_clean["surface_covered"])
    df_clean["is_large_property"] = (df_clean["surface_total"] > 150).astype(int)
    df_clean["surface_over_150"] = np.maximum(0.0, df_clean["surface_total"] - 150.0)

    # 2. Luxury & high-density amenity tier
    df_clean["luxury_amenities_score"] = (
        df_clean["has_pool"] * 2 +
        df_clean["has_gym"] * 2 +
        df_clean["has_security"] * 2 +
        df_clean["has_parking"] * 3 +
        df_clean["has_sum"] * 1 +
        df_clean["has_parrilla"] * 1
    )

    y = df_clean[target_col].copy()

    leakage_cols = [
        "id", "start_date", "end_date", "created_on",
        "price", "price_usd", "price_usd_infl_adj",
        "price_usd_per_m2", "price_usd_infl_adj_per_m2",
        "target_log_price", "target_price_usd", "target_price_usd_infl_adj",
        "uncovered_ratio", "is_Casa", "is_Departamento", "is_PH",
        "dist_obelisco_km", "dist_puerto_madero_km", "dist_palermo_soho_km"
    ]

    X = df_clean.drop(columns=leakage_cols, errors="ignore").copy()
    print(f"Engineered feature matrix: {X.shape[1]} columns")

    y_bins = pd.qcut(y, q=10, labels=False, duplicates="drop")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y_bins
    )
    y_bins_train = pd.qcut(y_train, q=10, labels=False, duplicates="drop")

    cat_cols = ["barrio", "property_type"]
    num_cols = [c for c in X_train.columns if c not in cat_cols]

    cat_transformer = Pipeline([
        ("imputer", SimpleImputer(strategy="constant", fill_value="Unknown")),
        ("encoder", OneHotEncoder(handle_unknown="infrequent_if_exist", min_frequency=0.01, sparse_output=False))
    ])

    preprocessor_tree = ColumnTransformer(
        transformers=[
            ("num", SimpleImputer(strategy="median"), num_cols),
            ("cat", cat_transformer, cat_cols)
        ]
    )

    # XGBoost with Pseudo-Huber loss / Robust log regression to temper luxury tail variance
    xgb_reg = XGBRegressor(
        n_estimators=250,
        max_depth=8,
        learning_rate=0.07,
        min_child_weight=4,
        subsample=0.85,
        colsample_bytree=0.90,
        reg_alpha=1.0,
        reg_lambda=2.0,
        objective="reg:squarederror",
        random_state=42,
        n_jobs=-1,
        tree_method="hist"
    )

    champion_pipeline = Pipeline([
        ("prep", preprocessor_tree),
        ("reg", TransformedTargetRegressor(
            regressor=xgb_reg,
            func=np.log1p,
            inverse_func=safe_expm1
        ))
    ])

    print("\nRunning 5-Fold Stratified Cross-Validation...")
    skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    t0 = time.time()
    cv_preds = cross_val_predict(
        champion_pipeline,
        X_train,
        y_train,
        cv=skf.split(X_train, y_bins_train),
        n_jobs=-1
    )
    cv_time = time.time() - t0

    cv_mae = mean_absolute_error(y_train, cv_preds)
    cv_rmse = np.sqrt(mean_squared_error(y_train, cv_preds))
    cv_r2 = r2_score(y_train, cv_preds)
    cv_mdape = calculate_mdape(y_train.values, cv_preds)

    print(f"5-Fold CV completed in {cv_time:.1f}s:")
    print(f" - CV MAE:   ${cv_mae:,.2f} USD")
    print(f" - CV RMSE:  ${cv_rmse:,.2f} USD")
    print(f" - CV R2:    {cv_r2:.4f}")
    print(f" - CV MdAPE: {cv_mdape:.2f}%")

    # Fit on full training set
    print(f"\nFitting champion model on full training set ({len(X_train):,} listings)...")
    champion_pipeline.fit(X_train, y_train)

    y_test_pred = champion_pipeline.predict(X_test)
    y_test_arr = y_test.values

    test_mae = float(mean_absolute_error(y_test_arr, y_test_pred))
    test_rmse = float(np.sqrt(mean_squared_error(y_test_arr, y_test_pred)))
    test_r2 = float(r2_score(y_test_arr, y_test_pred))
    test_mdape = calculate_mdape(y_test_arr, y_test_pred)

    print("\nHOLDOUT TEST SET RESULTS:")
    print(f" - Test MAE:   ${test_mae:,.2f} USD")
    print(f" - Test RMSE:  ${test_rmse:,.2f} USD")
    print(f" - Test R2:    {test_r2:.4f}")
    print(f" - Test MdAPE: {test_mdape:.2f}%")

    # Error analysis specifically on large properties (> 150 m2)
    large_mask = X_test["surface_total"] > 150
    if large_mask.sum() > 0:
        large_mae = mean_absolute_error(y_test_arr[large_mask], y_test_pred[large_mask])
        large_mdape = calculate_mdape(y_test_arr[large_mask], y_test_pred[large_mask])
        large_r2 = r2_score(y_test_arr[large_mask], y_test_pred[large_mask])
        print(f"\nTAIL PERFORMANCE ON LARGE PROPERTIES (> 150 m², N={large_mask.sum():,}):")
        print(f" - Large Units MAE:   ${large_mae:,.2f} USD")
        print(f" - Large Units MdAPE: {large_mdape:.2f}%")
        print(f" - Large Units R2:    {large_r2:.4f}")

    # Bootstrap CIs
    rng = np.random.default_rng(42)
    boot_maes, boot_mdapes, boot_r2s = [], [], []
    n_test = len(y_test_arr)
    for _ in range(1000):
        idx = rng.choice(n_test, size=n_test, replace=True)
        boot_maes.append(mean_absolute_error(y_test_arr[idx], y_test_pred[idx]))
        boot_mdapes.append(calculate_mdape(y_test_arr[idx], y_test_pred[idx]))
        boot_r2s.append(r2_score(y_test_arr[idx], y_test_pred[idx]))

    ci_mae = [float(np.percentile(boot_maes, 2.5)), float(np.percentile(boot_maes, 97.5))]
    ci_mdape = [float(np.percentile(boot_mdapes, 2.5)), float(np.percentile(boot_mdapes, 97.5))]
    ci_r2 = [float(np.percentile(boot_r2s, 2.5)), float(np.percentile(boot_r2s, 97.5))]

    model_artifact_path = Path("models/best_property_pricing_model.joblib")
    metadata_path = Path("models/model_metadata.json")

    joblib.dump(champion_pipeline, model_artifact_path)
    print(f"\nArtifact saved to {model_artifact_path.resolve()}")

    metadata = {
        "model_name": "XGBoost Property Valuation Model (CABA) - Advanced Surface Damped",
        "algorithm": "XGBRegressor with Non-Linear Surface Damping + TransformedTargetRegressor(log1p)",
        "trained_date": time.strftime("%Y-%m-%d %H:%M:%S"),
        "train_samples": len(X_train),
        "test_samples": len(X_test),
        "features_count": X_train.shape[1],
        "target_column": target_col,
        "best_hyperparameters": {
            "n_estimators": 250,
            "max_depth": 8,
            "learning_rate": 0.07,
            "min_child_weight": 4,
            "subsample": 0.85,
            "colsample_bytree": 0.90,
            "reg_alpha": 1.0,
            "reg_lambda": 2.0
        },
        "test_metrics": {
            "mae_usd": round(test_mae, 2),
            "mae_ci_95": [round(ci_mae[0], 2), round(ci_mae[1], 2)],
            "rmse_usd": round(test_rmse, 2),
            "r2_score": round(test_r2, 4),
            "r2_ci_95": [round(ci_r2[0], 4), round(ci_r2[1], 4)],
            "mdape_percent": round(test_mdape, 2),
            "mdape_ci_95": [round(ci_mdape[0], 2), round(ci_mdape[1], 2)]
        },
        "categorical_features": cat_cols,
        "numerical_features": num_cols
    }

    with open(metadata_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=4)
    print(f"Metadata saved to {metadata_path.resolve()}")

if __name__ == "__main__":
    main()
