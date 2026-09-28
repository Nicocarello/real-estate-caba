// ============================================================================
// Empty / Idle State Component
// Clean invitation to appraise without technical clutter
// ============================================================================

import React from 'react';
import { Paper, Box, Typography, useTheme } from '@mui/material';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import { primitives, semanticTokens } from '../theme/tokens';

export const EmptyState: React.FC = () => {
  const theme = useTheme();

  return (
    <Paper
      sx={{
        p: { xs: 4, sm: 6 },
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 460,
      }}
    >
      <Box
        sx={{
          width: 64,
          height: 64,
          borderRadius: `${primitives.radiusMd}px`,
          backgroundColor: semanticTokens.palette.primarySurface,
          border: `1px solid ${semanticTokens.palette.primaryBorder}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: theme.palette.primary.main,
          mb: 2.5,
        }}
      >
        <AssessmentOutlinedIcon sx={{ fontSize: 36 }} />
      </Box>

      <Typography variant="h5" sx={{ mb: 1, fontWeight: 700 }}>
        Tasación Estimada en Tiempo Real
      </Typography>

      <Typography
        variant="body1"
        sx={{
          color: theme.palette.text.secondary,
          maxWidth: 380,
          lineHeight: 1.6,
        }}
      >
        Completa las características del inmueble en el formulario para calcular el valor estimado de venta y el rango de publicación sugerido.
      </Typography>
    </Paper>
  );
};
