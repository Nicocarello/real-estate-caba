// ============================================================================
// TypeScript Type Definitions for Real Estate Valuation Service
// Using 'type' keyword strictly per frontend-designer specifications
// ============================================================================

export type PropertyType = 'Departamento' | 'PH' | 'Casa';

export type AppraisalRequest = {
  barrio: string;
  property_type: PropertyType;
  surface_total: number;
  surface_covered?: number | null;
  rooms: number;
  bedrooms?: number | null;
  bathrooms: number;
  direccion?: string;
  has_parking: boolean;
  has_balcony: boolean;
  has_pool: boolean;
  has_gym: boolean;
  has_security: boolean;
  has_parrilla: boolean;
  has_sum: boolean;
  is_a_estrenar: boolean;
  por_escalera?: boolean;
};

export type AppraisalResponse = {
  precio_estimado_usd: number;
  precio_base_ml_usd?: number;
  rango_sugerido_min_usd: number;
  rango_sugerido_max_usd: number;
  margen_incertidumbre_pct?: number;
  precio_usd_m2: number;
  calibraciones_aplicadas?: Array<{ factor: string; impact: string }>;
  metodo_geocodificacion: string;
  direccion_normalizada: string | null;
  coordenadas: {
    lat: number;
    lon: number;
  };
  barrio_solicitado?: string;
  barrio_efectivo?: string;
  barrio_detectado?: string | null;
  barrio_corregido?: boolean;
  distancia_al_barrio_km?: number;
};

export type ApiError = {
  error: string;
};
