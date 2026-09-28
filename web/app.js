// ==========================================================================
// PropVal CABA — Client Application Logic (Light Theme Clean Architecture)
// ==========================================================================

let currentPropertyType = 'Departamento';
let currentRooms = 2;

// DOM Elements
const appraisalForm = document.getElementById('appraisalForm');
const barrioSelect = document.getElementById('barrioSelect');
const direccionInput = document.getElementById('direccionInput');
const surfaceTotal = document.getElementById('surfaceTotal');
const surfaceCovered = document.getElementById('surfaceCovered');
const bedroomsInput = document.getElementById('bedroomsInput');
const bathroomsInput = document.getElementById('bathroomsInput');

// Checkboxes
const hasParking = document.getElementById('hasParking');
const hasBalcony = document.getElementById('hasBalcony');
const isEstrenar = document.getElementById('isEstrenar');
const hasSecurity = document.getElementById('hasSecurity');
const hasPool = document.getElementById('hasPool');
const hasParrilla = document.getElementById('hasParrilla');
const hasGym = document.getElementById('hasGym');
const hasSum = document.getElementById('hasSum');
const porEscalera = document.getElementById('porEscalera');

// State Containers
const idleState = document.getElementById('idleState');
const loadingState = document.getElementById('loadingState');
const resultCard = document.getElementById('resultCard');
const loadingStatusText = document.getElementById('loadingStatusText');

// Number formatters
const fmtUSD = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0
});

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  loadBarrios();
  setupTypeSelector();
  setupRoomsSelector();
  setupSurfaceSync();
  setupFormSubmit();
});

// 1. Fetch available CABA Barrios
async function loadBarrios() {
  try {
    const res = await fetch('/api/barrios');
    if (!res.ok) throw new Error('Error al cargar barrios');
    const barrios = await res.json();

    barrioSelect.innerHTML = '<option value="" disabled selected>Selecciona un barrio...</option>';
    barrios.forEach(b => {
      const opt = document.createElement('option');
      opt.value = b;
      opt.textContent = b;
      if (b === 'Palermo') opt.selected = true; // Default
      barrioSelect.appendChild(opt);
    });
  } catch (err) {
    console.error('Error fetching barrios:', err);
    const fallbackBarrios = ['Palermo', 'Recoleta', 'Belgrano', 'Caballito', 'Almagro', 'Villa Urquiza', 'Nuñez', 'San Telmo', 'Flores'];
    barrioSelect.innerHTML = '';
    fallbackBarrios.forEach(b => {
      const opt = document.createElement('option');
      opt.value = b;
      opt.textContent = b;
      if (b === 'Palermo') opt.selected = true;
      barrioSelect.appendChild(opt);
    });
  }
}

// 2. Property Type Selector
function setupTypeSelector() {
  const buttons = document.querySelectorAll('#propTypeSelector .type-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentPropertyType = btn.dataset.type;
    });
  });
}

// 3. Ambientes Selector & Smart Defaults
function setupRoomsSelector() {
  const buttons = document.querySelectorAll('#roomsSelector .pill-btn');
  const customWrapper = document.getElementById('customRoomsWrapper');
  const customInput = document.getElementById('customRoomsInput');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      if (btn.dataset.rooms === 'custom') {
        if (customWrapper) customWrapper.classList.remove('hidden');
        if (customInput) {
          customInput.focus();
          currentRooms = parseInt(customInput.value, 10) || 7;
        }
      } else {
        if (customWrapper) customWrapper.classList.add('hidden');
        currentRooms = parseInt(btn.dataset.rooms, 10);
      }

      // Smart default: sync bedrooms automatically
      if (currentRooms === 1) {
        bedroomsInput.value = 0;
      } else {
        bedroomsInput.value = Math.max(1, currentRooms - 1);
      }
    });
  });

  if (customInput) {
    customInput.addEventListener('input', () => {
      const val = parseInt(customInput.value, 10);
      if (!isNaN(val) && val >= 1) {
        currentRooms = val;
        bedroomsInput.value = Math.max(1, currentRooms - 1);
      }
    });
  }
}

// Stepper Helper
function stepVal(inputId, delta) {
  const el = document.getElementById(inputId);
  if (!el) return;
  const min = parseInt(el.min, 10) || 0;
  const max = parseInt(el.max, 10) || 100;
  let val = (parseInt(el.value, 10) || 0) + delta;
  if (val < min) val = min;
  if (val > max) val = max;
  el.value = val;
}

// 4. Synchronize Surfaces and Balcony
function setupSurfaceSync() {
  surfaceTotal.addEventListener('input', () => {
    const total = parseFloat(surfaceTotal.value) || 0;
    if (hasBalcony.checked) {
      surfaceCovered.value = Math.round(total * 0.9);
    } else {
      surfaceCovered.value = total;
    }
  });

  hasBalcony.addEventListener('change', () => {
    const total = parseFloat(surfaceTotal.value) || 0;
    if (hasBalcony.checked) {
      surfaceCovered.value = Math.round(total * 0.9);
    } else {
      surfaceCovered.value = total;
    }
  });
}

