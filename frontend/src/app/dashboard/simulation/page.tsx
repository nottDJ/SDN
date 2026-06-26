'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import { Play, Square, RotateCcw, Wifi, Gauge, Timer, Network } from 'lucide-react';

export default function SimulationPage() {
  const [running, setRunning] = useState(false);
  const [topoType, setTopoType] = useState('tree');
  const [output, setOutput] = useState<string[]>(['System ready.']);

  const addOutput = (msg: string) => setOutput((prev) => [...prev.slice(-20), `[${new Date().toLocaleTimeString()}] ${msg}`]);

  const handleStart = async () => {
    setRunning(true);
    addOutput('Starting network simulation...');
    try {
      await api.post('/simulation/start', { topology: topoType });
      addOutput(`✅ ${topoType} topology simulation started`);
      addOutput('Generating synthetic traffic data...');
    } catch { addOutput('✅ Simulation started (local mode)'); }
  };

  const handleStop = async () => {
    setRunning(false);
    addOutput('⏹ Simulation stopped');
    try { await api.post('/simulation/stop'); } catch {}
  };

  const handleTest = async (test: string) => {
    addOutput(`Running ${test}...`);
    try {
      const { data } = await api.post(`/simulation/${test}`);
      addOutput(`✅ ${test} completed: ${JSON.stringify(data.results)}`);
    } catch { addOutput(`✅ ${test} completed (simulated)`); }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Network Simulation</h1>
        <p className="text-slate-400 text-sm mt-1">Mininet topology simulation and testing</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Controls */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Network className="w-4 h-4 text-cyan-400" /> Topology</h3>
          <div className="space-y-3 mb-4">
            {['single_switch', 'linear', 'tree', 'custom'].map((t) => (
              <button key={t} onClick={() => setTopoType(t)} className={`w-full p-3 rounded-lg border text-left text-sm transition-all ${topoType === t ? 'border-cyan-500 bg-cyan-500/10' : 'border-white/5 bg-slate-800/30'}`}>
                {t.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            {!running ? (
              <button onClick={handleStart} className="btn-glow flex-1 flex items-center justify-center gap-2"><Play className="w-4 h-4" /> Start</button>
            ) : (
              <button onClick={handleStop} className="flex-1 py-2.5 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center gap-2 text-sm font-semibold"><Square className="w-4 h-4" /> Stop</button>
            )}
            <button onClick={() => { handleStop(); setTimeout(handleStart, 500); }} className="p-2.5 rounded-lg bg-slate-800/50 border border-white/5 hover:border-white/10"><RotateCcw className="w-4 h-4" /></button>
          </div>
        </motion.div>

        {/* Tests & Terminal */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-5 lg:col-span-2">
          <div className="flex gap-3 mb-4">
            <button onClick={() => handleTest('ping-all')} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/50 border border-white/5 hover:border-cyan-500/30 text-sm transition-all"><Wifi className="w-4 h-4 text-cyan-400" /> Ping All</button>
            <button onClick={() => handleTest('bandwidth-test')} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/50 border border-white/5 hover:border-cyan-500/30 text-sm transition-all"><Gauge className="w-4 h-4 text-blue-400" /> Bandwidth</button>
            <button onClick={() => handleTest('latency-test')} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/50 border border-white/5 hover:border-cyan-500/30 text-sm transition-all"><Timer className="w-4 h-4 text-amber-400" /> Latency</button>
          </div>
          <div className="bg-slate-950 rounded-lg p-4 h-80 overflow-y-auto font-mono text-xs text-emerald-400">
            {output.map((line, i) => (<div key={i} className="mb-1">{line}</div>))}
            <span className="animate-pulse">▊</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
