'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import type { MLModel } from '@/types';
import { toast } from '@/stores/toastStore';
import {
  Brain, Target, TrendingUp, Clock, Zap, BarChart3,
  RefreshCw, AlertTriangle, CheckCircle, History,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  AreaChart, Area, Legend,
} from 'recharts';

const tooltipStyle = {
  background: 'rgba(15,23,42,0.95)',
  border: '1px solid rgba(56,189,248,0.2)',
  borderRadius: '8px',
  color: '#f8fafc',
  fontSize: '12px',
};

const algorithms = [
  { id: 'random_forest', label: 'Random Forest', color: '#10b981' },
  { id: 'xgboost', label: 'XGBoost', color: '#3b82f6' },
  { id: 'lstm', label: 'LSTM', color: '#8b5cf6' },
  { id: 'gru', label: 'GRU', color: '#f59e0b' },
];

const horizons = ['5min', '10min', '30min'];

export default function PredictionsPage() {
  const [models, setModels] = useState<MLModel[]>([]);
  const [selectedModel, setSelectedModel] = useState('random_forest');
  const [horizon, setHorizon] = useState('5min');
  const [prediction, setPrediction] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'predict' | 'history'>('predict');

  useEffect(() => {
    api.get('/predictions/models').then(({ data }) => setModels(data)).catch(() => {});
    api.get('/predictions/history?limit=20').then(({ data }) => setHistory(data.predictions || [])).catch(() => {});
  }, []);

  const runPrediction = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/predictions/predict', { model_name: selectedModel, horizon });
      setPrediction(data);
      toast.success('Prediction Complete', `${algorithms.find(a => a.id === selectedModel)?.label} model ran successfully`);
    } catch {
      const fallback = {
        predicted_throughput: 589.2, predicted_latency: 2.8,
        predicted_utilization: 0.62, confidence: 0.87, is_congestion_predicted: false,
        model_name: selectedModel, horizon,
      };
      setPrediction(fallback);
      toast.info('Using demo data', 'Backend not connected');
    }
    setLoading(false);
  };

  const activateModel = async (modelId: string) => {
    try {
      await api.post(`/predictions/models/${modelId}/activate`);
      toast.success('Model Activated');
      api.get('/predictions/models').then(({ data }) => setModels(data)).catch(() => {});
    } catch { toast.error('Failed to activate model'); }
  };

  // Build feature importance data from selected model or fallback
  const activeModel = models.find(m => m.algorithm === selectedModel);
  const featureData = activeModel?.feature_importance
    ? Object.entries(activeModel.feature_importance).map(([f, v]) => ({ feature: f, importance: v })).sort((a, b) => b.importance - a.importance)
    : [
      { feature: 'Throughput', importance: 0.28 },
      { feature: 'Latency', importance: 0.18 },
      { feature: 'Packet Loss', importance: 0.15 },
      { feature: 'Flow Count', importance: 0.12 },
      { feature: 'Utilization', importance: 0.11 },
      { feature: 'Byte Count', importance: 0.09 },
      { feature: 'Jitter', importance: 0.07 },
    ];

  // Radar data for model comparison
  const radarData = [
    { metric: 'Accuracy', rf: 92, xgb: 94, lstm: 91, gru: 90 },
    { metric: 'Precision', rf: 90, xgb: 93, lstm: 88, gru: 87 },
    { metric: 'Recall', rf: 89, xgb: 91, lstm: 89, gru: 88 },
    { metric: 'F1 Score', rf: 91, xgb: 92, lstm: 89, gru: 88 },
    { metric: 'Speed', rf: 95, xgb: 88, lstm: 60, gru: 65 },
  ];

  // Build utilization trend from history
  const historyChartData = history.slice(0, 20).reverse().map((h, i) => ({
    i,
    utilization: (h.predicted_utilization ?? 0) * 100,
    throughput: h.predicted_throughput ?? 0,
    congestion: h.is_congestion_predicted ? 100 : 0,
  }));

  const demoModels = models.length > 0 ? models : [
    { id: '1', name: 'random_forest_demo', algorithm: 'random_forest', version: '1', accuracy: 0.92, rmse: 0.05, mae: 0.03, training_time: 2.3, prediction_time: 0.8, is_active: true, metrics: {}, feature_importance: {}, hyperparameters: {}, trained_at: new Date().toISOString() },
    { id: '2', name: 'xgboost_demo', algorithm: 'xgboost', version: '1', accuracy: 0.94, rmse: 0.04, mae: 0.025, training_time: 3.1, prediction_time: 1.1, is_active: false, metrics: {}, feature_importance: {}, hyperparameters: {}, trained_at: new Date().toISOString() },
    { id: '3', name: 'lstm_demo', algorithm: 'lstm', version: '1', accuracy: 0.91, rmse: 0.06, mae: 0.04, training_time: 15.7, prediction_time: 3.2, is_active: false, metrics: {}, feature_importance: {}, hyperparameters: {}, trained_at: new Date().toISOString() },
    { id: '4', name: 'gru_demo', algorithm: 'gru', version: '1', accuracy: 0.90, rmse: 0.07, mae: 0.045, training_time: 12.2, prediction_time: 2.8, is_active: false, metrics: {}, feature_importance: {}, hyperparameters: {}, trained_at: new Date().toISOString() },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">AI Predictions</h1>
          <p className="text-slate-400 text-sm mt-1">ML-powered congestion prediction and network analytics</p>
        </div>
        {/* Tab switcher */}
        <div className="flex gap-2">
          {(['predict', 'history'] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${activeTab === tab ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30' : 'bg-slate-800/50 text-slate-400 border border-white/5'}`}>
              {tab === 'history' ? <><History className="w-3.5 h-3.5 inline mr-1.5" />History</> : <><Brain className="w-3.5 h-3.5 inline mr-1.5" />Predict</>}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'predict' && (
        <>
          {/* Controls */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4 mb-6">
            <div className="flex flex-wrap gap-4 items-end">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Model</label>
                <div className="flex gap-2 flex-wrap">
                  {algorithms.map((algo) => (
                    <button key={algo.id} onClick={() => setSelectedModel(algo.id)} className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${selectedModel === algo.id ? 'text-white border-transparent' : 'bg-slate-800/50 text-slate-400 border-white/5 hover:border-white/10'}`} style={selectedModel === algo.id ? { background: algo.color + '30', borderColor: algo.color + '60', color: algo.color } : {}}>
                      {algo.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Prediction Horizon</label>
                <div className="flex gap-2">
                  {horizons.map((h) => (
                    <button key={h} onClick={() => setHorizon(h)} className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${horizon === h ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' : 'bg-slate-800/50 text-slate-400 border-white/5'}`}>
                      {h}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={runPrediction} disabled={loading} className="btn-glow flex items-center gap-2 disabled:opacity-50">
                {loading ? <><RefreshCw className="w-4 h-4 animate-spin" /> Predicting...</> : <>🔮 Run Prediction</>}
              </button>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            {/* Prediction Results */}
            {prediction ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5">
                <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                  <Brain className="w-4 h-4 text-cyan-400" /> Prediction Results
                  <span className="ml-auto text-xs text-slate-500">{(prediction.model_name as string)} · {prediction.horizon as string}</span>
                </h3>
                <div className="space-y-3">
                  {[
                    { label: 'Predicted Throughput', value: `${((prediction.predicted_throughput as number) ?? 0).toFixed(1)} Mbps`, icon: Zap, color: '#06b6d4' },
                    { label: 'Predicted Latency', value: `${((prediction.predicted_latency as number) ?? 0).toFixed(2)} ms`, icon: Clock, color: '#f59e0b' },
                    { label: 'Predicted Utilization', value: `${(((prediction.predicted_utilization as number) ?? 0) * 100).toFixed(1)}%`, icon: TrendingUp, color: '#3b82f6' },
                    { label: 'Confidence Score', value: `${(((prediction.confidence as number) ?? 0) * 100).toFixed(1)}%`, icon: Target, color: '#10b981' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30">
                      <span className="flex items-center gap-2 text-sm text-slate-300">
                        <item.icon className="w-4 h-4" style={{ color: item.color }} />
                        {item.label}
                      </span>
                      <span className="font-mono font-semibold text-sm" style={{ color: item.color }}>{item.value}</span>
                    </div>
                  ))}
                  {/* Confidence Gauge */}
                  <div className="p-3 rounded-lg bg-slate-800/30">
                    <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                      <span>Confidence</span>
                      <span className="font-mono text-emerald-400">{(((prediction.confidence as number) ?? 0) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all duration-500" style={{ width: `${((prediction.confidence as number) ?? 0) * 100}%` }} />
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg text-center font-semibold text-sm flex items-center justify-center gap-2 ${prediction.is_congestion_predicted ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                    {prediction.is_congestion_predicted ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                    {prediction.is_congestion_predicted ? 'Congestion Predicted — Rerouting Recommended' : 'No Congestion Expected'}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-5 flex items-center justify-center text-slate-500 text-sm">
                Run a prediction to see results
              </motion.div>
            )}

            {/* Feature Importance */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-5">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-purple-400" /> Feature Importance
                <span className="ml-auto text-xs text-slate-500">{algorithms.find(a => a.id === selectedModel)?.label}</span>
              </h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={featureData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.06)" />
                  <XAxis type="number" stroke="#64748b" fontSize={10} />
                  <YAxis type="category" dataKey="feature" stroke="#64748b" fontSize={10} width={80} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="importance" radius={[0, 4, 4, 0]}>
                    {featureData.map((_, i) => (
                      <rect key={i} fill={`hsl(${200 + i * 20}, 80%, 60%)`} />
                    ))}
                  </Bar>
                  <Bar dataKey="importance" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* Model Radar + Utilization Timeline */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-5">
              <h3 className="text-sm font-semibold mb-4">Model Radar Comparison</h3>
              <ResponsiveContainer width="100%" height={260}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(148,163,184,0.12)" />
                  <PolarAngleAxis dataKey="metric" stroke="#64748b" fontSize={10} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#64748b" fontSize={8} />
                  <Radar name="Random Forest" dataKey="rf" stroke="#10b981" fill="#10b981" fillOpacity={0.15} strokeWidth={2} />
                  <Radar name="XGBoost" dataKey="xgb" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} strokeWidth={2} />
                  <Radar name="LSTM" dataKey="lstm" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.10} strokeWidth={2} />
                  <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                </RadarChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass-card p-5">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" /> Predicted Utilization Timeline
              </h3>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={historyChartData.length > 0 ? historyChartData : Array.from({ length: 10 }, (_, i) => ({ i, utilization: 30 + Math.random() * 40, throughput: 400 + Math.random() * 300, congestion: 0 }))}>
                  <defs>
                    <linearGradient id="utilGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.06)" />
                  <XAxis dataKey="i" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="utilization" name="Utilization %" stroke="#06b6d4" fill="url(#utilGrad)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* Model Comparison Table */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold">Model Comparison</h3>
              <span className="text-xs text-slate-500">{demoModels.length} models available</span>
            </div>
            <div className="overflow-x-auto">
              <table className="table-dark">
                <thead>
                  <tr>
                    <th>Model</th><th>Accuracy</th><th>RMSE</th><th>MAE</th>
                    <th>Train Time</th><th>Predict Time</th><th>Status</th><th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {demoModels.map((m: any) => (
                    <tr key={m.id}>
                      <td>
                        <div className="font-semibold text-sm">{m.name}</div>
                        <div className="text-xs text-slate-500 capitalize">{m.algorithm}</div>
                      </td>
                      <td className="font-mono text-emerald-400">{((m.accuracy ?? 0) * 100).toFixed(1)}%</td>
                      <td className="font-mono">{(m.rmse ?? 0).toFixed(4)}</td>
                      <td className="font-mono">{(m.mae ?? 0).toFixed(4)}</td>
                      <td className="font-mono text-slate-400">{(m.training_time ?? 0).toFixed(1)}s</td>
                      <td className="font-mono text-slate-400">{(m.prediction_time ?? 0).toFixed(1)}ms</td>
                      <td>{m.is_active ? <span className="badge badge-success">Active</span> : <span className="badge badge-info">Available</span>}</td>
                      <td>
                        {!m.is_active && (
                          <button onClick={() => activateModel(m.id)} className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors">
                            Activate
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </>
      )}

      {activeTab === 'history' && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <History className="w-4 h-4 text-blue-400" /> Prediction History
          </h3>
          <div className="overflow-x-auto">
            <table className="table-dark">
              <thead>
                <tr>
                  <th>Time</th><th>Model</th><th>Horizon</th>
                  <th>Throughput</th><th>Latency</th><th>Utilization</th>
                  <th>Confidence</th><th>Congestion</th>
                </tr>
              </thead>
              <tbody>
                {(history.length > 0 ? history : Array.from({ length: 5 }, (_, i) => ({
                  timestamp: new Date(Date.now() - i * 30000).toISOString(),
                  model_name: 'random_forest', horizon: '5min',
                  predicted_throughput: 450 + Math.random() * 200,
                  predicted_latency: 1.5 + Math.random() * 3,
                  predicted_utilization: 0.3 + Math.random() * 0.5,
                  confidence: 0.8 + Math.random() * 0.15,
                  is_congestion_predicted: Math.random() > 0.7,
                }))).map((h: any, i: number) => (
                  <tr key={i}>
                    <td className="text-xs text-slate-400">{new Date(h.timestamp).toLocaleTimeString()}</td>
                    <td className="capitalize text-sm">{h.model_name?.replace(/_/g, ' ')}</td>
                    <td><span className="badge badge-info">{h.horizon}</span></td>
                    <td className="font-mono text-cyan-400">{(h.predicted_throughput ?? 0).toFixed(1)} Mbps</td>
                    <td className="font-mono text-amber-400">{(h.predicted_latency ?? 0).toFixed(2)} ms</td>
                    <td className="font-mono">{((h.predicted_utilization ?? 0) * 100).toFixed(1)}%</td>
                    <td className="font-mono text-emerald-400">{((h.confidence ?? 0) * 100).toFixed(1)}%</td>
                    <td>{h.is_congestion_predicted ? <span className="badge badge-danger">⚠ Yes</span> : <span className="badge badge-success">✓ No</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}
