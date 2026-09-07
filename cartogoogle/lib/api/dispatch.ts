export interface DispatchConfirmation {
  status: 'dispatched';
  eta: string;
  unit: string;
  incidentId: string;
  timestamp: string;
  message: string;
}

// TODO: replace mock body with real POST /api/incidents/:id/dispatch once backend is available
export async function dispatchCoastGuard(incidentId: string): Promise<DispatchConfirmation> {
  // Simulate network dispatch latency
  await new Promise((resolve) => setTimeout(resolve, 1200));

  // Rare simulated rejection path for testing error UI & retry flow (5% probability)
  if (Math.random() < 0.05) {
    throw new Error('Satellite uplink timeout: Regional Maritime Rescue Coordination Centre (MRCC) unreachable. Please retry dispatch.');
  }

  const units = [
    'ICGS Samudra Prahari (CG-104)',
    'ICGS Samarth (CG-11)',
    'ICGS Varaha (CG-41)',
    'ICGS Vikram (CG-33)',
  ];
  const selectedUnit = units[Math.floor(Math.random() * units.length)];
  const etaMinutes = Math.floor(15 + Math.random() * 20);

  return {
    status: 'dispatched',
    eta: `${etaMinutes} min`,
    unit: selectedUnit,
    incidentId,
    timestamp: new Date().toISOString(),
    message: `Indian Coast Guard tasking order acknowledged. Response cutter ${selectedUnit} en route (ETA: ${etaMinutes} min).`,
  };
}

