'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import { toast } from '@/stores/toastStore';
import {
  GitBranch, Route, History, Zap, RefreshCw,
  ArrowRight, Play, Network, TrendingUp,
} from 'lucide-react';

interface RoutingEntry {
  id?: number;
  time?: string;
  timestamp?: string;
  source_ip?: string;
  destination_ip?: string;
  algorithm?: string;
  original_path?: string[] | string;
  new_path?: string[] | string;
  reason?: string;
  latency_improvement?: number;
  throughput_improvement?: number;
  triggered_by?: string;
}

const DEMO_HISTORY: RoutingEntry[] = [
  { id: 1, timestamp: new Date(Date.now() - 120000).toISOString(), source_ip: '10.0.1.1', destination_ip: '10.0.2.1', algorithm: 'congestion_aware', original_path: ['s1', 's2', 's3'], new_path: ['s1', 's4', 's3'], reason: 'Link S2-S3 utilization > 80%', latency_improvement: 15, throughput_improvement: 12 },
  { id: 2, timestamp: new Date(Date.now() - 480000).toISOString(), source_ip: '10.0.1.2', destination_ip: '10.0.3.1', algorithm: 'dijkstra', original_path: ['s1', 's2'], new_path: ['s1', 's2'], reason: 'Optimal path maintained', latency_improvement: 0, throughput_improvement: 0 },
  { id: 3, timestamp: new Date(Date.now() - 900000).toISOString(), source_ip: '10.0.2.1', destination_ip: '10.0.4.1', algorithm: 'load_balanced', original_path: ['s2', 's3', 's4'], new_path: ['s2', 's4'], reason: 'Better weight distribution', latency_improvement: 8, throughput_improvement: 6 },
  { id: 4, timestamp: new Date(Date.now() - 1800000).toISOString(), source_ip: '10.0.3.2', destination_ip: '10.0.1.1', algorithm: 'backup_route', original_path: ['s3', 's2', 's1'], new_path: ['s3', 's4', 's1'], reason: 'Switch s2 failover detected', latency_improvement: -2, throughput_improvement: 5 },
];

const algorithms = [
  { id: 'dijkstra', label: 'Shortest Path (Dijkstra)', desc: 'Minimum hop count' },
  { id: 'load_balanced', label: 'Load Balanced', desc: 'Weighted by utilization' },
  { id: 'congestion_aware', label: 'Congestion-Aware', desc: 'Avoids congested links' },
  { id: 'backup_route', label: 'Backup Route', desc: 'Edge-disjoint failover' },
];

const pathToString = (path: string[] | string | undefined): string => {
  if (!path) return 'N/A';
  if (Array.isArray(path)) return path.join(' → ');
  return path;
};

