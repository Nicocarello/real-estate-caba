# CABA Real Estate Property Valuation & Machine Learning Engine

An end-to-end Machine Learning real estate valuation system for **Capital Federal (CABA), Argentina**. Features automated address geocoding via official GCBA USIG APIs, an XGBoost champion regression model with non-linear surface damping, micro-market qualitative calibrations, and a dual frontend interface (Vanilla Web UI & React 19 / Material UI 6).

---

## Highlights & Model Performance

- **Predictive Accuracy**: Certified on 5-Fold Stratified Cross-Validation and holdout test sets ($R^2 = 0.906$, $\text{MdAPE} = 10.37\%$, $\text{MAE} = \$32,263\text{ USD}$).
- **Real-World Validation**: Evaluated against live listings scraped from **Zonaprop CABA**, achieving a **12.70% Median Absolute Error**.
- **Market Alignment**: Modeled in nominal cash USD to reflect Argentine market transaction realities (bypassing synthetic US-CPI inflation distortions).
- **Domain-Specific Calibrations**:
  - Non-linear surface damping to capture diminishing marginal returns on large floorplans ($> 150\text{ m}^2$).
  - Walk-up apartment adjustments (*"por escalera"*, -15%).
  - Disposition discounts (*"contrafrente"* -4%, *"interno"* -10%).
  - Dynamic heteroskedastic uncertainty bands (graduating from 10.4% up to 20% on luxury/penthouse units).
- **Official GCBA USIG Geocoding**: Free, accurate coordinate mapping across Buenos Aires streets and intersections with automatic centroid fallback.

---

## Project Structure

```text
.
├── app.py                           # Python HTTP valuation microservice & static file server (:8501)
├── configs/                         # Model configuration & paths
│   └── config.yaml
├── data/
│   ├── raw/                         # Raw listings (ignored by git, preserved via .gitkeep)
│   ├── interim/                     # Cleaned intermediate parquet data
│   └── processed/                   # Feature-engineered dataset
├── frontend/                        # Modern React 19 + TypeScript + Material UI 6 Web App (:5173)
│   ├── src/                         # Components, design tokens, hooks, API client
│   ├── package.json
│   └── vite.config.ts
├── models/                          # Production serialized model artifacts
│   ├── best_property_pricing_model.joblib # Champion XGBoost model artifact (2.65 MB)
│   ├── barrios_caba_metadata.json   # CABA neighborhood centroids & frequencies
│   └── model_metadata.json          # Training provenance, hyperparams & test metrics
├── notebooks/                       # Modular analytical pipeline
│   ├── 01_data_cleaning.ipynb       # Structural validation, NaN audit, parsing, column renaming
│   ├── 02_eda_exploration.ipynb     # Spatial analysis, distributions, and IQR bounds
│   ├── 03_feature_engineering.ipynb # Amenities regex, ratios, and encodings
│   └── 04_model_benchmarking.ipynb  # Benchmark suite, CV, SHAP explainability, and certification
├── reports/
│   └── figures/                     # SHAP plots, residual diagnostics, correlation heatmaps
├── src/                             # Production Python package
│   ├── data/clean.py                # Data cleaning and ingestion
│   ├── features/build_features.py   # Feature transformers and ratios
│   └── models/
│       ├── appraiser.py             # End-to-end appraisal service (USIG + XGBoost + Calibrations)
│       ├── train.py                 # Full model training and serialization pipeline
│       └── predict.py               # Batch scoring script
├── tests/                           # Unit tests for preprocessing & feature pipelines
├── web/                             # Zero-dependency Vanilla HTML5/CSS3/JS Web UI
├── requirements.txt                 # Python dependencies
└── README.md
```

---

## Quickstart & Local Execution

### 1. Python Environment Setup

```bash
# Clone the repository
git clone https://github.com/your-username/properati-real-estate-valuation.git
cd properati-real-estate-valuation

# Create and activate virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1    # On Windows (or source venv/bin/activate on Linux/macOS)

# Install dependencies
pip install -r requirements.txt
```

### 2. Launch the Valuation Web App

#### Option A: Lightweight Python Microservice & Web UI (Port 8501)
Zero extra frontend dependencies required:
```bash
python app.py
```
Open **[http://localhost:8501](http://localhost:8501)** in your browser.

#### Option B: Modern React + Material UI Frontend (Port 5173)
```bash
cd frontend
npm install
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser (proxies API requests to `:8501`).

---

## Running the Machine Learning Pipeline

```bash
# Clean raw data
python -m src.data.clean

# Retrain the champion XGBoost model and serialize artifact
python -m src.models.train

# Run unit tests
pytest tests/
```

---


## License & Authors
Developed for educational, research, and production-grade automated valuation analysis. Open-source under the MIT License.

