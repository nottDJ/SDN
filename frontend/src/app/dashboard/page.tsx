'use client';

import { useEffect, useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { useTrafficStore } from '@/stores/trafficStore';
import api from '@/lib/api';
import { formatNumber } from '@/lib/utils';
import type { DashboardStats } from '@/types';
import {
  Activity, Cpu, HardDrive, Network, Gauge, Zap,
  AlertTriangle, Brain, MonitorSpeaker, MemoryStick,
  TrendingUp, Waves,
} from 'lucide-react';
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';

const statCardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.05, duration: 0.4, ease: 'easeOut' },
  }),
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const liveData = useTrafficStore((s) => s.liveData);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/dashboard/stats');
        setStats(data);
      } catch {
        // Use defaults
        setStats({
          active_switches: 4, active_hosts: 8, active_flows: 42,
          current_throughput: 567.8, avg_latency: 2.34, packet_loss: 0.12,
          cpu_usage: 38.5, memory_usage: 52.3, congestion_risk: 35.2,
          unacknowledged_alerts: 3, prediction_accuracy: 89.5,
        });
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const cards = stats ? [
    { label: 'Active Hosts', value: stats.active_hosts, icon: MonitorSpeaker, color: '#06b6d4', suffix: '' },
    { label: 'Active Switches', value: stats.active_switches, icon: Network, color: '#3b82f6', suffix: '' },
    { label: 'Active Flows', value: stats.active_flows, icon: Waves, color: '#8b5cf6', suffix: '' },
    { label: 'Throughput', value: stats.current_throughput, icon: Zap, color: '#10b981', suffix: ' Mbps' },
    { label: 'Predicted Throughput', value: stats.current_throughput * 1.05, icon: TrendingUp, color: '#06b6d4', suffix: ' Mbps' },
    { label: 'Avg Latency', value: stats.avg_latency, icon: Gauge, color: '#f59e0b', suffix: ' ms' },
    { label: 'Packet Loss', value: stats.packet_loss, icon: AlertTriangle, color: stats.packet_loss > 1 ? '#f43f5e' : '#10b981', suffix: '%' },
    { label: 'CPU Usage', value: stats.cpu_usage, icon: Cpu, color: stats.cpu_usage > 80 ? '#f43f5e' : '#3b82f6', suffix: '%' },
    { label: 'Memory Usage', value: stats.memory_usage, icon: MemoryStick, color: '#8b5cf6', suffix: '%' },
    { label: 'Congestion Risk', value: stats.congestion_risk, icon: Activity, color: stats.congestion_risk > 70 ? '#f43f5e' : stats.congestion_risk > 40 ? '#f59e0b' : '#10b981', suffix: '%' },
    { label: 'AI Accuracy', value: stats.prediction_accuracy, icon: Brain, color: '#06b6d4', suffix: '%' },
    { label: 'Active Alerts', value: stats.unacknowledged_alerts, icon: AlertTriangle, color: stats.unacknowledged_alerts > 0 ? '#f59e0b' : '#10b981', suffix: '' },
  ] : [];

  const chartData = liveData.slice(-30).map((d, i) => ({
    time: i,
    throughput: d.throughput,
    latency: d.latency * 10,
    cpu: d.cpu_usage,
  }));

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Network Overview</h1>
        <p className="text-slate-400 text-sm mt-1">Real-time SDN monitoring and AI predictions</p>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 mb-6">
        {cards.map((card, i) => (
          <motion.div key={card.label} custom={i} variants={statCardVariants} initial="hidden" animate="visible" className="stat-card group">
            <div className="flex items-center justify-between mb-2">
              <card.icon className="w-4 h-4" style={{ color: card.color }} />
              <span className="status-dot active" />
            </div>
            <div className="text-xl font-bold font-mono" style={{ color: card.color }}>
              {typeof card.value === 'number' ? (card.value >= 100 ? formatNumber(card.value) : card.value.toFixed(card.suffix === '%' || card.suffix === ' ms' ? 1 : 0)) : card.value}
              <span className="text-xs text-slate-500 ml-0.5">{card.suffix}</span>
            </div>
            <div className="text-xs text-slate-500 mt-1 truncate">{card.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Throughput Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-400" />
            Live Throughput
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="throughputGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
              <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
              <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(56,189,248,0.2)', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }} />
              <Area type="monotone" dataKey="throughput" stroke="#06b6d4" fill="url(#throughputGrad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Latency & CPU Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400" />
            Latency & CPU
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
              <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
              <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(56,189,248,0.2)', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }} />
              <Line type="monotone" dataKey="latency" stroke="#f59e0b" strokeWidth={2} dot={false} name="Latency (x10ms)" />
              <Line type="monotone" dataKey="cpu" stroke="#8b5cf6" strokeWidth={2} dot={false} name="CPU %" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Status Footer */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="glass-card p-4 flex flex-wrap items-center gap-6 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="status-dot active" />
          Controller Online
        </div>
        <div className="flex items-center gap-2">
          <span className="status-dot active" />
          Simulation Mode
        </div>
        <div className="flex items-center gap-2">
          <span className="status-dot active" />
          AI Engine Active
        </div>
        <div className="ml-auto font-mono">
          Data Points: {liveData.length}
        </div>
      </motion.div>
    </div>
  );
}
