// ============================================================================
// Main Application Component
// Assembles Header, Form, and Valuation Card into an executive 2-column layout
// ============================================================================

import React, { useEffect, useState } from 'react';
import {
  ThemeProvider,
  CssBaseline,
  Box,
  Container,
  Grid,
  Alert,
  Snackbar,
} from '@mui/material';

import { appTheme } from './theme/theme';
import { Header } from './components/Header';
import { AppraisalForm } from './components/AppraisalForm';
import { ValuationCard } from './components/ValuationCard';
import { EmptyState } from './components/EmptyState';

import { fetchBarriosList, requestAppraisal } from './api/appraisalApi';
import type { AppraisalRequest, AppraisalResponse } from './types/appraisal';

export const App: React.FC = () => {
  const [barrios, setBarrios] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastRequest, setLastRequest] = useState<AppraisalRequest | null>(null);
  const [result, setResult] = useState<AppraisalResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load barrios on mount
  useEffect(() => {
    let isMounted = true;
    fetchBarriosList().then((data) => {
      if (isMounted) {
        setBarrios(data);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleAppraise = async (payload: AppraisalRequest) => {
    setIsLoading(true);
    setErrorMessage(null);
    setLastRequest(payload);

    try {
      const response = await requestAppraisal(payload);
      setResult(response);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Ocurrió un error inesperado al procesar la tasación.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setLastRequest(null);
    setErrorMessage(null);
  };

  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />

        <Box component="main" sx={{ flexGrow: 1, py: { xs: 2.5, md: 4 } }}>
          <Container maxWidth="lg">
            <Grid container spacing={3} sx={{ alignItems: 'flex-start' }}>
              {/* Left Column: Input Form */}
              <Grid size={{ xs: 12, md: 7 }}>
                <AppraisalForm
                  barrios={barrios}
                  isLoading={isLoading}
                  onSubmit={handleAppraise}
                />
              </Grid>

              {/* Right Column: Result or Empty State */}
              <Grid size={{ xs: 12, md: 5 }}>
                <Box sx={{ position: { md: 'sticky' }, top: { md: 80 } }}>
                  {result && lastRequest ? (
                    <ValuationCard
                      result={result}
                      request={lastRequest}
                      onReset={handleReset}
                    />
                  ) : (
                    <EmptyState />
                  )}
                </Box>
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* Error Notification */}
        <Snackbar
          open={Boolean(errorMessage)}
          autoHideDuration={6000}
          onClose={() => setErrorMessage(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity="error" onClose={() => setErrorMessage(null)} sx={{ width: '100%' }}>
            {errorMessage}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
};

export default App;
