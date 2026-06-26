import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function formatNumber(num: number): string {
  if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
  return num.toFixed(1);
}

export function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'critical': return 'var(--rose)';
    case 'warning': return 'var(--amber)';
    case 'info': return 'var(--cyan)';
    default: return 'var(--text-secondary)';
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'active': case 'normal': case 'up': return '#10b981';
    case 'warning': case 'medium': return '#f59e0b';
    case 'critical': case 'congested': case 'error': case 'down': return '#f43f5e';
    default: return '#94a3b8';
  }
}
