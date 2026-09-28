// ============================================================================
// Appraisal API Service Client
// Calls local FastAPI/Python backend endpoints
// ============================================================================

import type { AppraisalRequest, AppraisalResponse, ApiError } from '../types/appraisal';

const BASE_URL = '/api';

export const fetchBarriosList = async (): Promise<string[]> => {
  try {
    const res = await fetch(`${BASE_URL}/barrios`);
    if (!res.ok) {
      throw new Error(`Failed to load barrios: ${res.statusText}`);
    }
    const data: string[] = await res.json();
    return data;
  } catch (err) {
    console.error('Error fetching barrios, using CABA fallbacks:', err);
    return [
      'Palermo',
      'Recoleta',
      'Belgrano',
      'Nuñez',
      'Caballito',
      'Almagro',
      'Villa Urquiza',
      'Colegiales',
      'San Telmo',
      'Puerto Madero',
      'Villa Crespo',
      'Flores',
    ];
  }
};

export const requestAppraisal = async (
  payload: AppraisalRequest
): Promise<AppraisalResponse> => {
  const res = await fetch(`${BASE_URL}/appraise`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let message = 'Error al procesar la tasación.';
    try {
      const errData: ApiError = await res.json();
      if (errData.error) message = errData.error;
    } catch {
      // Keep default message
    }
    throw new Error(message);
  }

  const data: AppraisalResponse = await res.json();
  return data;
};
