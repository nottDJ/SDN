'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import { toast } from '@/stores/toastStore';
import type { Alert } from '@/types';
import { Bell, CheckCircle, XCircle, RefreshCw, AlertTriangle, Info, Filter } from 'lucide-react';

const severityConfig = {
  critical: { color: '#f43f5e', border: 'border-rose-500', bg: 'border-l-rose-500', icon: XCircle, badge: 'badge-danger', emoji: '🔴' },
  warning: { color: '#f59e0b', border: 'border-amber-500', bg: 'border-l-amber-500', icon: AlertTriangle, badge: 'badge-warning', emoji: '🟡' },
  info: { color: '#06b6d4', border: 'border-cyan-500', bg: 'border-l-cyan-500', icon: Info, badge: 'badge-info', emoji: '🔵' },
};

const DEMO_ALERTS: Alert[] = [
  { id: '1', timestamp: new Date().toISOString(), severity: 'critical', alert_type: 'congestion', source: 'Switch-2', message: 'Link utilization exceeded 90% on port 3 — auto-reroute initiated', details: null, recommended_action: 'Traffic rerouted via S1→S4→S3. Monitor for 5 minutes.', acknowledged: false, resolved: false },
  { id: '2', timestamp: new Date(Date.now() - 120000).toISOString(), severity: 'warning', alert_type: 'high_latency', source: 'Link S2-S3', message: 'Average latency increased to 15ms (threshold: 10ms)', details: null, recommended_action: 'Monitor for 5 minutes, consider load balancing', acknowledged: false, resolved: false },
  { id: '3', timestamp: new Date(Date.now() - 300000).toISOString(), severity: 'info', alert_type: 'anomaly', source: 'AI Engine', message: 'Unusual traffic pattern detected from Host 3 — possible port scan', details: null, recommended_action: 'Review traffic logs for potential anomaly', acknowledged: true, resolved: false },
  { id: '4', timestamp: new Date(Date.now() - 600000).toISOString(), severity: 'warning', alert_type: 'high_cpu', source: 'Switch-1', message: 'CPU usage reached 78% — nearing threshold', details: null, recommended_action: 'Redistribute flows across switches', acknowledged: false, resolved: false },
  { id: '5', timestamp: new Date(Date.now() - 900000).toISOString(), severity: 'info', alert_type: 'bandwidth_exhaustion', source: 'Link S1-S2', message: 'Bandwidth usage at 85% of capacity', details: null, recommended_action: 'Consider upgrading link capacity or enabling QoS', acknowledged: true, resolved: true },
];

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [ackFilter, setAckFilter] = useState<string>('all');
  const [loading, setLoading] = useState(false);

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/alerts?limit=50');
      setAlerts(data.alerts || DEMO_ALERTS);
    } catch {
      setAlerts(DEMO_ALERTS);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchAlerts(); const iv = setInterval(fetchAlerts, 15000); return () => clearInterval(iv); }, [fetchAlerts]);

  const handleAcknowledge = async (id: string) => {
    try {
      await api.post(`/alerts/${id}/acknowledge`, { acknowledged_by: 'admin' });
      setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, acknowledged: true } : a));
      toast.success('Alert acknowledged');
    } catch {
      setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, acknowledged: true } : a));
      toast.success('Alert acknowledged');
    }
  };

  const handleResolve = (id: string) => {
    setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, resolved: true, acknowledged: true } : a));
    toast.success('Alert resolved');
  };

  const filtered = alerts.filter((a) => {
    const sMatch = filter === 'all' || a.severity === filter;
    const ackMatch = ackFilter === 'all' || (ackFilter === 'unack' && !a.acknowledged) || (ackFilter === 'ack' && a.acknowledged);
    return sMatch && ackMatch;
  });

  const counts = { critical: alerts.filter(a => a.severity === 'critical' && !a.acknowledged).length, warning: alerts.filter(a => a.severity === 'warning' && !a.acknowledged).length, info: alerts.filter(a => a.severity === 'info' && !a.acknowledged).length };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Alerts</h1>
          <p className="text-slate-400 text-sm mt-1">Network event notifications and recommended actions</p>
        </div>
        <button onClick={fetchAlerts} disabled={loading} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/50 border border-white/5 hover:border-cyan-500/30 text-sm transition-all disabled:opacity-50">
          <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Critical', count: counts.critical, color: '#f43f5e', bg: 'rgba(244,63,94,0.1)', border: 'rgba(244,63,94,0.2)' },
          { label: 'Warning', count: counts.warning, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)' },
          { label: 'Info', count: counts.info, color: '#06b6d4', bg: 'rgba(6,182,212,0.1)', border: 'rgba(6,182,212,0.2)' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="glass-card p-4 cursor-pointer" style={{ borderColor: s.border }}
            onClick={() => setFilter(s.label.toLowerCase())}
          >
            <div className="text-2xl font-bold font-mono mb-1" style={{ color: s.color }}>{s.count}</div>
            <div className="text-xs text-slate-400">Unacknowledged {s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="glass-card p-3 mb-4 flex flex-wrap gap-3 items-center">
        <Filter className="w-4 h-4 text-slate-400" />
        <div className="flex gap-2">
          {['all', 'critical', 'warning', 'info'].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1 rounded-lg text-xs font-medium transition-all capitalize ${filter === f ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30' : 'bg-slate-800/50 text-slate-400 border border-white/5 hover:border-white/10'}`}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <div className="border-l border-white/10 h-4" />
        <div className="flex gap-2">
          {[['all', 'All'], ['unack', 'Unacknowledged'], ['ack', 'Acknowledged']].map(([val, label]) => (
            <button key={val} onClick={() => setAckFilter(val)} className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${ackFilter === val ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30' : 'bg-slate-800/50 text-slate-400 border border-white/5 hover:border-white/10'}`}>
              {label}
            </button>
          ))}
        </div>
        <span className="ml-auto text-xs text-slate-500">{filtered.length} alerts</span>
      </div>

      {/* Alert List */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="glass-card p-8 text-center text-slate-400 text-sm">
            <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            No alerts matching current filters
          </div>
        )}
        {filtered.map((alert, i) => {
          const cfg = severityConfig[alert.severity] || severityConfig.info;
          const Icon = cfg.icon;
          return (
            <motion.div key={alert.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
              className={`glass-card p-4 border-l-4 ${cfg.bg} ${alert.resolved ? 'opacity-50' : ''}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <Icon className="w-4 h-4 flex-shrink-0" style={{ color: cfg.color }} />
                    <span className={`badge ${cfg.badge}`}>{alert.alert_type.replace(/_/g, ' ')}</span>
                    {alert.source && <span className="text-xs text-slate-500">{alert.source}</span>}
                    {alert.acknowledged && <span className="badge badge-success text-xs">✓ Acknowledged</span>}
                    {alert.resolved && <span className="badge badge-info text-xs">Resolved</span>}
                  </div>
                  <p className="text-sm text-slate-200 mb-1">{alert.message}</p>
                  {alert.recommended_action && (
                    <p className="text-xs text-cyan-400/80">💡 {alert.recommended_action}</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <span className="text-xs text-slate-500 whitespace-nowrap">{new Date(alert.timestamp).toLocaleTimeString()}</span>
                  {!alert.resolved && (
                    <div className="flex gap-2">
                      {!alert.acknowledged && (
                        <button onClick={() => handleAcknowledge(alert.id)} className="px-2 py-1 rounded text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Ack
                        </button>
                      )}
                      <button onClick={() => handleResolve(alert.id)} className="px-2 py-1 rounded text-xs bg-slate-700/50 text-slate-400 border border-white/5 hover:border-white/10 transition-all flex items-center gap-1">
                        <XCircle className="w-3 h-3" /> Resolve
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
