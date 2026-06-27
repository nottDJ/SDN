'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useTrafficStore } from '@/stores/trafficStore';
import api from '@/lib/api';
import { Activity, Zap, Timer, Waves, AlertTriangle, Cpu, BarChart3, RefreshCw, TrendingUp } from 'lucide-react';
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts';

const tooltipStyle = {
  background: 'rgba(15,23,42,0.95)',
  border: '1px solid rgba(56,189,248,0.2)',
  borderRadius: '8px',
  color: '#f8fafc',
  fontSize: '12px',
};

interface TrafficStats {
  avg_throughput: number;
  max_throughput: number;
  avg_latency: number;
  avg_packet_loss: number;
  total_packets: number;
  total_bytes: number;
  avg_cpu: number;
  avg_memory: number;
  record_count: number;
}

export default function TrafficPage() {
  const liveData = useTrafficStore((s) => s.liveData);
  const chartData = liveData.slice(-40).map((d, i) => ({ t: i, ...d }));
  const [stats, setStats] = useState<TrafficStats | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await api.get('/traffic/stats?hours=1');
      setStats(data);
    } catch {
      setStats({
        avg_throughput: 542.3, max_throughput: 987.1, avg_latency: 2.41,
        avg_packet_loss: 0.08, total_packets: 1428320, total_bytes: 1024 * 1024 * 512,
        avg_cpu: 36.5, avg_memory: 51.2, record_count: 720,
      });
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const { data } = await api.get('/traffic/history?limit=10');
      setHistory(data.records || []);
    } catch {
      // Use dummy data
      const now = Date.now();
      setHistory(Array.from({ length: 8 }, (_, i) => ({
        id: i, timestamp: new Date(now - i * 5000).toISOString(),
        throughput: 400 + Math.random() * 400,
        latency: 1.5 + Math.random() * 3,
        packet_loss: Math.random() * 0.5,
        cpu_usage: 25 + Math.random() * 40,
        flow_count: 30 + Math.floor(Math.random() * 30),
        link_utilization: 0.3 + Math.random() * 0.5,
      })));
    }
    setLoadingHistory(false);
  }, []);

  useEffect(() => {
    fetchStats();
    fetchHistory();
    const iv = setInterval(fetchStats, 10000);
    return () => clearInterval(iv);
  }, [fetchStats, fetchHistory]);

  const statCards = stats ? [
    { label: 'Avg Throughput', value: `${stats.avg_throughput.toFixed(1)} Mbps`, icon: Zap, color: '#06b6d4' },
    { label: 'Peak Throughput', value: `${stats.max_throughput.toFixed(1)} Mbps`, icon: TrendingUp, color: '#3b82f6' },
    { label: 'Avg Latency', value: `${stats.avg_latency.toFixed(2)} ms`, icon: Timer, color: '#f59e0b' },
    { label: 'Packet Loss', value: `${stats.avg_packet_loss.toFixed(3)}%`, icon: AlertTriangle, color: stats.avg_packet_loss > 1 ? '#f43f5e' : '#10b981' },
    { label: 'Total Packets', value: (stats.total_packets / 1e6).toFixed(2) + 'M', icon: Waves, color: '#8b5cf6' },
    { label: 'Total Data', value: (stats.total_bytes / (1024 * 1024)).toFixed(0) + ' MB', icon: BarChart3, color: '#10b981' },
    { label: 'Avg CPU', value: `${stats.avg_cpu.toFixed(1)}%`, icon: Cpu, color: '#f43f5e' },
    { label: 'Records (1h)', value: stats.record_count.toString(), icon: Activity, color: '#64748b' },
  ] : [];

  const charts = [
    { title: 'Bandwidth Usage', icon: Zap, color: '#06b6d4', key: 'throughput', unit: 'Mbps' },
    { title: 'Packets Per Second', icon: Waves, color: '#3b82f6', key: 'packet_count', unit: 'pps' },
    { title: 'Latency', icon: Timer, color: '#f59e0b', key: 'latency', unit: 'ms' },
    { title: 'Jitter', icon: Activity, color: '#8b5cf6', key: 'jitter', unit: 'ms' },
    { title: 'Packet Loss', icon: AlertTriangle, color: '#f43f5e', key: 'packet_loss', unit: '%' },
    { title: 'CPU Usage', icon: Cpu, color: '#10b981', key: 'cpu_usage', unit: '%' },
  ];

  const utilizationData = chartData.map((d) => ({
    t: d.t,
    utilization: (d.link_utilization * 100).toFixed(1),
    flows: d.flow_count,
  }));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Traffic Monitoring</h1>
          <p className="text-slate-400 text-sm mt-1">Real-time network traffic analytics and historical data</p>
        </div>
        <button onClick={fetchStats} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/50 border border-white/5 hover:border-cyan-500/30 text-sm transition-all">
          <RefreshCw className="w-3.5 h-3.5 text-cyan-400" /> Refresh
        </button>
      </div>

      {/* Stat Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3 mb-6">
          {statCards.map((card, i) => (
            <motion.div key={card.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="stat-card">
              <card.icon className="w-4 h-4 mb-2" style={{ color: card.color }} />
              <div className="text-sm font-bold font-mono" style={{ color: card.color }}>{card.value}</div>
              <div className="text-xs text-slate-500 mt-1">{card.label}</div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Live Charts — 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {charts.map((chart, i) => (
          <motion.div key={chart.key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="glass-card p-5">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <chart.icon className="w-4 h-4" style={{ color: chart.color }} />
              {chart.title}
              <span className="ml-auto text-xs text-slate-500 font-mono">{chart.unit}</span>
            </h3>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id={`grad-${chart.key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chart.color} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={chart.color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.06)" />
                <XAxis dataKey="t" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey={chart.key} stroke={chart.color} fill={`url(#grad-${chart.key})`} strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        ))}

        {/* Link Utilization + Flow Count combined */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-purple-400" /> Link Utilization & Flow Count
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={utilizationData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.06)" />
              <XAxis dataKey="t" stroke="#64748b" fontSize={10} tickLine={false} />
              <YAxis yAxisId="left" stroke="#8b5cf6" fontSize={10} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" stroke="#06b6d4" fontSize={10} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
              <Bar yAxisId="left" dataKey="utilization" name="Utilization %" fill="#8b5cf6" radius={[2, 2, 0, 0]} fillOpacity={0.7} />
              <Bar yAxisId="right" dataKey="flows" name="Flow Count" fill="#06b6d4" radius={[2, 2, 0, 0]} fillOpacity={0.7} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Historical Data Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400" /> Recent Traffic Records
          </h3>
          <button onClick={fetchHistory} disabled={loadingHistory} className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors">
            {loadingHistory ? 'Loading...' : 'Refresh'}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="table-dark">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Throughput</th>
                <th>Latency</th>
                <th>Packet Loss</th>
                <th>CPU</th>
                <th>Flows</th>
                <th>Utilization</th>
              </tr>
            </thead>
            <tbody>
              {history.map((r, i) => (
                <tr key={i}>
                  <td className="font-mono text-xs text-slate-400">{new Date(r.timestamp).toLocaleTimeString()}</td>
                  <td className="font-mono text-cyan-400">{r.throughput?.toFixed(1)} Mbps</td>
                  <td className="font-mono text-amber-400">{r.latency?.toFixed(2)} ms</td>
                  <td className={`font-mono ${r.packet_loss > 1 ? 'text-rose-400' : 'text-emerald-400'}`}>{r.packet_loss?.toFixed(3)}%</td>
                  <td className="font-mono">{r.cpu_usage?.toFixed(1)}%</td>
                  <td className="font-mono text-blue-400">{r.flow_count}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-800 rounded-full h-1.5 max-w-20">
                        <div className="h-1.5 rounded-full transition-all" style={{ width: `${Math.min((r.link_utilization || 0) * 100, 100)}%`, background: r.link_utilization > 0.8 ? '#f43f5e' : r.link_utilization > 0.5 ? '#f59e0b' : '#10b981' }} />
                      </div>
                      <span className="text-xs font-mono text-slate-400">{((r.link_utilization || 0) * 100).toFixed(0)}%</span>
                    </div>
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
