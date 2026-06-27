'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import { toast } from '@/stores/toastStore';
import { GraduationCap, Upload, Play, BarChart3, Save, FileText, X, Table, RefreshCw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, Legend } from 'recharts';

const tooltipStyle = {
  background: 'rgba(15,23,42,0.95)',
  border: '1px solid rgba(56,189,248,0.2)',
  borderRadius: '8px',
  color: '#f8fafc',
  fontSize: '12px',
};

const featureOptions = ['throughput', 'latency', 'jitter', 'packet_loss', 'flow_count', 'link_utilization', 'byte_count', 'packet_count', 'cpu_usage', 'memory_usage'];

interface DatasetInfo {
  filename: string;
  rows: number;
  columns: string[];
}

export default function TrainingPage() {
  const [algorithm, setAlgorithm] = useState('random_forest');
  const [training, setTraining] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [selectedFeatures, setSelectedFeatures] = useState(featureOptions.slice(0, 6));
  const [epochs, setEpochs] = useState(50);
  const [trainSplit, setTrainSplit] = useState(0.8);
  const [dataset, setDataset] = useState<DatasetInfo | null>(null);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'train' | 'compare'>('train');
  const fileRef = useRef<HTMLInputElement>(null);
  const progressRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const handleFileUpload = async (file: File) => {
    if (!file.name.endsWith('.csv')) { toast.error('Invalid file', 'Only CSV files are accepted'); return; }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await api.post('/training/upload-dataset', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setDataset({ filename: data.filename, rows: data.rows, columns: data.columns });
      // Update feature options based on uploaded columns
      const matching = data.columns.filter((c: string) => featureOptions.includes(c));
      if (matching.length > 0) setSelectedFeatures(matching.slice(0, 6));
      toast.success('Dataset uploaded', `${data.rows} rows, ${data.columns.length} columns`);
    } catch {
      // Demo fallback
      setDataset({ filename: file.name, rows: 5000, columns: featureOptions });
      toast.info('Demo mode', 'Dataset info simulated');
    }
    setUploading(false);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  }, []);

  const handleTrain = async () => {
    if (selectedFeatures.length < 2) { toast.error('Select at least 2 features'); return; }
    setTraining(true);
    setProgress(0);
    setResult(null);
    progressRef.current = setInterval(() => setProgress((p) => Math.min(p + Math.random() * 12, 95)), 600);
    try {
      const { data } = await api.post('/predictions/train', {
        algorithm, features: selectedFeatures,
        epochs: ['lstm', 'gru'].includes(algorithm) ? epochs : undefined,
        train_split: trainSplit,
      });
      clearInterval(progressRef.current);
      setProgress(100);
      setResult(data);
      toast.success('Training Complete', `${algorithm} model trained successfully`);
    } catch {
      clearInterval(progressRef.current);
      setProgress(100);
      const demoResult = {
        model_name: `${algorithm}_${Date.now()}`,
        algorithm,
        metrics: { accuracy: 0.923, precision: 0.918, recall: 0.907, f1_score: 0.912, rmse: 0.042, mae: 0.028, r2_score: 0.941 },
        feature_importance: Object.fromEntries(selectedFeatures.map((f, i) => [f, Math.round((0.28 - i * 0.03) * 100) / 100])),
        training_time: 3.7,
        status: 'completed',
      };
      setResult(demoResult);
      toast.info('Demo result', 'Backend not connected — showing simulated training');
    }
    setTraining(false);
  };

  const toggleFeature = (f: string) => {
    setSelectedFeatures((prev) => prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]);
  };

  // Training loss curve (simulated)
  const lossData = Array.from({ length: epochs }, (_, i) => ({
    epoch: i + 1,
    train_loss: 0.5 * Math.exp(-i / (epochs / 4)) + 0.02 + Math.random() * 0.015,
    val_loss: 0.55 * Math.exp(-i / (epochs / 4)) + 0.03 + Math.random() * 0.02,
  }));

  // Model comparison data
  const comparisonData = [
    { name: 'Random Forest', accuracy: 92, rmse: 4.2, mae: 2.8, speed: 95, memory: 30 },
    { name: 'XGBoost', accuracy: 94, rmse: 3.8, mae: 2.5, speed: 88, memory: 35 },
    { name: 'LSTM', accuracy: 91, rmse: 5.1, mae: 3.4, speed: 55, memory: 70 },
    { name: 'GRU', accuracy: 90, rmse: 5.6, mae: 3.8, speed: 62, memory: 65 },
  ];

  const featureImportanceData = result?.feature_importance
    ? Object.entries(result.feature_importance as Record<string, number>)
        .map(([f, v]) => ({ feature: f, importance: Number(v) }))
        .sort((a, b) => b.importance - a.importance)
    : [];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">AI Model Training</h1>
          <p className="text-slate-400 text-sm mt-1">Train, evaluate, and compare ML models for traffic prediction</p>
        </div>
        <div className="flex gap-2">
          {(['train', 'compare'] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${activeTab === tab ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30' : 'bg-slate-800/50 text-slate-400 border border-white/5'}`}>
              {tab === 'train' ? '🚀 Train' : '📊 Compare'}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'train' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left: Configuration */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 space-y-5">
            <h3 className="text-sm font-semibold flex items-center gap-2"><GraduationCap className="w-4 h-4 text-cyan-400" /> Configuration</h3>

            {/* Dataset Upload */}
            <div>
              <label className="text-xs text-slate-400 block mb-2">Dataset (CSV)</label>
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-white/10 rounded-xl p-4 text-center cursor-pointer hover:border-cyan-500/40 transition-colors"
              >
                {dataset ? (
                  <div className="text-sm">
                    <FileText className="w-6 h-6 text-cyan-400 mx-auto mb-1" />
                    <div className="font-medium text-slate-200">{dataset.filename}</div>
                    <div className="text-xs text-slate-500">{dataset.rows.toLocaleString()} rows · {dataset.columns.length} columns</div>
                  </div>
                ) : (
                  <div className="text-sm text-slate-500">
                    {uploading ? <RefreshCw className="w-5 h-5 animate-spin mx-auto" /> : <Upload className="w-5 h-5 mx-auto mb-1" />}
                    {uploading ? 'Uploading...' : 'Drop CSV or click to upload'}
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])} />
            </div>

            {/* Algorithm */}
            <div>
              <label className="text-xs text-slate-400 block mb-1">Algorithm</label>
              <select value={algorithm} onChange={(e) => setAlgorithm(e.target.value)} className="input-dark">
                <option value="random_forest">Random Forest</option>
                <option value="xgboost">XGBoost</option>
                <option value="lstm">LSTM (Deep Learning)</option>
                <option value="gru">GRU (Deep Learning)</option>
              </select>
            </div>

            {/* Features */}
            <div>
              <label className="text-xs text-slate-400 block mb-2">Features ({selectedFeatures.length}/{featureOptions.length})</label>
              <div className="flex flex-wrap gap-1.5">
                {featureOptions.map((f) => (
                  <button key={f} onClick={() => toggleFeature(f)} className={`px-2 py-1 rounded text-xs transition-all font-mono ${selectedFeatures.includes(f) ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-slate-800/50 text-slate-500 border border-white/5'}`}>
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Epochs (for deep learning) */}
            {['lstm', 'gru'].includes(algorithm) && (
              <div>
                <label className="text-xs text-slate-400 flex justify-between mb-1">
                  <span>Epochs</span><span className="font-mono text-cyan-400">{epochs}</span>
                </label>
                <input type="range" min={10} max={200} step={10} value={epochs} onChange={(e) => setEpochs(Number(e.target.value))} className="w-full accent-cyan-500" />
              </div>
            )}

            {/* Train/Val Split */}
            <div>
              <label className="text-xs text-slate-400 flex justify-between mb-1">
                <span>Train Split</span><span className="font-mono text-cyan-400">{(trainSplit * 100).toFixed(0)}% / {((1 - trainSplit) * 100).toFixed(0)}%</span>
              </label>
              <input type="range" min={0.6} max={0.9} step={0.05} value={trainSplit} onChange={(e) => setTrainSplit(Number(e.target.value))} className="w-full accent-cyan-500" />
            </div>

            {/* Train Button */}
            <button onClick={handleTrain} disabled={training} className="btn-glow w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50">
              {training ? <><RefreshCw className="w-4 h-4 animate-spin" /> Training {progress.toFixed(0)}%</> : <><Play className="w-4 h-4" /> Start Training</>}
            </button>
            {training && (
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            )}
          </motion.div>

          {/* Right: Charts */}
          <div className="lg:col-span-2 space-y-4">
            {/* Loss Chart */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-5">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-purple-400" /> Training / Validation Loss</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={lossData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.06)" />
                  <XAxis dataKey="epoch" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} domain={[0, 0.6]} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                  <Line type="monotone" dataKey="train_loss" stroke="#06b6d4" strokeWidth={2} dot={false} name="Training Loss" />
                  <Line type="monotone" dataKey="val_loss" stroke="#f59e0b" strokeWidth={2} dot={false} name="Validation Loss" />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Results */}
            <AnimatePresence>
              {result && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass-card p-5">
                  <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                    <Save className="w-4 h-4 text-emerald-400" /> Training Results — {result.model_name as string}
                    <span className="ml-auto badge badge-success">✓ Completed in {(result.training_time as number)?.toFixed(1)}s</span>
                  </h3>
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mb-4">
                    {Object.entries((result.metrics || {}) as Record<string, number>).map(([key, val]) => (
                      <div key={key} className="p-3 rounded-lg bg-slate-800/30 text-center">
                        <div className="text-xs text-slate-400 mb-1 uppercase">{key.replace(/_/g, ' ')}</div>
                        <div className="text-lg font-mono font-bold text-cyan-400">{val.toFixed(4)}</div>
                      </div>
                    ))}
                  </div>
                  {featureImportanceData.length > 0 && (
                    <>
                      <h4 className="text-xs font-semibold text-slate-400 mb-2">Feature Importance</h4>
                      <ResponsiveContainer width="100%" height={140}>
                        <BarChart data={featureImportanceData} layout="vertical">
                          <XAxis type="number" stroke="#64748b" fontSize={9} />
                          <YAxis type="category" dataKey="feature" stroke="#64748b" fontSize={9} width={90} />
                          <Tooltip contentStyle={tooltipStyle} />
                          <Bar dataKey="importance" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {activeTab === 'compare' && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold mb-4">Accuracy Comparison</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.06)" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={10} domain={[85, 100]} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                <Bar dataKey="accuracy" name="Accuracy %" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                <Bar dataKey="speed" name="Speed Score" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Table className="w-4 h-4 text-blue-400" /> Detailed Comparison</h3>
            <div className="overflow-x-auto">
              <table className="table-dark">
                <thead><tr><th>Model</th><th>Accuracy</th><th>RMSE</th><th>MAE</th><th>Speed Score</th><th>Memory (MB)</th></tr></thead>
                <tbody>
                  {comparisonData.map((m) => (
                    <tr key={m.name}>
                      <td className="font-semibold">{m.name}</td>
                      <td className="font-mono text-emerald-400">{m.accuracy}%</td>
                      <td className="font-mono">{m.rmse}</td>
                      <td className="font-mono">{m.mae}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-800 rounded-full h-1.5">
                            <div className="h-1.5 rounded-full bg-emerald-500" style={{ width: `${m.speed}%` }} />
                          </div>
                          <span className="text-xs font-mono text-slate-400">{m.speed}</span>
                        </div>
                      </td>
                      <td className="font-mono text-slate-400">{m.memory}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
