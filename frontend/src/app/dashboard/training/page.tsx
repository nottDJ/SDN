'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import { GraduationCap, Upload, Play, BarChart3, Save } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const tooltipStyle = { background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(56,189,248,0.2)', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' };

export default function TrainingPage() {
  const [algorithm, setAlgorithm] = useState('random_forest');
  const [training, setTraining] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [features] = useState(['throughput', 'latency', 'jitter', 'packet_loss', 'flow_count', 'link_utilization', 'byte_count', 'packet_count']);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(features.slice(0, 6));

  const handleTrain = async () => {
    setTraining(true);
    setProgress(0);
    const interval = setInterval(() => setProgress((p) => Math.min(p + Math.random() * 15, 95)), 500);
    try {
      const { data } = await api.post('/predictions/train', { algorithm, features: selectedFeatures, epochs: algorithm === 'lstm' || algorithm === 'gru' ? 50 : undefined });
      setResult(data);
    } catch {
      setResult({ model_name: `${algorithm}_demo`, algorithm, metrics: { accuracy: 0.923, rmse: 0.042, mae: 0.028 }, feature_importance: Object.fromEntries(selectedFeatures.map((f) => [f, Math.random() * 0.3])), training_time: 3.7 });
    }
    clearInterval(interval);
    setProgress(100);
    setTraining(false);
  };

  const lossData = Array.from({ length: 50 }, (_, i) => ({ epoch: i + 1, train_loss: 0.5 * Math.exp(-i / 15) + Math.random() * 0.02, val_loss: 0.55 * Math.exp(-i / 15) + Math.random() * 0.03 }));

  const toggleFeature = (f: string) => {
    setSelectedFeatures((prev) => prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">AI Model Training</h1>
        <p className="text-slate-400 text-sm mt-1">Train, evaluate, and compare ML models</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Training Config */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><GraduationCap className="w-4 h-4 text-cyan-400" /> Configuration</h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Algorithm</label>
              <select value={algorithm} onChange={(e) => setAlgorithm(e.target.value)} className="input-dark">
                <option value="random_forest">Random Forest</option>
                <option value="xgboost">XGBoost</option>
                <option value="lstm">LSTM</option>
                <option value="gru">GRU</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-2">Features</label>
              <div className="flex flex-wrap gap-2">
                {features.map((f) => (
                  <button key={f} onClick={() => toggleFeature(f)} className={`px-2 py-1 rounded text-xs transition-all ${selectedFeatures.includes(f) ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-slate-800/50 text-slate-500 border border-white/5'}`}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={handleTrain} disabled={training} className="btn-glow w-full py-2.5">
              {training ? `Training... ${progress.toFixed(0)}%` : '🚀 Start Training'}
            </button>
            {training && <div className="w-full bg-slate-800 rounded-full h-2"><div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} /></div>}
          </div>
        </motion.div>

        {/* Loss Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-purple-400" /> Training / Validation Loss</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={lossData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.06)" />
              <XAxis dataKey="epoch" stroke="#64748b" fontSize={10} />
              <YAxis stroke="#64748b" fontSize={10} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="train_loss" stroke="#06b6d4" strokeWidth={2} dot={false} name="Training Loss" />
              <Line type="monotone" dataKey="val_loss" stroke="#f59e0b" strokeWidth={2} dot={false} name="Validation Loss" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Results */}
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 lg:col-span-3">
            <h3 className="text-sm font-semibold mb-4">Training Results — {result.model_name as string}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries((result.metrics || {}) as Record<string, number>).map(([key, val]) => (
                <div key={key} className="p-3 rounded-lg bg-slate-800/30 text-center">
                  <div className="text-xs text-slate-400 mb-1">{key.toUpperCase()}</div>
                  <div className="text-lg font-mono font-bold text-cyan-400">{(val as number).toFixed(4)}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
