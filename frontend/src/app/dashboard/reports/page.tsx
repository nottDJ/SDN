'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import { toast } from '@/stores/toastStore';
import { FileText, Download, RefreshCw, BarChart3, FileSpreadsheet, File, Calendar } from 'lucide-react';

const reportTypes = [
  { id: 'performance', label: 'Performance Report', desc: 'Throughput, latency, jitter, packet loss analysis', icon: BarChart3, color: '#06b6d4' },
  { id: 'security', label: 'Security Report', desc: 'Anomaly detection, suspicious flows, alerts', icon: FileText, color: '#f59e0b' },
  { id: 'capacity', label: 'Capacity Planning', desc: 'Bandwidth usage trends and future projections', icon: FileSpreadsheet, color: '#10b981' },
  { id: 'routing', label: 'Routing Report', desc: 'Routing decisions, algorithm efficiency, improvements', icon: BarChart3, color: '#8b5cf6' },
];

const formats = [
  { id: 'pdf', label: 'PDF', icon: File, color: '#f43f5e' },
  { id: 'csv', label: 'CSV', icon: FileSpreadsheet, color: '#10b981' },
  { id: 'excel', label: 'Excel', icon: FileSpreadsheet, color: '#3b82f6' },
];

const sections = ['traffic_summary', 'ai_predictions', 'routing_decisions', 'alerts', 'topology_snapshot'];

