'use client';

import { motion } from 'framer-motion';
import { useTrafficStore } from '@/stores/trafficStore';
import { Activity, Zap, Timer, Waves, AlertTriangle, Cpu } from 'lucide-react';
import { AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const tooltipStyle = { background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(56,189,248,0.2)', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' };

export default function TrafficPage() {
  const liveData = useTrafficStore((s) => s.liveData);
  const chartData = liveData.slice(-40).map((d, i) => ({ t: i, ...d }));

  const charts = [
    { title: 'Bandwidth Usage', icon: Zap, color: '#06b6d4', key: 'throughput', unit: 'Mbps' },
    { title: 'Packets Per Second', icon: Waves, color: '#3b82f6', key: 'packet_count', unit: 'pps' },
    { title: 'Latency', icon: Timer, color: '#f59e0b', key: 'latency', unit: 'ms' },
    { title: 'Jitter', icon: Activity, color: '#8b5cf6', key: 'jitter', unit: 'ms' },
    { title: 'Packet Loss', icon: AlertTriangle, color: '#f43f5e', key: 'packet_loss', unit: '%' },
    { title: 'CPU Usage', icon: Cpu, color: '#10b981', key: 'cpu_usage', unit: '%' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Traffic Monitoring</h1>
        <p className="text-slate-400 text-sm mt-1">Real-time network traffic analytics</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {charts.map((chart, i) => (
          <motion.div key={chart.key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="glass-card p-5">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <chart.icon className="w-4 h-4" style={{ color: chart.color }} />
              {chart.title}
              <span className="ml-auto text-xs text-slate-500 font-mono">{chart.unit}</span>
            </h3>
            <ResponsiveContainer width="100%" height={180}>
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
      </div>
    </div>
  );
}
