// ============================================================================
// Appraisal Form Component
// Rich, interactive property input form with MUI 6 / React 19 controls
// No emojis: Uses official Material-UI SVG icons
// ============================================================================

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Autocomplete,
  Button,
  ButtonGroup,
  Switch,
  Chip,
  InputAdornment,
  CircularProgress,
  useTheme,
  Divider,
} from '@mui/material';

import ApartmentIcon from '@mui/icons-material/Apartment';
import HomeIcon from '@mui/icons-material/Home';
import VillaIcon from '@mui/icons-material/Villa';
import StraightenIcon from '@mui/icons-material/Straighten';
import BedIcon from '@mui/icons-material/Bed';
import BathtubIcon from '@mui/icons-material/Bathtub';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import BalconyIcon from '@mui/icons-material/Balcony';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SecurityIcon from '@mui/icons-material/Security';
import PoolIcon from '@mui/icons-material/Pool';
import OutdoorGrillIcon from '@mui/icons-material/OutdoorGrill';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import CelebrationIcon from '@mui/icons-material/Celebration';
import CalculateIcon from '@mui/icons-material/Calculate';
import StairsIcon from '@mui/icons-material/Stairs';

import type { PropertyType, AppraisalRequest } from '../types/appraisal';
import { semanticTokens } from '../theme/tokens';

type AppraisalFormProps = {
  barrios: string[];
  isLoading: boolean;
  onSubmit: (request: AppraisalRequest) => void;
};

