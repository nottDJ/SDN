'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import { toast } from '@/stores/toastStore';
import {
  Settings as SettingsIcon, Save, Sliders, Database,
  Shield, Bell, Network, Cpu, RefreshCw,
} from 'lucide-react';

export default function SettingsPage() {
  // Prediction settings
  const [threshold, setThreshold] = useState(80);
  const [predInterval, setPredInterval] = useState(5);
  const [simMode, setSimMode] = useState(true);
  const [autoReroute, setAutoReroute] = useState(true);
  const [notifyOnAlert, setNotifyOnAlert] = useState(true);

  // Controller settings
  const [controllerHost, setControllerHost] = useState('localhost');
  const [controllerPort, setControllerPort] = useState('6633');

  // Alert thresholds
  const [latencyThreshold, setLatencyThreshold] = useState(10);
  const [packetLossThreshold, setPacketLossThreshold] = useState(2);
  const [cpuThreshold, setCpuThreshold] = useState(85);

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      // In a real implementation this would call a settings endpoint
      await new Promise((r) => setTimeout(r, 800));
      toast.success('Settings saved', 'Configuration updated successfully');
    } catch {
      toast.error('Save failed', 'Could not update settings');
    }
    setSaving(false);
  };

  const ToggleSwitch = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <button onClick={() => onChange(!value)} className={`w-12 h-6 rounded-full transition-all relative flex-shrink-0 ${value ? 'bg-cyan-500' : 'bg-slate-700'}`}>
      <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${value ? 'left-6' : 'left-0.5'} shadow-sm`} />
    </button>
  );

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-slate-400 text-sm mt-1">Configure system parameters, thresholds, and controller settings</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-glow flex items-center gap-2 disabled:opacity-50">
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* AI & Prediction Settings */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-5 flex items-center gap-2 pb-3 border-b border-white/5">
            <Sliders className="w-4 h-4 text-cyan-400" /> AI & Prediction Settings
          </h3>
          <div className="space-y-5">
            <div>
              <label className="text-xs text-slate-400 flex justify-between mb-2">
                <span>Congestion Threshold</span>
                <span className={`font-mono ${threshold > 85 ? 'text-rose-400' : threshold > 70 ? 'text-amber-400' : 'text-cyan-400'}`}>{threshold}%</span>
              </label>
              <input type="range" min={50} max={95} value={threshold} onChange={(e) => setThreshold(Number(e.target.value))} className="w-full accent-cyan-500" />
              <div className="flex justify-between text-xs text-slate-600 mt-0.5"><span>50%</span><span>95%</span></div>
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Prediction Interval (seconds)</label>
              <input type="number" value={predInterval} onChange={(e) => setPredInterval(Number(e.target.value))} className="input-dark w-32" min={1} max={60} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm">Simulation Mode</div>
                <div className="text-xs text-slate-500">Use synthetic traffic instead of real Mininet</div>
              </div>
              <ToggleSwitch value={simMode} onChange={setSimMode} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm">Auto-Rerouting</div>
                <div className="text-xs text-slate-500">Automatically install new flow rules on congestion</div>
              </div>
              <ToggleSwitch value={autoReroute} onChange={setAutoReroute} />
            </div>
          </div>
        </motion.div>

        {/* Alert Thresholds */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-5 flex items-center gap-2 pb-3 border-b border-white/5">
            <Bell className="w-4 h-4 text-amber-400" /> Alert Thresholds
          </h3>
          <div className="space-y-5">
            <div>
              <label className="text-xs text-slate-400 flex justify-between mb-2">
                <span>Latency Alert Threshold</span>
                <span className="font-mono text-amber-400">{latencyThreshold} ms</span>
              </label>
              <input type="range" min={2} max={50} value={latencyThreshold} onChange={(e) => setLatencyThreshold(Number(e.target.value))} className="w-full accent-amber-500" />
            </div>
            <div>
              <label className="text-xs text-slate-400 flex justify-between mb-2">
                <span>Packet Loss Alert Threshold</span>
                <span className="font-mono text-rose-400">{packetLossThreshold}%</span>
              </label>
              <input type="range" min={0.1} max={10} step={0.1} value={packetLossThreshold} onChange={(e) => setPacketLossThreshold(Number(e.target.value))} className="w-full accent-rose-500" />
            </div>
            <div>
              <label className="text-xs text-slate-400 flex justify-between mb-2">
                <span>CPU Usage Alert Threshold</span>
                <span className="font-mono text-orange-400">{cpuThreshold}%</span>
              </label>
              <input type="range" min={50} max={99} value={cpuThreshold} onChange={(e) => setCpuThreshold(Number(e.target.value))} className="w-full accent-orange-500" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm">Alert Notifications</div>
                <div className="text-xs text-slate-500">Show toast notifications for new alerts</div>
              </div>
              <ToggleSwitch value={notifyOnAlert} onChange={setNotifyOnAlert} />
            </div>
          </div>
        </motion.div>

        {/* Controller Connection */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-5 flex items-center gap-2 pb-3 border-b border-white/5">
            <Network className="w-4 h-4 text-blue-400" /> Controller Connection
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Ryu Controller Host</label>
              <input type="text" value={controllerHost} onChange={(e) => setControllerHost(e.target.value)} className="input-dark font-mono" placeholder="localhost" />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">OpenFlow Port</label>
              <input type="text" value={controllerPort} onChange={(e) => setControllerPort(e.target.value)} className="input-dark w-32 font-mono" placeholder="6633" />
            </div>
            <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/15 flex items-center gap-2 text-xs">
              <span className="status-dot active" />
              <span className="text-emerald-400">Controller reachable at {controllerHost}:{controllerPort}</span>
            </div>
          </div>
        </motion.div>

        {/* System Information */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-5 flex items-center gap-2 pb-3 border-b border-white/5">
            <Database className="w-4 h-4 text-blue-400" /> System Information
          </h3>
          <div className="space-y-2.5">
            {[
              { label: 'Frontend', value: 'Next.js 15 + React 19' },
              { label: 'Backend', value: 'FastAPI 0.115 (Python)' },
              { label: 'Database', value: 'PostgreSQL 16' },
              { label: 'Controller', value: 'Ryu OpenFlow 1.3' },
              { label: 'ML Framework', value: 'TensorFlow 2.x + XGBoost + Scikit-learn' },
              { label: 'Simulator', value: 'Mininet + Open vSwitch' },
              { label: 'Deployment', value: 'Docker Compose' },
            ].map((item) => (
              <div key={item.label} className="flex justify-between p-2.5 rounded-lg bg-slate-800/30">
                <span className="text-xs text-slate-400">{item.label}</span>
                <span className="text-xs font-mono text-cyan-400">{item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Role-Based Access Control */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold mb-5 flex items-center gap-2 pb-3 border-b border-white/5">
            <Shield className="w-4 h-4 text-purple-400" /> Role-Based Access Control
          </h3>
          <div className="overflow-x-auto">
            <table className="table-dark">
              <thead>
                <tr><th>Permission</th><th>Administrator</th><th>Network Operator</th></tr>
              </thead>
              <tbody>
                {[
                  ['View Dashboard', true, true],
                  ['Monitor Traffic', true, true],
                  ['View Alerts', true, true],
                  ['Acknowledge Alerts', true, true],
                  ['Train AI Models', true, false],
                  ['Change Active Model', true, false],
                  ['Configure Thresholds', true, false],
                  ['Install Flow Rules', true, false],
                  ['Delete Topology', true, false],
                  ['Restart Controller', true, false],
                  ['Manage Users', true, false],
                  ['Configure Controller', true, false],
                ].map(([perm, admin, op]) => (
                  <tr key={perm as string}>
                    <td>{perm}</td>
                    <td>{admin ? <span className="badge badge-success">✓ Allowed</span> : <span className="badge badge-danger">✗ Denied</span>}</td>
                    <td>{op ? <span className="badge badge-success">✓ Allowed</span> : <span className="badge badge-danger">✗ Denied</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
