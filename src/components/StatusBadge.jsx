import React from 'react';
import { 
  Clock, 
  Eye, 
  UserCheck, 
  Wrench, 
  CheckCircle2, 
  Archive, 
  RotateCcw 
} from 'lucide-react';

export default function StatusBadge({ status, size = 'md' }) {
  const configs = {
    'Submitted': {
      label: 'Submitted',
      icon: Clock,
      classes: 'bg-amber-50 text-amber-700 border-amber-300 ring-amber-500/20'
    },
    'Under Review': {
      label: 'Under Review',
      icon: Eye,
      classes: 'bg-indigo-50 text-indigo-700 border-indigo-300 ring-indigo-500/20'
    },
    'Assigned': {
      label: 'Assigned',
      icon: UserCheck,
      classes: 'bg-blue-50 text-blue-700 border-blue-300 ring-blue-500/20'
    },
    'In Progress': {
      label: 'In Progress',
      icon: Wrench,
      classes: 'bg-cyan-50 text-cyan-800 border-cyan-400 ring-cyan-500/20 animate-pulse'
    },
    'Resolved': {
      label: 'Resolved',
      icon: CheckCircle2,
      classes: 'bg-emerald-50 text-emerald-700 border-emerald-300 ring-emerald-500/20'
    },
    'Closed': {
      label: 'Closed',
      icon: Archive,
      classes: 'bg-slate-100 text-slate-700 border-slate-300 ring-slate-500/20'
    },
    'Reopened': {
      label: 'Reopened',
      icon: RotateCcw,
      classes: 'bg-rose-50 text-rose-700 border-rose-300 ring-rose-500/20'
    }
  };

  const current = configs[status] || {
    label: status || 'Unknown',
    icon: Clock,
    classes: 'bg-gray-100 text-gray-700 border-gray-300'
  };

  const Icon = current.icon;
  const isSm = size === 'sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full border shadow-sm ring-1 ring-inset ${
        isSm ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs md:text-sm'
      } ${current.classes}`}
    >
      <Icon className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span>{current.label}</span>
    </span>
  );
}
