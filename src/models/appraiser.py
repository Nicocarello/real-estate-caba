"""
Interactive Property Appraisal Service for Capital Federal (CABA).
Integrates GCBA USIG API geocoding with champion XGBoost valuation pipeline (25 features).
Arbitrary concentric radial distance metrics have been removed to preserve polycentric market equity.
"""

import json
import logging
import math
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import joblib
import numpy as np
import pandas as pd

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

# Ensure unpickling compatibility for TransformedTargetRegressor inverse_func
def safe_expm1(pred):
    return np.expm1(np.clip(pred, 8.0, 16.5))

import __main__
if not hasattr(__main__, "safe_expm1"):
    __main__.safe_expm1 = safe_expm1


def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Computes great-circle distance between two GPS coordinates in kilometers."""
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2.0)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2.0)**2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c


def geocode_usig_caba(direccion: str, timeout_seconds: float = 3.5) -> Optional[Tuple[float, float, str]]:
    """
    Geocodes an address within CABA using the official USIG (GCBA) API.
    100% Free, no API key, highly accurate for Buenos Aires streets and intersections.
    
    Returns:
        (latitude, longitude, normalized_address_str) or None if not found/error.
    """
    if not direccion or not direccion.strip():
        return None

    clean_dir = direccion.strip()
    if "caba" not in clean_dir.lower() and "buenos aires" not in clean_dir.lower():
        clean_dir += ", CABA"

    url = f"https://servicios.usig.buenosaires.gob.ar/normalizar/?direccion={urllib.parse.quote(clean_dir)}"
    try:
        req = urllib.request.Request(
            url, 
            headers={"User-Agent": "ProperatiAppraiser/1.0 (Windows NT 10.0; Win64; x64)"}
        )
        with urllib.request.urlopen(req, timeout=timeout_seconds) as response:
            data = json.loads(response.read().decode("utf-8"))
            if data and data.get("direccionesNormalizadas"):
                first = data["direccionesNormalizadas"][0]
                coords = first.get("coordenadas")
                if coords and coords.get("x") and coords.get("y"):
                    lat = float(coords["y"])
                    lon = float(coords["x"])
                    norm_dir = first.get("direccion", direccion)
                    return lat, lon, norm_dir
    except Exception as e:
        logger.warning(f"USIG Geocoding failed for '{direccion}': {e}. Falling back to barrio centroid.")
    return None


class PropertyAppraiser:
    """
    End-to-End Real Estate Valuation Service for Capital Federal properties.
    Accepts intuitive user inputs, derives all 25 predictive features,
    and returns point valuations with statistical uncertainty bands.
    """

    def __init__(
        self,
        model_path: str = "models/best_property_pricing_model.joblib",
        barrios_metadata_path: str = "models/barrios_caba_metadata.json",
        mdape_margin: float = 0.1029
    ):
        model_p = Path(model_path)
        barrios_p = Path(barrios_metadata_path)

        if not model_p.exists():
            raise FileNotFoundError(f"Champion model artifact not found at: {model_p}")
        if not barrios_p.exists():
            raise FileNotFoundError(f"Barrios metadata not found at: {barrios_p}")

        self.model = joblib.load(model_p)
        with open(barrios_p, "r", encoding="utf-8") as f:
            self.barrios_meta = json.load(f)
            
        self.mdape_margin = mdape_margin
        logger.info(f"PropertyAppraiser initialized with model from {model_p}")

    def list_available_barrios(self) -> List[str]:
        """Returns sorted list of recognized CABA barrios."""
        return sorted(list(self.barrios_meta.keys()))

    def appraise(
        self,
        barrio: str,
        property_type: str,
        surface_total: float,
        surface_covered: Optional[float] = None,
        rooms: int = 1,
        bedrooms: Optional[int] = None,
        bathrooms: int = 1,
        direccion: Optional[str] = None,
        has_parking: bool = False,
        has_balcony: bool = False,
        has_pool: bool = False,
        has_gym: bool = False,
        has_security: bool = False,
        has_parrilla: bool = False,
        has_sum: bool = False,
        is_a_estrenar: bool = False,
        por_escalera: bool = False,
        disposicion: str = "frente",
        antiguedad_anios: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Executes end-to-end property valuation with statistical uncertainty bands
        and micro-market qualitative calibrations (elevator access, disposition, age).
        """
        if surface_total <= 0:
            raise ValueError("surface_total must be greater than 0.")
        if rooms < 1:
            rooms = 1

        # 1. Geolocation Resolution: Address via USIG vs Barrio Centroid Fallback
        geo_source = "Centroide Barrio (Aproximado)"
        norm_address = None
        barrio_efectivo = barrio
        barrio_detectado = None
        barrio_corregido = False
        distancia_al_barrio_km = 0.0

        selected_barrio_info = self.barrios_meta.get(
            barrio, 
            self.barrios_meta.get("Palermo", {"lat": -34.5825, "lon": -58.4238, "listing_freq": 1000})
        )
        
        usig_result = geocode_usig_caba(direccion) if direccion else None
        if usig_result:
            lat, lon, norm_address = usig_result
            geo_source = f"USIG GCBA Oficial ({norm_address})"

            # Opción A: Prevalencia de la Dirección (Auto-corrección inteligente)
            distancia_al_barrio_km = haversine_distance_km(
                lat, lon, 
                selected_barrio_info["lat"], selected_barrio_info["lon"]
            )

            # Si la dirección geocodificada dista más de 2.5 km del centroide del barrio seleccionado:
            if distancia_al_barrio_km > 2.5:
                nearest_barrio = min(
                    self.barrios_meta.keys(),
                    key=lambda b: haversine_distance_km(
                        lat, lon, 
                        self.barrios_meta[b]["lat"], self.barrios_meta[b]["lon"]
                    )
                )
                if nearest_barrio != barrio:
                    barrio_detectado = nearest_barrio
                    barrio_efectivo = nearest_barrio
                    barrio_corregido = True
                    geo_source = f"USIG GCBA ({norm_address} · Validada en {nearest_barrio})"
                    logger.info(
                        f"Auto-corrección espacial: Dirección '{norm_address}' dista {distancia_al_barrio_km:.2f} km "
                        f"de '{barrio}'. Reasignando a barrio real más cercano '{nearest_barrio}'."
                    )
        else:
            lat, lon = selected_barrio_info["lat"], selected_barrio_info["lon"]

        barrio_freq = self.barrios_meta.get(barrio_efectivo, {}).get("listing_freq", 1000)

        # 2. Smart Defaults & Feature Derivation
        if surface_covered is None or surface_covered <= 0 or surface_covered > surface_total:
            surface_covered = surface_total * 0.90 if has_balcony else surface_total

        uncovered_surface = max(0.0, float(surface_total - surface_covered))
        covered_ratio = float(surface_covered / surface_total) if surface_total > 0 else 1.0

        if bedrooms is None:
            bedrooms = max(0, rooms - 1)

        is_monoambiente = 1 if rooms == 1 else 0
        avg_room_size = float(surface_total / rooms) if rooms > 0 else float(surface_total)

        rooms_per_bedroom = float(rooms / bedrooms) if bedrooms > 0 else float(rooms)
        bathrooms_per_bedroom = float(bathrooms / bedrooms) if bedrooms > 0 else float(bathrooms)

        # Amenities Count
        amenities = [has_parking, has_pool, has_gym, has_security, has_parrilla, has_sum, has_balcony]
        amenities_count = sum(1 for a in amenities if a)

        # 3. Assemble clean 30-feature dictionary (including non-linear surface damping & luxury score)
        luxury_score = (
            int(has_pool) * 2 +
            int(has_gym) * 2 +
            int(has_security) * 2 +
            int(has_parking) * 3 +
            int(has_sum) * 1 +
            int(has_parrilla) * 1
        )

        features = {
            "lat": lat,
            "lon": lon,
            "barrio": barrio_efectivo,
            "rooms": float(rooms),
            "bedrooms": float(bedrooms),
            "bathrooms": float(bathrooms),
            "surface_total": float(surface_total),
            "surface_covered": float(surface_covered),
            "property_type": property_type,
            "has_parking": int(has_parking),
            "has_pool": int(has_pool),
            "has_gym": int(has_gym),
            "has_security": int(has_security),
            "has_parrilla": int(has_parrilla),
            "has_sum": int(has_sum),
            "is_a_estrenar": int(is_a_estrenar),
            "has_balcony": int(has_balcony),
            "amenities_count": amenities_count,
            "uncovered_surface": uncovered_surface,
            "covered_ratio": covered_ratio,
            "is_monoambiente": is_monoambiente,
            "avg_room_size": avg_room_size,
            "bathrooms_per_bedroom": bathrooms_per_bedroom,
            "rooms_per_bedroom": rooms_per_bedroom,
            "barrio_listing_freq": barrio_freq,
            "log_surface_total": float(np.log1p(surface_total)),
            "log_surface_covered": float(np.log1p(surface_covered)),
            "is_large_property": 1 if surface_total > 150 else 0,
            "surface_over_150": max(0.0, float(surface_total - 150.0)),
            "luxury_amenities_score": luxury_score
        }

        # 4. Predict via Champion Pipeline
        df_input = pd.DataFrame([features])
        base_predicted_usd = float(self.model.predict(df_input)[0])

        # 5. Micro-Market Qualitative Calibrations (Condition, Access, Prestige, Disposition)
        calib_mult = 1.0
        applied_calibrations = []

        if por_escalera and property_type.lower() in ["departamento", "depto"]:
            calib_mult *= 0.85  # ~15% discount for walk-up apartments without elevator in CABA
            applied_calibrations.append({"factor": "Sin ascensor (por escalera)", "impact": "-15%"})

        disp = (disposicion or "frente").lower()
        if disp == "interno":
            calib_mult *= 0.90  # ~10% discount for internal courtyard units
            applied_calibrations.append({"factor": "Disposición interna", "impact": "-10%"})
        elif disp == "contrafrente":
            calib_mult *= 0.96  # ~4% adjustment for back-facing units
            applied_calibrations.append({"factor": "Disposición contrafrente", "impact": "-4%"})

        if antiguedad_anios is not None and antiguedad_anios >= 45 and not is_a_estrenar:
            calib_mult *= 0.92  # ~8% adjustment for older unrenovated buildings
            applied_calibrations.append({"factor": f"Antigüedad ({antiguedad_anios} años)", "impact": "-8%"})

        calibrated_price = base_predicted_usd * calib_mult

        # 6. Dynamic Heteroskedastic Uncertainty Margins
        # Luxury & mega-units carry higher real-estate dispersion
        if surface_total > 180 or calibrated_price > 500000:
            effective_margin = 0.20
        elif surface_total > 120 or calibrated_price > 300000:
            effective_margin = 0.15
        else:
            effective_margin = self.mdape_margin

        price_lower = round(calibrated_price * (1.0 - effective_margin), -2)
        price_upper = round(calibrated_price * (1.0 + effective_margin), -2)
        price_point = round(calibrated_price, -2)
        usd_per_m2 = round(price_point / surface_total, 0)

        return {
            "precio_estimado_usd": price_point,
            "precio_base_ml_usd": round(base_predicted_usd, -2),
            "rango_sugerido_min_usd": price_lower,
            "rango_sugerido_max_usd": price_upper,
            "margen_incertidumbre_pct": round(effective_margin * 100, 1),
            "precio_usd_m2": usd_per_m2,
            "calibraciones_aplicadas": applied_calibrations,
            "metodo_geocodificacion": geo_source,
            "direccion_normalizada": norm_address,
            "coordenadas": {"lat": lat, "lon": lon},
            "barrio_solicitado": barrio,
            "barrio_efectivo": barrio_efectivo,
            "barrio_detectado": barrio_detectado,
            "barrio_corregido": barrio_corregido,
            "distancia_al_barrio_km": round(distancia_al_barrio_km, 2)
        }


if __name__ == "__main__":
    appraiser = PropertyAppraiser()
    print("Available Barrios:", len(appraiser.list_available_barrios()))
    
    sample = appraiser.appraise(
        barrio="Núñez",
        property_type="Departamento",
        surface_total=80,
        surface_covered=72,
        rooms=3,
        bedrooms=2,
        bathrooms=2,
        has_balcony=True,
        has_parking=True
    )
    print("\nSample Valuation Result for Núñez:")
    print(json.dumps(sample, indent=2, ensure_ascii=False))
