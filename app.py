"""
Local Server for CABA Property Valuation Web App.
Uses Python built-in http.server (zero extra pip dependencies needed).
"""

import http.server
import json
import logging
import os
import sys
from pathlib import Path
import urllib.parse

# Ensure project root is in sys.path
PROJECT_ROOT = Path(__file__).resolve().parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from src.models.appraiser import PropertyAppraiser

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("ValuationServer")

# Initialize Property Appraiser singleton
appraiser = PropertyAppraiser(
    model_path=str(PROJECT_ROOT / "models" / "best_property_pricing_model.joblib"),
    barrios_metadata_path=str(PROJECT_ROOT / "models" / "barrios_caba_metadata.json")
)

WEB_DIR = PROJECT_ROOT / "web"


class ValuationRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(WEB_DIR), **kwargs)

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == "/api/barrios":
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            barrios = appraiser.list_available_barrios()
            self.wfile.write(json.dumps(barrios, ensure_ascii=False).encode("utf-8"))
            return

        if parsed.path == "/api/health":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"status": "healthy", "model": "XGBoost Champion"}).encode("utf-8"))
            return

        return super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == "/api/appraise":
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length).decode("utf-8")
            try:
                data = json.loads(body)
                logger.info(f"Received appraisal request for barrio: {data.get('barrio')}, dir: {data.get('direccion')}")
                
                result = appraiser.appraise(
                    barrio=data.get("barrio", "Palermo"),
                    property_type=data.get("property_type", "Departamento"),
                    surface_total=float(data.get("surface_total", 50)),
                    surface_covered=float(data["surface_covered"]) if data.get("surface_covered") is not None else None,
                    rooms=int(data.get("rooms", 2)),
                    bedrooms=int(data["bedrooms"]) if data.get("bedrooms") is not None else None,
                    bathrooms=int(data.get("bathrooms", 1)),
                    direccion=data.get("direccion"),
                    has_parking=bool(data.get("has_parking", False)),
                    has_balcony=bool(data.get("has_balcony", False)),
                    has_pool=bool(data.get("has_pool", False)),
                    has_gym=bool(data.get("has_gym", False)),
                    has_security=bool(data.get("has_security", False)),
                    has_parrilla=bool(data.get("has_parrilla", False)),
                    has_sum=bool(data.get("has_sum", False)),
                    is_a_estrenar=bool(data.get("is_a_estrenar", False)),
                    por_escalera=bool(data.get("por_escalera", False)),
                    disposicion=str(data.get("disposicion", "frente")),
                    antiguedad_anios=int(data["antiguedad_anios"]) if data.get("antiguedad_anios") is not None else None
                )
                
                self.send_response(200)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(json.dumps(result, ensure_ascii=False).encode("utf-8"))
                
            except Exception as e:
                logger.error(f"Appraisal error: {e}", exc_info=True)
                self.send_response(400)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}, ensure_ascii=False).encode("utf-8"))
            return

        self.send_response(404)
        self.end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()


def run_server(port=8501):
    server_address = ("", port)
    httpd = http.server.HTTPServer(server_address, ValuationRequestHandler)
    logger.info(f"Server started at http://localhost:{port}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        logger.info("Stopping server...")
        httpd.server_close()


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else int(os.environ.get("PORT", 8501))
    run_server(port)
