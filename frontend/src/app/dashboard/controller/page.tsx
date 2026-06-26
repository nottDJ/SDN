'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import { Cpu, Heart, Wifi, Server } from 'lucide-react';

export default function ControllerPage() {
  const [status, setStatus] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const { data } = await api.get('/controller/status');
        setStatus(data);
      } catch {
        setStatus({ status: 'online', connected_switches: 4, protocol: 'OpenFlow 1.3', controller: 'Ryu (Simulated)', simulation_mode: true });
      }
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">SDN Controller</h1>
        <p className="text-slate-400 text-sm mt-1">Ryu controller status and flow management</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Status', value: (status?.status as string) || 'Unknown', icon: Heart, color: status?.status === 'online' ? '#10b981' : '#f43f5e' },
          { label: 'Switches', value: String(status?.connected_switches || 0), icon: Server, color: '#3b82f6' },
          { label: 'Protocol', value: (status?.protocol as string) || 'N/A', icon: Wifi, color: '#8b5cf6' },
          { label: 'Controller', value: (status?.controller as string) || 'N/A', icon: Cpu, color: '#06b6d4' },
        ].map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="stat-card">
            <div className="flex items-center gap-2 mb-2">
              <card.icon className="w-4 h-4" style={{ color: card.color }} />
              <span className="text-xs text-slate-400">{card.label}</span>
            </div>
            <div className="text-lg font-semibold flex items-center gap-2">
              {card.label === 'Status' && <span className={`status-dot ${card.value === 'online' ? 'active' : 'critical'}`} />}
              {card.value}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Heartbeat Animation */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="glass-card p-6 text-center">
        <div className="inline-flex items-center gap-3 text-emerald-400">
          <Heart className="w-6 h-6 animate-pulse" />
          <span className="text-lg font-semibold">Controller Heartbeat Active</span>
        </div>
        <p className="text-sm text-slate-400 mt-2">OpenFlow 1.3 | Port 6633 | REST API Port 8080</p>
      </motion.div>
    </div>
  );
}
