import { ExperienceDashboard } from '../components/ExperienceDashboard';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';
const envMode = (process.env.NEXT_PUBLIC_DATA_MODE ?? 'emulation').toLowerCase();
const DEFAULT_MODE = (envMode === 'simulation' ? 'simulation' : 'emulation') as 'simulation' | 'emulation';

async function getPrograms(mode: string) {
  const response = await fetch(`${API_BASE}/programs/?mode=${mode}`, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error('Failed to load programs');
  }
  return response.json();
}

async function getScenarios(mode: string) {
  const response = await fetch(`${API_BASE}/scenarios/?mode=${mode}`, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error('Failed to load scenarios');
  }
  return response.json();
}

async function getMetrics(mode: string) {
  const response = await fetch(`${API_BASE}/metrics/?mode=${mode}`, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error('Failed to load metrics');
  }
  return response.json();
}

export default async function Home() {
  const [programs, scenarios, metrics] = await Promise.all([
    getPrograms(DEFAULT_MODE).catch(() => []),
    getScenarios(DEFAULT_MODE).catch(() => []),
    getMetrics(DEFAULT_MODE).catch(() => null),
  ]);

  return (
    <ExperienceDashboard
      programs={programs}
      scenarios={scenarios}
      metrics={metrics}
      initialMode={DEFAULT_MODE}
    />
  );
}
