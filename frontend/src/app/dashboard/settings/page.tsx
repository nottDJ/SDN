'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Save, Sliders, Shield, Database, Bell } from 'lucide-react';

export default function SettingsPage() {
  const [threshold, setThreshold] = useState(80);
  const [predInterval, setPredInterval] = useState(5);
  const [simMode, setSimMode] = useState(true);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-slate-400 text-sm mt-1">Configure system parameters and thresholds</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Prediction Settings */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Sliders className="w-4 h-4 text-cyan-400" /> Prediction Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 flex justify-between mb-2">
                <span>Congestion Threshold</span>
                <span className="font-mono text-cyan-400">{threshold}%</span>
              </label>
              <input type="range" min={50} max={95} value={threshold} onChange={(e) => setThreshold(Number(e.target.value))} className="w-full accent-cyan-500" />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Prediction Interval (seconds)</label>
              <input type="number" value={predInterval} onChange={(e) => setPredInterval(Number(e.target.value))} className="input-dark w-32" min={1} max={60} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Simulation Mode</span>
              <button onClick={() => setSimMode(!simMode)} className={`w-12 h-6 rounded-full transition-all ${simMode ? 'bg-cyan-500' : 'bg-slate-700'} relative`}>
                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${simMode ? 'left-6' : 'left-0.5'}`} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* System Info */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Database className="w-4 h-4 text-blue-400" /> System Information</h3>
          <div className="space-y-3">
            {[
              { label: 'Backend', value: 'FastAPI v0.115' },
              { label: 'Database', value: 'PostgreSQL 16' },
              { label: 'Controller', value: 'Ryu OpenFlow 1.3' },
              { label: 'ML Framework', value: 'TensorFlow + XGBoost' },
              { label: 'Frontend', value: 'Next.js 15 + React 19' },
            ].map((item) => (
              <div key={item.label} className="flex justify-between p-2 rounded bg-slate-800/30">
                <span className="text-xs text-slate-400">{item.label}</span>
                <span className="text-xs font-mono text-cyan-400">{item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