// 5. Submit & Appraisal Execution
function setupFormSubmit() {
  appraisalForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const barrio = barrioSelect.value;
    if (!barrio) {
      alert('Por favor, selecciona un barrio de CABA.');
      barrioSelect.focus();
      return;
    }

    const payload = {
      barrio: barrio,
      direccion: direccionInput.value.trim() || null,
      property_type: currentPropertyType,
      surface_total: parseFloat(surfaceTotal.value) || 50,
      surface_covered: parseFloat(surfaceCovered.value) || null,
      rooms: currentRooms,
      bedrooms: parseInt(bedroomsInput.value, 10) || 0,
      bathrooms: parseInt(bathroomsInput.value, 10) || 1,
      has_parking: hasParking.checked,
      has_balcony: hasBalcony.checked,
      is_a_estrenar: isEstrenar.checked,
      has_security: hasSecurity.checked,
      has_pool: hasPool.checked,
      has_parrilla: hasParrilla.checked,
      has_gym: hasGym.checked,
      has_sum: hasSum.checked,
      por_escalera: Boolean(porEscalera?.checked)
    };

    // UI State: Loading
    idleState.classList.add('hidden');
    resultCard.classList.add('hidden');
    loadingState.classList.remove('hidden');

    if (payload.direccion) {
      loadingStatusText.textContent = `Consultando API USIG GCBA para "${payload.direccion}"...`;
    } else {
      loadingStatusText.textContent = `Procesando valuación para ${payload.barrio}...`;
    }

    const timer = setTimeout(() => {
      loadingStatusText.textContent = 'Calculando estimación con el modelo...';
    }, 600);

    try {
      const response = await fetch('/api/appraise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      clearTimeout(timer);

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Error al procesar tasación');
      }

      const result = await response.json();
      displayResult(result, payload);

    } catch (err) {
      clearTimeout(timer);
      console.error(err);
      loadingState.classList.add('hidden');
      idleState.classList.remove('hidden');
      alert(`No se pudo completar la tasación: ${err.message}`);
    }
  });
}

// 6. Render Results in Card
function displayResult(res, req) {
  loadingState.classList.add('hidden');

  const estPrice = res.precio_estimado_usd || 0;
  const minPrice = res.rango_sugerido_min_usd || 0;
  const maxPrice = res.rango_sugerido_max_usd || 0;
  const priceM2 = res.precio_usd_m2 || 0;

  // Main Price
  document.getElementById('resEstimatedPrice').textContent = estPrice.toLocaleString('en-US');
  document.getElementById('resPriceRange').textContent = `${fmtUSD.format(minPrice)} − ${fmtUSD.format(maxPrice)} USD`;
  document.getElementById('resPriceM2').textContent = `USD ${priceM2.toLocaleString('en-US')} / m²`;

  // Summary Chips
  const summaryContainer = document.getElementById('resSummaryChips');
  summaryContainer.innerHTML = '';
  
  const chips = [
    `🏢 ${req.property_type}`,
    `📍 ${req.barrio}`,
    `📐 ${req.surface_total} m² totales`,
    `🛋️ ${req.rooms} amb (${req.bedrooms} dorm · ${req.bathrooms} baño${req.bathrooms > 1 ? 's' : ''})`
  ];
  if (req.has_parking) chips.push('🚗 Con cochera');
  if (req.has_balcony) chips.push('🪴 Con balcón');
  if (req.is_a_estrenar) chips.push('✨ A estrenar');
  if (req.por_escalera) chips.push('🪜 Por escalera (-15%)');
  if (res.calibraciones_aplicadas) {
    res.calibraciones_aplicadas.forEach(c => {
      if (c.factor && !c.factor.includes('escalera')) {
        chips.push(`ℹ️ ${c.factor} (${c.impact})`);
      }
    });
  }

  chips.forEach(c => {
    const span = document.createElement('span');
    span.className = 'summary-chip';
    span.textContent = c;
    summaryContainer.appendChild(span);
  });

  // Geolocation Info
  const geoDesc = document.getElementById('resGeoDesc');
  if (res.barrio_corregido && res.barrio_detectado) {
    geoDesc.textContent = `Dirección validada en ${res.barrio_detectado} (reemplaza ${res.barrio_solicitado || req.barrio})`;
  } else if (res.direccion_normalizada) {
    geoDesc.textContent = `${res.direccion_normalizada} (Confirmada por GCBA)`;
  } else {
    geoDesc.textContent = `${req.barrio} (Centroide del barrio)`;
  }

  // Timestamp
  const now = new Date();
  document.getElementById('resTimestamp').textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Show card with smooth scroll if on mobile
  resultCard.classList.remove('hidden');
  if (window.innerWidth <= 960) {
    resultCard.scrollIntoView({ behavior: 'smooth' });
  }
}

// 7. Reset Form Helper
function resetForm() {
  resultCard.classList.add('hidden');
  idleState.classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
