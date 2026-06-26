'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import { FileText, Download, FileSpreadsheet, File } from 'lucide-react';

export default function ReportsPage() {
  const [format, setFormat] = useState('pdf');
  const [reportType, setReportType] = useState('traffic_summary');
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const { data } = await api.post('/reports/generate', { report_type: reportType, format });
      window.open(`${process.env.NEXT_PUBLIC_API_URL}${data.download_url}`, '_blank');
    } catch { /* handle */ }
    setGenerating(false);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-slate-400 text-sm mt-1">Generate downloadable network analytics reports</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><FileText className="w-4 h-4 text-cyan-400" /> Generate Report</h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Report Type</label>
              <select value={reportType} onChange={(e) => setReportType(e.target.value)} className="input-dark">
                <option value="traffic_summary">Traffic Summary</option>
                <option value="prediction_accuracy">Prediction Accuracy</option>
                <option value="congestion_events">Congestion Events</option>
                <option value="flow_statistics">Flow Statistics</option>
                <option value="bandwidth_utilization">Bandwidth Utilization</option>
                <option value="routing_changes">Routing Changes</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-2">Format</label>
              <div className="flex gap-3">
                {[
                  { id: 'pdf', label: 'PDF', icon: File, color: '#f43f5e' },
                  { id: 'csv', label: 'CSV', icon: FileText, color: '#10b981' },
                  { id: 'excel', label: 'Excel', icon: FileSpreadsheet, color: '#3b82f6' },
                ].map((f) => (
                  <button key={f.id} onClick={() => setFormat(f.id)} className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${format === f.id ? 'border-cyan-500 bg-cyan-500/10' : 'border-white/5 bg-slate-800/30 hover:border-white/10'}`}>
                    <f.icon className="w-4 h-4" style={{ color: f.color }} />
                    <span className="text-sm">{f.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <button onClick={handleGenerate} disabled={generating} className="btn-glow w-full py-3">
              {generating ? 'Generating...' : '📊 Generate Report'}
            </button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Download className="w-4 h-4 text-blue-400" /> Recent Reports</h3>
          <div className="space-y-2">
            {['Traffic Summary — Jun 26', 'Prediction Report — Jun 25', 'Congestion Analysis — Jun 24'].map((r, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30">
                <span className="text-sm">{r}</span>
                <button className="text-xs text-cyan-400 hover:text-cyan-300">Download</button>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
