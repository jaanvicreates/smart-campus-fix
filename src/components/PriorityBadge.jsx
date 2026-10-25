import React from 'react';
import { AlertCircle, AlertTriangle, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function PriorityBadge({ priority, size = 'md' }) {
  const configs = {
    'Urgent': {
      label: 'Urgent Priority',
      shortLabel: 'Urgent',
      icon: AlertCircle,
      classes: 'bg-rose-50 text-rose-700 border-rose-300 ring-rose-500/20'
    },
    'High': {
      label: 'High Priority',
      shortLabel: 'High',
      icon: AlertTriangle,
      classes: 'bg-amber-50 text-amber-700 border-amber-300 ring-amber-500/20'
    },
    'Medium': {
      label: 'Medium Priority',
      shortLabel: 'Medium',
      icon: ArrowUpRight,
      classes: 'bg-blue-50 text-blue-700 border-blue-300 ring-blue-500/20'
    },
    'Low': {
      label: 'Low Priority',
      shortLabel: 'Low',
      icon: ArrowDownRight,
      classes: 'bg-slate-100 text-slate-700 border-slate-300 ring-slate-500/20'
    }
  };

  const current = configs[priority] || {
    label: priority || 'Medium',
    shortLabel: priority || 'Medium',
    icon: ArrowUpRight,
    classes: 'bg-gray-100 text-gray-700 border-gray-300'
  };

  const Icon = current.icon;
  const isSm = size === 'sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full border shadow-sm ring-1 ring-inset ${
        isSm ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
      } ${current.classes}`}
    >
      <Icon className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span>{isSm ? current.shortLabel : current.label}</span>
    </span>
  );
}
