// ============================================================================
// Valuation Result Card Component
// Executive valuation display with pricing bands and property metadata
// ============================================================================

import React from 'react';
import {
  Paper,
  Box,
  Typography,
  Chip,
  Button,
  Divider,
  useTheme,
} from '@mui/material';

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PrintIcon from '@mui/icons-material/Print';
import RefreshIcon from '@mui/icons-material/Refresh';
import ApartmentIcon from '@mui/icons-material/Apartment';
import StraightenIcon from '@mui/icons-material/Straighten';
import BedIcon from '@mui/icons-material/Bed';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import BalconyIcon from '@mui/icons-material/Balcony';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

import type { AppraisalResponse, AppraisalRequest } from '../types/appraisal';
import { primitives, semanticTokens } from '../theme/tokens';

type ValuationCardProps = {
  result: AppraisalResponse;
  request: AppraisalRequest;
  onReset: () => void;
};

export const ValuationCard: React.FC<ValuationCardProps> = ({
  result,
  request,
  onReset,
}) => {
  const theme = useTheme();

  const formattedPointPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(result.precio_estimado_usd);

  const formattedMinPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(result.rango_sugerido_min_usd);

  const formattedMaxPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(result.rango_sugerido_max_usd);

  const formattedM2 = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(result.precio_usd_m2);

  return (
    <Paper sx={{ p: { xs: 2.5, sm: 3.5 } }}>
      {/* Top Meta Bar */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1,
          mb: 2,
        }}
      >
        <Chip
          icon={<CheckCircleIcon sx={{ fontSize: '1rem !important', color: `${semanticTokens.palette.success} !important` }} />}
          label="Valuación Estimada"
          size="small"
          sx={{
            backgroundColor: semanticTokens.palette.successSurface,
            color: semanticTokens.palette.success,
            fontWeight: 700,
            border: `1px solid ${primitives.green600}20`,
          }}
        />
        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontSize: '0.75rem' }}>
          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Typography>
      </Box>

      {/* Property Summary Chips */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 3 }}>
        <Chip
          icon={<ApartmentIcon sx={{ fontSize: '0.875rem !important' }} />}
          label={`${request.property_type} en ${result.barrio_efectivo || request.barrio}`}
          size="small"
          variant="outlined"
        />
        <Chip
          icon={<StraightenIcon sx={{ fontSize: '0.875rem !important' }} />}
          label={`${request.surface_total} m² totales`}
          size="small"
          variant="outlined"
        />
        <Chip
          icon={<BedIcon sx={{ fontSize: '0.875rem !important' }} />}
          label={`${request.rooms} amb (${request.bedrooms || 0} dorm · ${request.bathrooms} bñ)`}
          size="small"
          variant="outlined"
        />
        {request.has_parking && (
          <Chip
            icon={<DirectionsCarIcon sx={{ fontSize: '0.875rem !important' }} />}
            label="Cochera"
            size="small"
            variant="outlined"
          />
        )}
        {request.has_balcony && (
          <Chip
            icon={<BalconyIcon sx={{ fontSize: '0.875rem !important' }} />}
            label="Balcón"
            size="small"
            variant="outlined"
          />
        )}
        {request.is_a_estrenar && (
          <Chip
            icon={<AutoAwesomeIcon sx={{ fontSize: '0.875rem !important' }} />}
            label="A estrenar"
            size="small"
            variant="outlined"
          />
        )}
      </Box>

      {/* Main Price Card Hero */}
      <Box
        sx={{
          backgroundColor: semanticTokens.palette.backgroundDefault,
          border: `1px solid ${semanticTokens.palette.borderSubtle}`,
          borderRadius: `${primitives.radiusMd}px`,
          p: { xs: 2.5, sm: 3 },
          textAlign: 'center',
          mb: 3,
        }}
      >
        <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block', mb: 0.5 }}>
          Valor Estimado de Mercado
        </Typography>

        <Typography
          variant="h3"
          sx={{
            fontWeight: 800,
            color: theme.palette.text.primary,
            letterSpacing: '-0.03em',
            fontSize: { xs: '2rem', sm: '2.5rem' },
            lineHeight: 1.1,
            my: 1,
          }}
        >
          {formattedPointPrice}
          <Typography
            component="span"
            sx={{
              fontSize: '1rem',
              fontWeight: 600,
              color: theme.palette.text.secondary,
              ml: 1,
            }}
          >
            USD
          </Typography>
        </Typography>

        {/* Price per m2 Badge */}
        <Box sx={{ my: 1.5 }}>
          <Chip
            label={`Metro cuadrado: ${formattedM2} / m²`}
            sx={{
              backgroundColor: '#FFFFFF',
              border: `1px solid ${semanticTokens.palette.borderSubtle}`,
              fontWeight: 600,
              fontSize: '0.8125rem',
              py: 0.5,
            }}
          />
        </Box>

        {/* Suggested Publication Range */}
        <Box
          sx={{
            mt: 2,
            pt: 2,
            borderTop: `1px dashed ${semanticTokens.palette.borderSubtle}`,
          }}
        >
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 0.25 }}>
            Rango de Publicación Sugerido:
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: theme.palette.primary.main,
              fontWeight: 700,
              fontSize: '1rem',
            }}
          >
            {formattedMinPrice} — {formattedMaxPrice} USD
          </Typography>
          <Typography variant="body2" sx={{ fontSize: '0.75rem', color: theme.palette.text.secondary }}>
            Margen sugerido de publicación (±10%)
          </Typography>
        </Box>
      </Box>

      {/* Geolocation Banner */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          p: 1.75,
          backgroundColor: result.barrio_corregido ? semanticTokens.palette.primarySurface : '#FFFFFF',
          border: `1px solid ${
            result.barrio_corregido
              ? semanticTokens.palette.primaryBorder
              : semanticTokens.palette.borderSubtle
          }`,
          borderRadius: `${primitives.radiusSm}px`,
          mb: 3,
        }}
      >
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: `${primitives.radiusSm}px`,
            backgroundColor: result.barrio_corregido ? '#FFFFFF' : semanticTokens.palette.primarySurface,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: theme.palette.primary.main,
            flexShrink: 0,
          }}
        >
          <LocationOnIcon fontSize="small" />
        </Box>
        <Box>
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block' }}>
            Ubicación Procesada
          </Typography>
          {result.barrio_corregido && result.barrio_detectado ? (
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700, color: theme.palette.primary.dark }}>
                {`Dirección validada en ${result.barrio_detectado} (reemplaza ${
                  result.barrio_solicitado || request.barrio
                })`}
              </Typography>
              {result.direccion_normalizada && (
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block', mt: 0.25 }}>
                  {result.direccion_normalizada}
                </Typography>
              )}
            </Box>
          ) : (
            <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
              {result.direccion_normalizada
                ? `${result.direccion_normalizada} (Validada por GCBA)`
                : `${request.barrio} (Centroide del barrio)`}
            </Typography>
          )}
        </Box>
      </Box>

      <Divider sx={{ mb: 2.5 }} />

      {/* Actions */}
      <Box sx={{ display: 'flex', gap: 1.5 }}>
        <Button
          variant="outlined"
          fullWidth
          startIcon={<PrintIcon />}
          onClick={() => window.print()}
          sx={{ py: 1 }}
        >
          Imprimir Ficha
        </Button>
        <Button
          variant="text"
          fullWidth
          startIcon={<RefreshIcon />}
          onClick={onReset}
          sx={{ py: 1 }}
        >
          Tasar Otra
        </Button>
      </Box>
    </Paper>
  );
};
