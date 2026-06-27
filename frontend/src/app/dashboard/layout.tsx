'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
import { useTrafficStore } from '@/stores/trafficStore';
import { toast } from '@/stores/toastStore';
import ToastContainer from '@/components/ToastContainer';
import {
  LayoutDashboard, Network, Activity, Brain, GitBranch,
  Bell, FileText, GraduationCap, Play, Settings, Cpu,
  LogOut, ChevronLeft, Menu, User,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/topology', label: 'Topology', icon: Network },
  { href: '/dashboard/traffic', label: 'Traffic', icon: Activity },
  { href: '/dashboard/predictions', label: 'Predictions', icon: Brain },
  { href: '/dashboard/routing', label: 'Routing', icon: GitBranch },
  { href: '/dashboard/alerts', label: 'Alerts', icon: Bell },
  { href: '/dashboard/reports', label: 'Reports', icon: FileText },
  { href: '/dashboard/training', label: 'AI Training', icon: GraduationCap },
  { href: '/dashboard/simulation', label: 'Simulation', icon: Play },
  { href: '/dashboard/controller', label: 'Controller', icon: Cpu },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [alertCount, setAlertCount] = useState(0);
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const addDataPoint = useTrafficStore((s) => s.addDataPoint);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Fetch unacknowledged alert count
  useEffect(() => {
    const fetchAlertCount = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/alerts/summary`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setAlertCount(data.total_unacknowledged || 0);
        }
      } catch { /* silent fail */ }
    };
    fetchAlertCount();
    const iv = setInterval(fetchAlertCount, 15000);
    return () => clearInterval(iv);
  }, []);

  // WebSocket connection
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (!token) { router.push('/login'); return; }

    const connect = () => {
      if (wsRef.current?.readyState === WebSocket.OPEN) return;
      try {
        const ws = new WebSocket(`${WS_URL}/ws/traffic`);
        ws.onopen = () => ws.send(JSON.stringify({ action: 'ping' }));
        ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);
            if (msg.type === 'traffic_update') addDataPoint(msg.data as any);
            if (msg.type === 'alert') {
              const d = msg.data as { severity: string; message: string };
              if (d.severity === 'warning') toast.warning('Network Alert', d.message);
              else if (d.severity === 'critical') toast.error('Critical Alert', d.message);
              else toast.info('Alert', d.message);
              setAlertCount((c) => c + 1);
            }
            if (msg.type === 'prediction_update' && msg.data?.congestion) {
              toast.warning('Congestion Predicted', 'AI model detected imminent congestion — rerouting...');
            }
          } catch { /* ignore */ }
        };
        ws.onclose = () => { reconnectRef.current = setTimeout(connect, 3000); };
        ws.onerror = () => ws.close();
        wsRef.current = ws;
      } catch {
        reconnectRef.current = setTimeout(connect, 3000);
      }
    };

    connect();
    return () => {
      clearTimeout(reconnectRef.current);
      wsRef.current?.close();
    };
  }, [router, addDataPoint]);

  const handleLogout = () => { logout(); router.push('/login'); };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* ── Sidebar ── */}
      <aside className={`sidebar hidden md:flex flex-col transition-all duration-300 ${collapsed ? 'w-16' : 'w-60'}`}>
        {/* Logo */}
        <div className="flex items-center gap-3 p-4 border-b border-white/5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0">
            <Network className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-bold text-sm bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent whitespace-nowrap">
              SDN Manager
            </motion.span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} className={`sidebar-item ${isActive ? 'active' : ''} relative`} title={item.label}>
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
                {/* Alert badge */}
                {item.href === '/dashboard/alerts' && alertCount > 0 && (
                  <span className={`${collapsed ? 'absolute top-1 right-1' : 'ml-auto'} min-w-5 h-5 px-1 rounded-full bg-rose-500 text-white text-xs flex items-center justify-center font-bold`}>
                    {alertCount > 99 ? '99+' : alertCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-2 border-t border-white/5">
          {!collapsed && user && (
            <div className="flex items-center gap-2 px-3 py-2 mb-1">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <User className="w-3 h-3 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold truncate">{user.username}</div>
                <div className="text-xs text-slate-500 capitalize">{user.role}</div>
              </div>
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)} className="sidebar-item w-full justify-center">
            <ChevronLeft className={`w-4 h-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
          </button>
          <button onClick={handleLogout} className="sidebar-item w-full text-rose-400 hover:text-rose-300 mt-1">
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ── Mobile Header ── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur border-b border-white/5 px-4 py-3 flex items-center justify-between">
        <button onClick={() => setMobileOpen(!mobileOpen)}>
          <Menu className="w-5 h-5" />
        </button>
        <span className="font-bold text-sm bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">SDN Manager</span>
        <div className="relative">
          <Bell className="w-5 h-5 text-slate-400" />
          {alertCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-xs flex items-center justify-center font-bold">
              {alertCount > 9 ? '9+' : alertCount}
            </span>
          )}
        </div>
      </div>

      {/* ── Mobile Sidebar Overlay ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="md:hidden fixed inset-0 bg-black/60 z-40" onClick={() => setMobileOpen(false)} />
            <motion.aside initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }} className="md:hidden sidebar fixed left-0 top-0 bottom-0 w-60 z-50 flex flex-col">
              <nav className="flex-1 p-2 pt-16 space-y-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link key={item.href} href={item.href} className={`sidebar-item ${isActive ? 'active' : ''} relative`} onClick={() => setMobileOpen(false)}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                      {item.href === '/dashboard/alerts' && alertCount > 0 && (
                        <span className="ml-auto min-w-5 h-5 px-1 rounded-full bg-rose-500 text-white text-xs flex items-center justify-center font-bold">
                          {alertCount > 99 ? '99+' : alertCount}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main Content ── */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 pt-16 md:pt-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} key={pathname}>
          {children}
        </motion.div>
      </main>

      {/* ── Toast Notifications ── */}
      <ToastContainer />
    </div>
  );
}
