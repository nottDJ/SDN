'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToastStore } from '@/stores/toastStore';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const colors = {
  success: { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)', icon: '#10b981' },
  error: { bg: 'rgba(244,63,94,0.12)', border: 'rgba(244,63,94,0.3)', icon: '#f43f5e' },
  warning: { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', icon: '#f59e0b' },
  info: { bg: 'rgba(6,182,212,0.12)', border: 'rgba(6,182,212,0.3)', icon: '#06b6d4' },
};

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => {
          const Icon = icons[t.type];
          const c = colors[t.type];
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 60, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-auto flex items-start gap-3 p-4 rounded-xl max-w-xs shadow-2xl"
              style={{ background: c.bg, border: `1px solid ${c.border}`, backdropFilter: 'blur(16px)' }}
            >
              <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: c.icon }} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-slate-100">{t.title}</div>
                {t.message && <div className="text-xs text-slate-400 mt-0.5">{t.message}</div>}
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="flex-shrink-0 text-slate-500 hover:text-slate-300 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
