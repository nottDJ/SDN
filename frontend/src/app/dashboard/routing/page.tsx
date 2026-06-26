'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { GitBranch, Route, History, Zap } from 'lucide-react';

export default function RoutingPage() {
  const [algorithm, setAlgorithm] = useState('dijkstra');

  const routingHistory = [
    { id: 1, time: '2 min ago', src: '10.0.1.1', dst: '10.0.2.1', algo: 'Congestion-Aware', original: 'S1→S2→S3', new: 'S1→S4→S3', reason: 'Link S2-S3 utilization > 80%', improvement: '+15%' },
    { id: 2, time: '8 min ago', src: '10.0.1.2', dst: '10.0.3.1', algo: 'Dijkstra', original: 'S1→S2', new: 'S1→S2', reason: 'Optimal path maintained', improvement: '0%' },
    { id: 3, time: '15 min ago', src: '10.0.2.1', dst: '10.0.4.1', algo: 'Load Balanced', original: 'S2→S3→S4', new: 'S2→S4', reason: 'Better weight distribution', improvement: '+8%' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Routing Engine</h1>
        <p className="text-slate-400 text-sm mt-1">Intelligent traffic routing with multiple algorithms</p>
      </div>

      {/* Algorithm Selector */}
      <div className="glass-card p-4 mb-6">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Route className="w-4 h-4 text-cyan-400" /> Routing Algorithm</h3>
        <div className="flex flex-wrap gap-3">
          {[
            { id: 'dijkstra', label: 'Shortest Path (Dijkstra)', desc: 'Minimum hop count' },
            { id: 'weighted', label: 'Load Balanced', desc: 'Weighted by utilization' },
            { id: 'congestion', label: 'Congestion-Aware', desc: 'Avoids congested links' },
            { id: 'backup', label: 'Backup Route', desc: 'Edge-disjoint failover' },
          ].map((algo) => (
            <button key={algo.id} onClick={() => setAlgorithm(algo.id)} className={`p-3 rounded-lg border text-left transition-all ${algorithm === algo.id ? 'border-cyan-500 bg-cyan-500/10' : 'border-white/5 bg-slate-800/30 hover:border-white/10'}`}>
              <div className="text-sm font-semibold">{algo.label}</div>
              <div className="text-xs text-slate-500">{algo.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Routing History */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><History className="w-4 h-4 text-blue-400" /> Routing History</h3>
        <div className="overflow-x-auto">
          <table className="table-dark">
            <thead><tr><th>Time</th><th>Source</th><th>Destination</th><th>Algorithm</th><th>Original Route</th><th>New Route</th><th>Reason</th><th>Improvement</th></tr></thead>
            <tbody>
              {routingHistory.map((r) => (
                <tr key={r.id}>
                  <td className="text-slate-400 text-xs">{r.time}</td>
                  <td className="font-mono text-xs">{r.src}</td>
                  <td className="font-mono text-xs">{r.dst}</td>
                  <td><span className="badge badge-info">{r.algo}</span></td>
                  <td className="font-mono text-xs text-slate-400">{r.original}</td>
                  <td className="font-mono text-xs text-cyan-400">{r.new}</td>
                  <td className="text-xs">{r.reason}</td>
                  <td className="font-mono text-emerald-400 text-xs">{r.improvement}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
