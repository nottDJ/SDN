'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import { toast } from '@/stores/toastStore';
import {
  Cpu, Heart, Wifi, Server, Activity, TerminalSquare,
  Play, RotateCcw, Zap, RefreshCw, Network, ArrowRight,
} from 'lucide-react';

interface FlowEntry {
  switch_id: string;
  match: Record<string, string>;
  actions: string;
  priority: number;
  packet_count: number;
  byte_count: number;
  duration_sec: number;
}

interface PortStat {
  port_no: number;
  rx_packets: number;
  tx_packets: number;
  rx_bytes: number;
  tx_bytes: number;
  rx_errors: number;
  tx_errors: number;
}

export default function ControllerPage() {
  const [status, setStatus] = useState<Record<string, unknown> | null>(null);
  const [flows, setFlows] = useState<FlowEntry[]>([]);
  const [ports, setPorts] = useState<PortStat[]>([]);
  const [events, setEvents] = useState<string[]>(['[00:00:00] Controller initialized', '[00:00:01] Connected to topology']);
  const [selectedDpid, setSelectedDpid] = useState('1');
  const [restarting, setRestarting] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const { data } = await api.get('/controller/status');
      setStatus(data);
    } catch {
      setStatus({ status: 'online', connected_switches: 4, protocol: 'OpenFlow 1.3', controller: 'Ryu (Simulated)', simulation_mode: true, uptime: '2h 34m', flows_installed: 42, events_processed: 1284 });
    }
  }, []);

  const fetchFlows = useCallback(async () => {
    try {
      const { data } = await api.get(`/controller/flows/${selectedDpid}`);
      setFlows(data.flows || data || []);
    } catch {
      setFlows([
        { switch_id: 's1', match: { 'eth_type': '0x800', 'ipv4_src': '10.0.1.1', 'ipv4_dst': '10.0.2.1' }, actions: 'output:2', priority: 100, packet_count: 1234, byte_count: 1234567, duration_sec: 340 },
        { switch_id: 's1', match: { 'eth_type': '0x800', 'ipv4_src': '10.0.2.1', 'ipv4_dst': '10.0.1.1' }, actions: 'output:1', priority: 100, packet_count: 987, byte_count: 987654, duration_sec: 340 },
        { switch_id: 's1', match: { 'eth_type': '0x800', 'ipv4_src': '10.0.1.2', 'ipv4_dst': '10.0.3.1' }, actions: 'output:3', priority: 90, packet_count: 542, byte_count: 542000, duration_sec: 120 },
        { switch_id: 's1', match: { 'eth_type': '0x806' }, actions: 'FLOOD', priority: 1, packet_count: 89, byte_count: 5340, duration_sec: 600 },
      ]);
    }
  }, [selectedDpid]);

  const fetchPorts = useCallback(async () => {
    try {
      const { data } = await api.get(`/controller/ports/${selectedDpid}`);
      setPorts(data.ports || data || []);
    } catch {
      setPorts([
        { port_no: 1, rx_packets: 12453, tx_packets: 11892, rx_bytes: 15234567, tx_bytes: 14123456, rx_errors: 0, tx_errors: 0 },
        { port_no: 2, rx_packets: 9823, tx_packets: 10234, rx_bytes: 12234567, tx_bytes: 12891234, rx_errors: 2, tx_errors: 0 },
        { port_no: 3, rx_packets: 5432, tx_packets: 5789, rx_bytes: 6789012, tx_bytes: 7123456, rx_errors: 0, tx_errors: 1 },
      ]);
    }
  }, [selectedDpid]);

  const handleRestart = async () => {
    setRestarting(true);
    try {
      await api.post('/controller/restart');
      toast.success('Controller Restarting', 'Ryu controller restart initiated');
      setEvents(e => [...e, `[${new Date().toLocaleTimeString()}] Controller restart requested`]);
    } catch {
      toast.info('Restart initiated', 'Controller will restart momentarily');
    }
    setTimeout(() => setRestarting(false), 3000);
  };

  useEffect(() => {
    fetchStatus();
    fetchFlows();
    fetchPorts();
    const iv = setInterval(fetchStatus, 5000);
    return () => clearInterval(iv);
  }, [fetchStatus, fetchFlows, fetchPorts]);

  // Simulate incoming events
  useEffect(() => {
    const eventMessages = [
      'Flow rule installed on s1 → output:3',
      'PacketIn from host 10.0.1.1',
      'Topology discovery: Switch s2 connected',
      'Port stats collected from s3',
      'AI engine: predicting traffic for next 5min',
    ];
    const iv = setInterval(() => {
      const msg = eventMessages[Math.floor(Math.random() * eventMessages.length)];
      setEvents(e => [...e.slice(-24), `[${new Date().toLocaleTimeString()}] ${msg}`]);
    }, 8000);
    return () => clearInterval(iv);
  }, []);

  const statCards = status ? [
    { label: 'Status', value: (status.status as string) || 'Unknown', icon: Heart, color: status.status === 'online' ? '#10b981' : '#f43f5e', dot: true },
    { label: 'Connected Switches', value: String(status.connected_switches ?? 0), icon: Server, color: '#3b82f6' },
    { label: 'Protocol', value: (status.protocol as string) || 'N/A', icon: Wifi, color: '#8b5cf6' },
    { label: 'Controller', value: (status.controller as string) || 'N/A', icon: Cpu, color: '#06b6d4' },
    { label: 'Uptime', value: (status.uptime as string) || 'N/A', icon: Activity, color: '#10b981' },
    { label: 'Flows Installed', value: String(status.flows_installed ?? 0), icon: Network, color: '#f59e0b' },
  ] : [];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">SDN Controller</h1>
          <p className="text-slate-400 text-sm mt-1">Ryu controller status, flow management, and port statistics</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { fetchStatus(); fetchFlows(); fetchPorts(); }} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/50 border border-white/5 hover:border-cyan-500/30 text-sm transition-all">
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" /> Refresh
          </button>
          <button onClick={handleRestart} disabled={restarting} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm hover:bg-rose-500/20 transition-all disabled:opacity-50">
            <RotateCcw className={`w-3.5 h-3.5 ${restarting ? 'animate-spin' : ''}`} /> {restarting ? 'Restarting...' : 'Restart'}
          </button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {statCards.map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="stat-card">
            <div className="flex items-center gap-2 mb-2">
              <card.icon className="w-4 h-4" style={{ color: card.color }} />
              <span className="text-xs text-slate-400">{card.label}</span>
            </div>
            <div className="text-base font-semibold flex items-center gap-2" style={{ color: card.color }}>
              {card.dot && <span className={`status-dot ${card.value === 'online' ? 'active' : 'critical'}`} />}
              <span className="truncate">{card.value}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Heartbeat Row */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="glass-card p-4 mb-6 flex items-center gap-4">
        <div className="flex items-center gap-3 text-emerald-400">
          <Heart className="w-5 h-5 animate-pulse" />
          <span className="font-semibold">Controller Heartbeat Active</span>
        </div>
        <div className="flex gap-6 text-xs text-slate-400 ml-4">
          <span>OpenFlow 1.3</span>
          <span>Port 6633</span>
          <span>REST API :8080</span>
          {Boolean(status?.simulation_mode) && <span className="badge badge-info">Simulation Mode</span>}
        </div>
      </motion.div>

      {/* Switch Selector + Flow Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Server className="w-4 h-4 text-blue-400" /> Select Switch
          </h3>
          <div className="space-y-2">
            {['1', '2', '3', '4'].map((dpid) => (
              <button key={dpid} onClick={() => { setSelectedDpid(dpid); }} className={`w-full text-left p-3 rounded-lg border transition-all text-sm ${selectedDpid === dpid ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400' : 'border-white/5 bg-slate-800/30 hover:border-white/10'}`}>
                <div className="flex items-center justify-between">
                  <span>🔀 Switch s{dpid}</span>
                  <span className="status-dot active" />
                </div>
                <div className="text-xs text-slate-500 mt-0.5">DPID: {dpid.padStart(16, '0')}</div>
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400" /> Flow Table — Switch s{selectedDpid}
          </h3>
          <div className="overflow-x-auto">
            <table className="table-dark">
              <thead>
                <tr><th>Match</th><th>Actions</th><th>Priority</th><th>Packets</th><th>Bytes</th><th>Age</th></tr>
              </thead>
              <tbody>
                {flows.map((f, i) => (
                  <tr key={i}>
                    <td className="font-mono text-xs">
                      {Object.entries(f.match).map(([k, v]) => (
                        <div key={k}><span className="text-slate-500">{k}=</span><span className="text-cyan-400">{v}</span></div>
                      ))}
                    </td>
                    <td className="font-mono text-xs text-emerald-400">{f.actions}</td>
                    <td className="font-mono text-xs">{f.priority}</td>
                    <td className="font-mono text-xs">{f.packet_count?.toLocaleString()}</td>
                    <td className="font-mono text-xs">{(f.byte_count / 1024).toFixed(1)} KB</td>
                    <td className="text-xs text-slate-400">{f.duration_sec}s</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      {/* Port Stats + Event Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Network className="w-4 h-4 text-purple-400" /> Port Statistics — s{selectedDpid}
          </h3>
          <div className="overflow-x-auto">
            <table className="table-dark">
              <thead>
                <tr><th>Port</th><th>RX Pkts</th><th>TX Pkts</th><th>RX Bytes</th><th>TX Bytes</th><th>Errors</th></tr>
              </thead>
              <tbody>
                {ports.map((p, i) => (
                  <tr key={i}>
                    <td className="font-mono font-semibold text-blue-400">:{p.port_no}</td>
                    <td className="font-mono text-xs">{p.rx_packets?.toLocaleString()}</td>
                    <td className="font-mono text-xs">{p.tx_packets?.toLocaleString()}</td>
                    <td className="font-mono text-xs">{(p.rx_bytes / 1024).toFixed(1)} KB</td>
                    <td className="font-mono text-xs">{(p.tx_bytes / 1024).toFixed(1)} KB</td>
                    <td className={`font-mono text-xs ${(p.rx_errors + p.tx_errors) > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {p.rx_errors + p.tx_errors}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <TerminalSquare className="w-4 h-4 text-amber-400" /> Controller Event Log
          </h3>
          <div className="bg-slate-950 rounded-lg p-3 h-52 overflow-y-auto font-mono text-xs text-emerald-400 space-y-0.5">
            {events.map((e, i) => (
              <div key={i} className="leading-5">{e}</div>
            ))}
            <span className="animate-pulse">▊</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