export default function RoutingPage() {
  const [algorithm, setAlgorithm] = useState('congestion_aware');
  const [srcIp, setSrcIp] = useState('10.0.1.1');
  const [dstIp, setDstIp] = useState('10.0.2.1');
  const [history, setHistory] = useState<RoutingEntry[]>([]);
  const [computing, setComputing] = useState(false);
  const [computeResult, setComputeResult] = useState<RoutingEntry | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/routing/history');
      setHistory(Array.isArray(data) ? data : data.entries || DEMO_HISTORY);
    } catch {
      setHistory(DEMO_HISTORY);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const handleCompute = async () => {
    setComputing(true);
    try {
      const { data } = await api.post('/routing/compute', { source_ip: srcIp, destination_ip: dstIp, algorithm });
      setComputeResult(data);
      toast.success('Route Computed', `Path found using ${algorithm}`);
    } catch {
      // Demo result
      const paths: Record<string, { orig: string[]; new: string[] }> = {
        dijkstra: { orig: ['s1', 's2', 's3'], new: ['s1', 's2', 's3'] },
        load_balanced: { orig: ['s1', 's2', 's3'], new: ['s1', 's4', 's3'] },
        congestion_aware: { orig: ['s1', 's2', 's3'], new: ['s1', 's4', 's3'] },
        backup_route: { orig: ['s1', 's2', 's3'], new: ['s1', 's3'] },
      };
      const p = paths[algorithm] || paths.dijkstra;
      setComputeResult({
        source_ip: srcIp, destination_ip: dstIp, algorithm,
        original_path: p.orig, new_path: p.new,
        reason: 'Route computed based on current network state',
        latency_improvement: algorithm === 'dijkstra' ? 0 : Math.floor(Math.random() * 20),
        throughput_improvement: algorithm === 'dijkstra' ? 0 : Math.floor(Math.random() * 15),
      });
      toast.info('Demo route', 'Backend not connected — showing simulated result');
    }
    setComputing(false);
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Routing Engine</h1>
          <p className="text-slate-400 text-sm mt-1">Intelligent traffic routing with multiple algorithms</p>
        </div>
        <button onClick={fetchHistory} disabled={loading} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/50 border border-white/5 hover:border-cyan-500/30 text-sm transition-all">
          <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Route Computation Panel */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 mb-6">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <Route className="w-4 h-4 text-cyan-400" /> Compute Route
        </h3>
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="text-xs text-slate-400 block mb-1">Source IP</label>
            <input type="text" value={srcIp} onChange={(e) => setSrcIp(e.target.value)} className="input-dark w-36 font-mono" placeholder="10.0.1.1" />
          </div>
          <ArrowRight className="w-5 h-5 text-slate-500 mb-2" />
          <div>
            <label className="text-xs text-slate-400 block mb-1">Destination IP</label>
            <input type="text" value={dstIp} onChange={(e) => setDstIp(e.target.value)} className="input-dark w-36 font-mono" placeholder="10.0.2.1" />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Algorithm</label>
            <select value={algorithm} onChange={(e) => setAlgorithm(e.target.value)} className="input-dark w-48">
              {algorithms.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
            </select>
          </div>
          <button onClick={handleCompute} disabled={computing} className="btn-glow flex items-center gap-2 disabled:opacity-50 mb-0.5">
            {computing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            {computing ? 'Computing...' : 'Compute Route'}
          </button>
        </div>

        {/* Compute result */}
        {computeResult && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-800/40 border border-white/5">
              <div className="text-xs text-slate-400 mb-2">Current Path</div>
              <div className="flex items-center gap-2 flex-wrap">
                {(Array.isArray(computeResult.original_path) ? computeResult.original_path : []).map((node, i, arr) => (
                  <span key={i} className="flex items-center gap-2">
                    <span className="px-2 py-1 rounded bg-slate-700 text-xs font-mono text-slate-300">{node}</span>
                    {i < arr.length - 1 && <ArrowRight className="w-3 h-3 text-slate-500" />}
                  </span>
                ))}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20">
              <div className="text-xs text-cyan-400 mb-2">Recommended Path</div>
              <div className="flex items-center gap-2 flex-wrap">
                {(Array.isArray(computeResult.new_path) ? computeResult.new_path : []).map((node, i, arr) => (
                  <span key={i} className="flex items-center gap-2">
                    <span className="px-2 py-1 rounded bg-cyan-500/20 text-xs font-mono text-cyan-300">{node}</span>
                    {i < arr.length - 1 && <ArrowRight className="w-3 h-3 text-cyan-500" />}
                  </span>
                ))}
              </div>
              {(computeResult.latency_improvement ?? 0) > 0 && (
                <div className="mt-2 flex gap-4 text-xs">
                  <span className="text-emerald-400">↑ {computeResult.latency_improvement}% latency improvement</span>
                  <span className="text-blue-400">↑ {computeResult.throughput_improvement}% throughput improvement</span>
                </div>
              )}
              {computeResult.reason && <p className="mt-1 text-xs text-slate-400">{computeResult.reason}</p>}
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Algorithm Cards */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-5 mb-6">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Network className="w-4 h-4 text-blue-400" /> Routing Algorithms
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {algorithms.map((algo) => (
            <button key={algo.id} onClick={() => setAlgorithm(algo.id)} className={`p-4 rounded-xl border text-left transition-all ${algorithm === algo.id ? 'border-cyan-500 bg-cyan-500/10' : 'border-white/5 bg-slate-800/30 hover:border-white/10'}`}>
              <div className="text-sm font-semibold mb-1">{algo.label}</div>
              <div className="text-xs text-slate-500">{algo.desc}</div>
              {algorithm === algo.id && <div className="mt-2 text-xs text-cyan-400">● Selected</div>}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Routing History Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-5">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <History className="w-4 h-4 text-purple-400" /> Routing History
          <span className="ml-auto text-xs text-slate-500">{history.length} events</span>
        </h3>
        <div className="overflow-x-auto">
          <table className="table-dark">
            <thead>
              <tr>
                <th>Time</th><th>Source</th><th>Destination</th>
                <th>Algorithm</th><th>Original Path</th><th>New Path</th>
                <th>Reason</th><th>Improvement</th>
              </tr>
            </thead>
            <tbody>
              {history.map((r, i) => (
                <tr key={i}>
                  <td className="text-slate-400 text-xs whitespace-nowrap">
                    {r.timestamp ? new Date(r.timestamp).toLocaleTimeString() : r.time || 'N/A'}
                  </td>
                  <td className="font-mono text-xs">{r.source_ip || 'N/A'}</td>
                  <td className="font-mono text-xs">{r.destination_ip || 'N/A'}</td>
                  <td><span className="badge badge-info text-xs">{(r.algorithm || 'N/A').replace(/_/g, ' ')}</span></td>
                  <td className="font-mono text-xs text-slate-400">{pathToString(r.original_path)}</td>
                  <td className="font-mono text-xs text-cyan-400">{pathToString(r.new_path)}</td>
                  <td className="text-xs max-w-[200px] truncate" title={r.reason}>{r.reason || 'N/A'}</td>
                  <td>
                    {(r.latency_improvement ?? 0) > 0 ? (
                      <span className="font-mono text-emerald-400 text-xs">+{r.latency_improvement}%</span>
                    ) : (r.latency_improvement ?? 0) < 0 ? (
                      <span className="font-mono text-rose-400 text-xs">{r.latency_improvement}%</span>
                    ) : (
                      <span className="font-mono text-slate-500 text-xs">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
