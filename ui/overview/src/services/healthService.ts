/* System health. LIVE when the page is served by DataBridge and you are signed in: CPU, memory, disk and
   network of the DataBridge host from /api/overview/host. Otherwise SIMULATED (a gentle random walk). */
import { apiGet } from './apiClient';
import type { DataSource } from './types';

export interface HealthSample {
  time: number;
  cpu: number; // 0..1
  memory: number;
  storage: number;
  network: number; // share of the nominal link speed
  networkMbps: number;
  source: DataSource;
  host?: string;
}

interface HostResponse {
  cpu: number;
  memory: number;
  storage: number;
  network_mbps: number;
  network_share: number;
  host?: string;
  time: number;
}

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

let sim: HealthSample = { time: Date.now(), cpu: 0.32, memory: 0.48, storage: 0.67, network: 0.28, networkMbps: 280, source: 'demo' };

function simulate(): HealthSample {
  const walk = (v: number, lo: number, hi: number, step: number) => clamp(v + (Math.random() - 0.5) * step, lo, hi);
  const network = walk(sim.network, 0.08, 0.62, 0.09);
  sim = {
    time: Date.now(),
    cpu: walk(sim.cpu, 0.14, 0.72, 0.08),
    memory: walk(sim.memory, 0.38, 0.66, 0.025),
    storage: clamp(sim.storage + Math.random() * 0.0004, 0.6, 0.9),
    network,
    networkMbps: Math.round(network * 1000),
    source: 'demo',
  };
  return sim;
}

let liveBroken = false;

export async function sampleHealth(): Promise<HealthSample> {
  if (!liveBroken) {
    try {
      const r = await apiGet<HostResponse>('/api/overview/host', 4000);
      return { time: r.time * 1000, cpu: r.cpu / 100, memory: r.memory / 100, storage: r.storage / 100, network: r.network_share, networkMbps: r.network_mbps, source: 'live', host: r.host };
    } catch {
      liveBroken = true; // stop asking; the UI shows "Simulated"
    }
  }
  return simulate();
}

/** let the user retry live data (e.g. after signing in) */
export const retryLiveHealth = () => {
  liveBroken = false;
};
