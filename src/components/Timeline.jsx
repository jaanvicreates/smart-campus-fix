import React from 'react';
import { 
  PlusCircle, 
  UserCheck, 
  Wrench, 
  CheckCircle, 
  Archive, 
  RotateCcw, 
  Tag, 
  Clock 
} from 'lucide-react';

export default function Timeline({ history = [] }) {
  if (!history || history.length === 0) {
    return (
      <div className="p-6 text-center text-slate-500 bg-slate-50 rounded-2xl border border-slate-200">
        <Clock className="w-8 h-8 mx-auto mb-2 text-slate-400" />
        <p className="text-sm">No activity history recorded yet.</p>
      </div>
    );
  }

  const getActionIcon = (action) => {
    switch (action) {
      case 'Submitted':
        return <PlusCircle className="w-4 h-4 text-amber-600" />;
      case 'Assigned':
        return <UserCheck className="w-4 h-4 text-blue-600" />;
      case 'Status Updated':
        return <Wrench className="w-4 h-4 text-cyan-600" />;
      case 'Resolved':
        return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      case 'Closed':
        return <Archive className="w-4 h-4 text-slate-600" />;
      case 'Reopened':
        return <RotateCcw className="w-4 h-4 text-rose-600" />;
      case 'Priority Changed':
        return <Tag className="w-4 h-4 text-purple-600" />;
      default:
        return <Clock className="w-4 h-4 text-brand-600" />;
    }
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {history.map((event, eventIdx) => {
          const isLast = eventIdx === history.length - 1;
          return (
            <li key={event.id || eventIdx}>
              <div className="relative pb-8">
                {!isLast && (
                  <span
                    className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-slate-200"
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex items-start space-x-3">
                  <div className="relative">
                    <div className="h-8 w-8 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center shadow-sm ring-4 ring-slate-50">
                      {getActionIcon(event.action)}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">
                          {event.action}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          {event.actor_role?.toUpperCase()}
                        </span>
                      </div>
                      <time className="text-xs text-slate-500 font-medium">
                        {formatDateTime(event.created_at)}
                      </time>
                    </div>

                    <p className="text-sm text-slate-700 leading-relaxed">
                      {event.remarks || `Action taken by ${event.actor_name}`}
                    </p>

                    <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                      <span>Action by:</span>
                      <span className="text-slate-800 font-semibold">{event.actor_name}</span>
                      {event.to_status && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span>State: <strong className="text-brand-700">{event.to_status}</strong></span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
