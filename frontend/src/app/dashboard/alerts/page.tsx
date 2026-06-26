'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import type { Alert } from '@/types';
import { Bell, Filter, CheckCircle } from 'lucide-react';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.get('/alerts').then(({ data }) => setAlerts(data.alerts || [])).catch(() => {
      setAlerts([
        { id: '1', timestamp: new Date().toISOString(), severity: 'critical', alert_type: 'congestion', source: 'Switch-2', message: 'Link utilization exceeded 90% on port 3', details: null, recommended_action: 'Reroute traffic via alternate path S1→S4→S3', acknowledged: false, resolved: false },
        { id: '2', timestamp: new Date(Date.now() - 120000).toISOString(), severity: 'warning', alert_type: 'high_latency', source: 'Link S2-S3', message: 'Average latency increased to 15ms (threshold: 10ms)', details: null, recommended_action: 'Monitor for 5 minutes, consider load balancing', acknowledged: false, resolved: false },
        { id: '3', timestamp: new Date(Date.now() - 300000).toISOString(), severity: 'info', alert_type: 'anomaly', source: 'AI Engine', message: 'Unusual traffic pattern detected from Host 3', details: null, recommended_action: 'Review traffic logs for potential anomaly', acknowledged: true, resolved: false },
        { id: '4', timestamp: new Date(Date.now() - 600000).toISOString(), severity: 'warning', alert_type: 'high_cpu', source: 'Switch-1', message: 'CPU usage reached 78%', details: null, recommended_action: 'Redistribute flows across switches', acknowledged: false, resolved: false },
      ]);
    });
  }, []);

  const filteredAlerts = filter === 'all' ? alerts : alerts.filter((a) => a.severity === filter);

  const severityIcon = (s: string) => {
    if (s === 'critical') return '🔴';
    if (s === 'warning') return '🟡';
    return '🔵';
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Alerts</h1>
          <p className="text-slate-400 text-sm mt-1">Network event notifications and recommended actions</p>
        </div>
        <div className="flex gap-2">
          {['all', 'critical', 'warning', 'info'].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === f ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30' : 'bg-slate-800/50 text-slate-400 border border-white/5 hover:border-white/10'}`}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filteredAlerts.map((alert, i) => (
          <motion.div key={alert.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className={`glass-card p-4 border-l-4 ${alert.severity === 'critical' ? 'border-l-rose-500' : alert.severity === 'warning' ? 'border-l-amber-500' : 'border-l-cyan-500'}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span>{severityIcon(alert.severity)}</span>
                  <span className={`badge ${alert.severity === 'critical' ? 'badge-danger' : alert.severity === 'warning' ? 'badge-warning' : 'badge-info'}`}>{alert.alert_type}</span>
                  <span className="text-xs text-slate-500">{alert.source}</span>
                  {alert.acknowledged && <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <p className="text-sm mb-1">{alert.message}</p>
                {alert.recommended_action && (
                  <p className="text-xs text-cyan-400/80">💡 {alert.recommended_action}</p>
                )}
              </div>
              <span className="text-xs text-slate-500 whitespace-nowrap ml-4">{new Date(alert.timestamp).toLocaleTimeString()}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