export default function ReportsPage() {
  const [selectedType, setSelectedType] = useState('performance');
  const [selectedFormat, setSelectedFormat] = useState('pdf');
  const [selectedSections, setSelectedSections] = useState(sections.slice(0, 3));
  const [timeRange, setTimeRange] = useState('24h');
  const [generating, setGenerating] = useState(false);
  const [recentReports, setRecentReports] = useState<any[]>([
    { name: 'performance_report_20260627.pdf', type: 'pdf', generated_at: new Date(Date.now() - 3600000).toISOString(), size: '1.4 MB', status: 'ready', url: '#' },
    { name: 'security_report_20260626.csv', type: 'csv', generated_at: new Date(Date.now() - 86400000).toISOString(), size: '312 KB', status: 'ready', url: '#' },
    { name: 'capacity_report_20260625.xlsx', type: 'excel', generated_at: new Date(Date.now() - 172800000).toISOString(), size: '889 KB', status: 'ready', url: '#' },
  ]);

  const toggleSection = (s: string) => {
    setSelectedSections((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  };

  const getTimeRange = () => {
    const end = new Date();
    const start = new Date();
    if (timeRange === '1h') start.setHours(start.getHours() - 1);
    else if (timeRange === '24h') start.setDate(start.getDate() - 1);
    else if (timeRange === '7d') start.setDate(start.getDate() - 7);
    else start.setDate(start.getDate() - 30);
    return { start: start.toISOString(), end: end.toISOString() };
  };

  const handleGenerate = async () => {
    if (selectedSections.length === 0) { toast.error('Select at least one section'); return; }
    setGenerating(true);
    const { start, end } = getTimeRange();
    try {
      const { data } = await api.post('/reports/generate', {
        report_type: selectedType,
        format: selectedFormat,
        start_time: start,
        end_time: end,
        include_sections: selectedSections,
      });
      const newReport = {
        name: data.filename || `${selectedType}_report_${Date.now()}.${selectedFormat}`,
        type: selectedFormat,
        generated_at: new Date().toISOString(),
        size: data.file_size || '~1 MB',
        status: 'ready',
        url: data.download_url || '#',
      };
      setRecentReports((prev) => [newReport, ...prev]);
      toast.success('Report generated', `${selectedType} report is ready to download`);
      if (data.download_url && data.download_url !== '#') {
        window.open(data.download_url, '_blank');
      }
    } catch {
      // Demo report
      const newReport = {
        name: `${selectedType}_report_${Date.now().toString().slice(-6)}.${selectedFormat}`,
        type: selectedFormat,
        generated_at: new Date().toISOString(),
        size: '1.2 MB',
        status: 'demo',
        url: '#',
      };
      setRecentReports((prev) => [newReport, ...prev]);
      toast.info('Demo report created', 'Backend not connected — report entry added as demo');
    }
    setGenerating(false);
  };

  const getFormatColor = (fmt: string) => formats.find(f => f.id === fmt)?.color || '#64748b';

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-slate-400 text-sm mt-1">Generate and download detailed network analysis reports</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Generator Panel */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 space-y-5 lg:col-span-1">
          <h3 className="text-sm font-semibold flex items-center gap-2"><FileText className="w-4 h-4 text-cyan-400" /> Configure Report</h3>

          {/* Report Type */}
          <div>
            <label className="text-xs text-slate-400 block mb-2">Report Type</label>
            <div className="space-y-2">
              {reportTypes.map((rt) => (
                <button key={rt.id} onClick={() => setSelectedType(rt.id)} className={`w-full text-left p-3 rounded-xl border transition-all ${selectedType === rt.id ? 'border-cyan-500 bg-cyan-500/10' : 'border-white/5 bg-slate-800/30 hover:border-white/10'}`}>
                  <div className="flex items-center gap-2 mb-0.5">
                    <rt.icon className="w-4 h-4" style={{ color: rt.color }} />
                    <span className="text-sm font-medium">{rt.label}</span>
                  </div>
                  <div className="text-xs text-slate-500">{rt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Format */}
          <div>
            <label className="text-xs text-slate-400 block mb-2">Format</label>
            <div className="flex gap-2">
              {formats.map((f) => (
                <button key={f.id} onClick={() => setSelectedFormat(f.id)} className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${selectedFormat === f.id ? 'border-transparent text-white' : 'border-white/5 text-slate-400 bg-slate-800/30'}`} style={selectedFormat === f.id ? { background: f.color + '25', borderColor: f.color + '60', color: f.color } : {}}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Time Range */}
          <div>
            <label className="text-xs text-slate-400 block mb-2">Time Range</label>
            <div className="grid grid-cols-4 gap-1">
              {['1h', '24h', '7d', '30d'].map((tr) => (
                <button key={tr} onClick={() => setTimeRange(tr)} className={`py-1.5 rounded-lg text-xs font-mono transition-all ${timeRange === tr ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-slate-800/50 text-slate-500 border border-white/5'}`}>{tr}</button>
              ))}
            </div>
          </div>

          {/* Sections */}
          <div>
            <label className="text-xs text-slate-400 block mb-2">Include Sections</label>
            <div className="space-y-2">
              {sections.map((s) => (
                <label key={s} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={selectedSections.includes(s)} onChange={() => toggleSection(s)} className="w-4 h-4 rounded accent-cyan-500" />
                  <span className="text-sm capitalize text-slate-300">{s.replace(/_/g, ' ')}</span>
                </label>
              ))}
            </div>
          </div>

          <button onClick={handleGenerate} disabled={generating} className="btn-glow w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50">
            {generating ? <><RefreshCw className="w-4 h-4 animate-spin" /> Generating...</> : <><FileText className="w-4 h-4" /> Generate Report</>}
          </button>
        </motion.div>

        {/* Recent Reports */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-400" /> Recent Reports
            </h3>
            <span className="text-xs text-slate-500">{recentReports.length} total</span>
          </div>

          <div className="space-y-2">
            {recentReports.map((report, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }} className="flex items-center gap-3 p-4 rounded-xl bg-slate-800/30 border border-white/5 hover:border-white/10 transition-all">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: getFormatColor(report.type) + '20' }}>
                  <FileText className="w-5 h-5" style={{ color: getFormatColor(report.type) }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{report.name}</div>
                  <div className="text-xs text-slate-500 flex items-center gap-3 mt-0.5">
                    <span>{new Date(report.generated_at).toLocaleString()}</span>
                    <span>{report.size}</span>
                    {report.status === 'demo' && <span className="badge badge-info text-xs">Demo</span>}
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (report.url && report.url !== '#') {
                      window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/reports/download/${report.name}`, '_blank');
                    } else {
                      toast.info('Download unavailable', 'This is a demo report — no actual file generated');
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20 transition-all flex-shrink-0"
                >
                  <Download className="w-3 h-3" /> Download
                </button>
              </motion.div>
            ))}
          </div>

          {recentReports.length === 0 && (
            <div className="text-center py-12 text-slate-500 text-sm">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
              No reports yet. Generate your first report!
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