export const AppraisalForm: React.FC<AppraisalFormProps> = ({
  barrios,
  isLoading,
  onSubmit,
}) => {
  const theme = useTheme();

  // Form State
  const [propertyType, setPropertyType] = useState<PropertyType>('Departamento');
  const [barrio, setBarrio] = useState<string>('Palermo');
  const [direccion, setDireccion] = useState<string>('');
  const [surfaceTotal, setSurfaceTotal] = useState<number>(55);
  const [surfaceCovered, setSurfaceCovered] = useState<number>(50);
  const [rooms, setRooms] = useState<number>(2);
  const [isCustomRooms, setIsCustomRooms] = useState<boolean>(false);
  const [customRoomsInput, setCustomRoomsInput] = useState<string>('7');
  const [bedrooms, setBedrooms] = useState<number>(1);
  const [bathrooms, setBathrooms] = useState<number>(1);

  // Property Attributes
  const [hasParking, setHasParking] = useState<boolean>(false);
  const [hasBalcony, setHasBalcony] = useState<boolean>(true);
  const [isEstrenar, setIsEstrenar] = useState<boolean>(false);
  const [hasSecurity, setHasSecurity] = useState<boolean>(false);
  const [porEscalera, setPorEscalera] = useState<boolean>(false);

  // Amenities
  const [hasPool, setHasPool] = useState<boolean>(false);
  const [hasParrilla, setHasParrilla] = useState<boolean>(false);
  const [hasGym, setHasGym] = useState<boolean>(false);
  const [hasSum, setHasSum] = useState<boolean>(false);

  // Validation
  const [errors, setErrors] = useState<{ surface?: string; barrio?: string }>({});

  const handleRoomsChange = (newRooms: number) => {
    setRooms(newRooms);
    setIsCustomRooms(false);
    setCustomRoomsInput(String(newRooms));
    if (newRooms === 1) {
      setBedrooms(0);
    } else {
      setBedrooms(Math.max(1, newRooms - 1));
    }
  };

  const handleOpenCustomRooms = () => {
    setIsCustomRooms(true);
    const nextRooms = rooms >= 7 ? rooms : 7;
    setRooms(nextRooms);
    setCustomRoomsInput(String(nextRooms));
    setBedrooms(Math.max(1, nextRooms - 2));
  };

  const handleCustomRoomsInputChange = (rawStr: string) => {
    setCustomRoomsInput(rawStr);
    const parsed = parseInt(rawStr, 10);
    if (!isNaN(parsed) && parsed >= 1) {
      const validRooms = Math.min(30, parsed);
      setRooms(validRooms);
      if (bedrooms >= validRooms) {
        setBedrooms(Math.max(1, validRooms - 1));
      }
    }
  };

  const handleSurfaceTotalChange = (val: number) => {
    setSurfaceTotal(val);
    if (surfaceCovered > val) {
      setSurfaceCovered(val);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { surface?: string; barrio?: string } = {};

    if (!barrio) {
      newErrors.barrio = 'Seleccione un barrio.';
    }
    if (!surfaceTotal || surfaceTotal <= 0) {
      newErrors.surface = 'Ingrese una superficie válida mayor a 0.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onSubmit({
      barrio,
      property_type: propertyType,
      surface_total: surfaceTotal,
      surface_covered: surfaceCovered > 0 ? surfaceCovered : surfaceTotal,
      rooms,
      bedrooms,
      bathrooms,
      direccion: direccion.trim() ? direccion.trim() : undefined,
      has_parking: hasParking,
      has_balcony: hasBalcony,
      has_pool: hasPool,
      has_gym: hasGym,
      has_security: hasSecurity,
      has_parrilla: hasParrilla,
      has_sum: hasSum,
      is_a_estrenar: isEstrenar,
      por_escalera: porEscalera,
    });
  };

  return (
    <Paper sx={{ p: { xs: 2.5, sm: 3.5 } }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ mb: 0.5 }}>
          Datos del Inmueble
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Ingresa las características de la propiedad para calcular la tasación de mercado en CABA.
        </Typography>
      </Box>

      <Box component="form" onSubmit={handleSubmit} noValidate>
        {/* 1. Tipo de Propiedad */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="caption" sx={{ mb: 1.5, display: 'block' }}>
            Tipo de Propiedad
          </Typography>
          <ButtonGroup fullWidth sx={{ gap: 1 }}>
            {(
              [
                { type: 'Departamento', label: 'Departamento', icon: <ApartmentIcon /> },
                { type: 'PH', label: 'PH', icon: <HomeIcon /> },
                { type: 'Casa', label: 'Casa', icon: <VillaIcon /> },
              ] as const
            ).map((item) => {
              const active = propertyType === item.type;
              return (
                <Button
                  key={item.type}
                  onClick={() => setPropertyType(item.type)}
                  variant={active ? 'contained' : 'outlined'}
                  startIcon={item.icon}
                  sx={{
                    py: 1.25,
                    borderWidth: '1px !important',
                    borderColor: active
                      ? `${theme.palette.primary.main} !important`
                      : `${semanticTokens.palette.borderSubtle} !important`,
                    backgroundColor: active ? theme.palette.primary.main : '#FFFFFF',
                    color: active ? '#FFFFFF' : theme.palette.text.primary,
                    '&:hover': {
                      backgroundColor: active
                        ? theme.palette.primary.dark
                        : semanticTokens.palette.primarySurface,
                    },
                  }}
                >
                  {item.label}
                </Button>
              );
            })}
          </ButtonGroup>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* 2. Ubicación */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="caption" sx={{ mb: 1.5, display: 'block' }}>
            Ubicación en CABA
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Autocomplete
                options={barrios}
                value={barrio}
                onChange={(_, newValue) => setBarrio(newValue || '')}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Barrio"
                    required
                    error={Boolean(errors.barrio)}
                    helperText={errors.barrio}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Dirección (Opcional)"
                placeholder="Ej: Av. del Libertador 4400"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                helperText="Geocodificación oficial USIG / GCBA"
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <Chip
                          label="GCBA"
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '0.625rem',
                            backgroundColor: semanticTokens.palette.primarySurface,
                            color: theme.palette.primary.main,
                            fontWeight: 700,
                          }}
                        />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* 3. Superficies y Ambientes */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="caption" sx={{ mb: 1.5, display: 'block' }}>
            Superficie y Distribución
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                type="number"
                label="Superficie Total"
                value={surfaceTotal}
                onChange={(e) => handleSurfaceTotalChange(Number(e.target.value))}
                error={Boolean(errors.surface)}
                helperText={errors.surface}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <StraightenIcon fontSize="small" sx={{ color: theme.palette.text.secondary }} />
                      </InputAdornment>
                    ),
                    endAdornment: <InputAdornment position="end">m²</InputAdornment>,
                  },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                type="number"
                label="Superficie Cubierta"
                value={surfaceCovered}
                onChange={(e) => setSurfaceCovered(Number(e.target.value))}
                helperText="Techada bajo losa"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <StraightenIcon fontSize="small" sx={{ color: theme.palette.text.secondary }} />
                      </InputAdornment>
                    ),
                    endAdornment: <InputAdornment position="end">m²</InputAdornment>,
                  },
                }}
              />
            </Grid>

            {/* Ambientes Pills */}
            <Grid size={{ xs: 12 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Cantidad de Ambientes:
                </Typography>
                {rooms >= 7 && (
                  <Chip
                    label={`${rooms} ambientes`}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ fontWeight: 600, height: 22 }}
                  />
                )}
              </Box>
              <ButtonGroup fullWidth sx={{ gap: 0.75, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
                {[1, 2, 3, 4, 5, 6].map((num) => {
                  const active = !isCustomRooms && rooms === num;
                  return (
                    <Button
                      key={num}
                      onClick={() => handleRoomsChange(num)}
                      variant={active ? 'contained' : 'outlined'}
                      sx={{
                        py: 1,
                        flex: { xs: '1 0 28%', sm: 1 },
                        borderWidth: '1px !important',
                        borderColor: active
                          ? `${theme.palette.primary.main} !important`
                          : `${semanticTokens.palette.borderSubtle} !important`,
                        backgroundColor: active ? theme.palette.primary.main : '#FFFFFF',
                        color: active ? '#FFFFFF' : theme.palette.text.primary,
                      }}
                    >
                      {`${num} amb`}
                    </Button>
                  );
                })}
                <Button
                  onClick={handleOpenCustomRooms}
                  variant={isCustomRooms || rooms >= 7 ? 'contained' : 'outlined'}
                  sx={{
                    py: 1,
                    flex: { xs: '1 0 28%', sm: 1 },
                    borderWidth: '1px !important',
                    borderColor: (isCustomRooms || rooms >= 7)
                      ? `${theme.palette.primary.main} !important`
                      : `${semanticTokens.palette.borderSubtle} !important`,
                    backgroundColor: (isCustomRooms || rooms >= 7) ? theme.palette.primary.main : '#FFFFFF',
                    color: (isCustomRooms || rooms >= 7) ? '#FFFFFF' : theme.palette.text.primary,
                  }}
                >
                  {rooms >= 7 ? `${rooms} amb` : 'Más (7+)'}
                </Button>
              </ButtonGroup>

              {/* Exact numeric input when 7+ or custom is selected */}
              {(isCustomRooms || rooms >= 7) && (
                <Box sx={{ mt: 1.5 }}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Cantidad exacta de ambientes"
                    value={customRoomsInput}
                    onChange={(e) => handleCustomRoomsInputChange(e.target.value)}
                    helperText="Especifica la cantidad total de ambientes (ej: 7, 8, 9, 10...)"
                    slotProps={{
                      htmlInput: { min: 1, max: 30 },
                      input: {
                        endAdornment: <InputAdornment position="end">ambientes</InputAdornment>,
                      },
                    }}
                  />
                </Box>
              )}
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                type="number"
                label="Dormitorios"
                value={bedrooms}
                onChange={(e) => setBedrooms(Number(e.target.value))}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <BedIcon fontSize="small" sx={{ color: theme.palette.text.secondary }} />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                type="number"
                label="Baños"
                value={bathrooms}
                onChange={(e) => setBathrooms(Number(e.target.value))}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <BathtubIcon fontSize="small" sx={{ color: theme.palette.text.secondary }} />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* 4. Atributos Destacados */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="caption" sx={{ mb: 1.5, display: 'block' }}>
            Atributos y Características
          </Typography>
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Paper
                variant="outlined"
                sx={{
                  p: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: hasParking ? semanticTokens.palette.primarySurface : '#FFFFFF',
                  borderColor: hasParking ? semanticTokens.palette.primaryBorder : theme.palette.divider,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <DirectionsCarIcon fontSize="small" color={hasParking ? 'primary' : 'action'} />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Cochera
                  </Typography>
                </Box>
                <Switch
                  checked={hasParking}
                  onChange={(e) => setHasParking(e.target.checked)}
                  size="small"
                />
              </Paper>
            </Grid>

            <Grid size={{ xs: 6, sm: 3 }}>
              <Paper
                variant="outlined"
                sx={{
                  p: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: hasBalcony ? semanticTokens.palette.primarySurface : '#FFFFFF',
                  borderColor: hasBalcony ? semanticTokens.palette.primaryBorder : theme.palette.divider,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BalconyIcon fontSize="small" color={hasBalcony ? 'primary' : 'action'} />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Balcón
                  </Typography>
                </Box>
                <Switch
                  checked={hasBalcony}
                  onChange={(e) => setHasBalcony(e.target.checked)}
                  size="small"
                />
              </Paper>
            </Grid>

            <Grid size={{ xs: 6, sm: 3 }}>
              <Paper
                variant="outlined"
                sx={{
                  p: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: isEstrenar ? semanticTokens.palette.primarySurface : '#FFFFFF',
                  borderColor: isEstrenar ? semanticTokens.palette.primaryBorder : theme.palette.divider,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AutoAwesomeIcon fontSize="small" color={isEstrenar ? 'primary' : 'action'} />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    A Estrenar
                  </Typography>
                </Box>
                <Switch
                  checked={isEstrenar}
                  onChange={(e) => setIsEstrenar(e.target.checked)}
                  size="small"
                />
              </Paper>
            </Grid>

            <Grid size={{ xs: 6, sm: 3 }}>
              <Paper
                variant="outlined"
                sx={{
                  p: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: hasSecurity ? semanticTokens.palette.primarySurface : '#FFFFFF',
                  borderColor: hasSecurity ? semanticTokens.palette.primaryBorder : theme.palette.divider,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SecurityIcon fontSize="small" color={hasSecurity ? 'primary' : 'action'} />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Seguridad
                  </Typography>
                </Box>
                <Switch
                  checked={hasSecurity}
                  onChange={(e) => setHasSecurity(e.target.checked)}
                  size="small"
                />
              </Paper>
            </Grid>

            <Grid size={{ xs: 6, sm: 3 }}>
              <Paper
                variant="outlined"
                sx={{
                  p: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: porEscalera ? semanticTokens.palette.primarySurface : '#FFFFFF',
                  borderColor: porEscalera ? semanticTokens.palette.primaryBorder : theme.palette.divider,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <StairsIcon fontSize="small" color={porEscalera ? 'primary' : 'action'} />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Por Escalera
                  </Typography>
                </Box>
                <Switch
                  checked={porEscalera}
                  onChange={(e) => setPorEscalera(e.target.checked)}
                  size="small"
                />
              </Paper>
            </Grid>
          </Grid>

          {/* Amenities Chips */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ mb: 1, color: theme.palette.text.secondary }}>
              Amenities del Edificio:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Chip
                icon={<PoolIcon />}
                label="Pileta"
                clickable
                color={hasPool ? 'primary' : 'default'}
                variant={hasPool ? 'filled' : 'outlined'}
                onClick={() => setHasPool(!hasPool)}
              />
              <Chip
                icon={<OutdoorGrillIcon />}
                label="Parrilla"
                clickable
                color={hasParrilla ? 'primary' : 'default'}
                variant={hasParrilla ? 'filled' : 'outlined'}
                onClick={() => setHasParrilla(!hasParrilla)}
              />
              <Chip
                icon={<FitnessCenterIcon />}
                label="Gimnasio"
                clickable
                color={hasGym ? 'primary' : 'default'}
                variant={hasGym ? 'filled' : 'outlined'}
                onClick={() => setHasGym(!hasGym)}
              />
              <Chip
                icon={<CelebrationIcon />}
                label="SUM"
                clickable
                color={hasSum ? 'primary' : 'default'}
                variant={hasSum ? 'filled' : 'outlined'}
                onClick={() => setHasSum(!hasSum)}
              />
            </Box>
          </Box>
        </Box>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={18} color="inherit" /> : <CalculateIcon />}
          sx={{
            py: 1.5,
            fontSize: '1rem',
            fontWeight: 700,
            mt: 2,
          }}
        >
          {isLoading ? 'Calculando Tasación...' : 'Tasar Propiedad'}
        </Button>
      </Box>
    </Paper>
  );
};
