// ============================================================================
// Top Header Component
// Clean executive navbar with model metrics and metadata chips
// ============================================================================

import React from 'react';
import { Box, Container, Typography, Chip, useTheme } from '@mui/material';
import DomainIcon from '@mui/icons-material/Domain';
import LayersIcon from '@mui/icons-material/Layers';
import { primitives, semanticTokens } from '../theme/tokens';

export const Header: React.FC = () => {
  const theme = useTheme();

  return (
    <Box
      component="header"
      sx={{
        backgroundColor: '#FFFFFF',
        borderBottom: `1px solid ${theme.palette.divider}`,
        py: 1.5,
        position: 'sticky',
        top: 0,
        zIndex: theme.zIndex.appBar,
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1.5,
          }}
        >
          {/* Brand Identity */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: `${primitives.radiusSm}px`,
                backgroundColor: semanticTokens.palette.primarySurface,
                border: `1px solid ${semanticTokens.palette.primaryBorder}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: theme.palette.primary.main,
              }}
            >
              <DomainIcon fontSize="small" />
            </Box>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 800,
                    fontSize: '1.15rem',
                    letterSpacing: '-0.02em',
                    lineHeight: 1.2,
                  }}
                >
                  PropVal
                </Typography>
                <Chip
                  label="CABA"
                  size="small"
                  sx={{
                    backgroundColor: semanticTokens.palette.primarySurface,
                    color: theme.palette.primary.main,
                    fontWeight: 700,
                    fontSize: '0.6875rem',
                    height: 20,
                  }}
                />
              </Box>
              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.text.secondary,
                  fontSize: '0.75rem',
                  fontWeight: 500,
                }}
              >
                Tasación Inmobiliaria Basada en Inteligencia Artificial
              </Typography>
            </Box>
          </Box>

          {/* Model Status Pills */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              icon={<LayersIcon sx={{ fontSize: '0.9rem !important' }} />}
              label="56,500+ Inmuebles CABA"
              size="small"
              sx={{
                backgroundColor: primitives.slate100,
                color: primitives.slate700,
                border: `1px solid ${primitives.slate200}`,
                fontWeight: 500,
                fontSize: '0.75rem',
              }}
            />
          </Box>
        </Box>
      </Container>
    </Box>
  );
};
