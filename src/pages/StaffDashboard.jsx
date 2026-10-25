import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { api } from '../services/api.js';
import StatusBadge from '../components/StatusBadge.jsx';
import PriorityBadge from '../components/PriorityBadge.jsx';
import { 
  Wrench, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  MapPin, 
  ArrowRight, 
  Search,
  Sparkles,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

export default function StaffDashboard() {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [assignedComplaints, setAssignedComplaints] = useState([]);
  const [stats, setStats] = useState({ assignedCount: 0, inProgressCount: 0, resolvedCount: 0, urgentCount: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAvailable, setIsAvailable] = useState(true);

  const loadStaffData = async () => {
    try {
      const [complaintsRes, statsRes] = await Promise.all([
        api.getComplaints({ sort: 'priority' }),
        api.getStaffStats()
      ]);
      setAssignedComplaints(complaintsRes.complaints || []);
      setStats(statsRes || {});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaffData();
  }, []);

  const handleToggleAvailability = async () => {
    const nextVal = !isAvailable;
    setIsAvailable(nextVal);
    try {
      await api.updateAvailability(nextVal);
      success(`Duty status set to: ${nextVal ? 'Available for Dispatch' : 'On Break / Offline'}`);
    } catch (err) {
      toastError('Failed to update availability status.');
    }
  };

  const filtered = assignedComplaints.filter((c) => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      c.title.toLowerCase().includes(term) ||
      c.reference_id.toLowerCase().includes(term) ||
      c.building.toLowerCase().includes(term) ||
      c.room_area.toLowerCase().includes(term)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Staff Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-navy-950 via-navy-900 to-amber-950 text-white border border-amber-900/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold mb-2 border border-amber-500/30">
              <Wrench className="w-3.5 h-3.5 text-amber-400" />
              Maintenance Operations Desk (US10)
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Technician Workspace: {user?.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Fleet Domain: <strong className="text-amber-300">{user?.department || 'Facility Maintenance'}</strong> • Employee Ref: SCF-STF-{user?.id}
            </p>
          </div>

          {/* Availability Toggle */}
          <div className="flex items-center gap-3 bg-navy-900/90 p-3 rounded-2xl border border-slate-700">
            <div className="text-right">
              <div className="text-xs font-bold text-white">Duty Status</div>
              <div className={`text-[10px] font-semibold ${isAvailable ? 'text-emerald-400' : 'text-slate-400'}`}>
                {isAvailable ? '● On Active Duty' : '○ Standby / Offline'}
              </div>
            </div>
            <button
              onClick={handleToggleAvailability}
              className="text-amber-400 hover:text-amber-300 transition-colors"
              title="Toggle duty availability"
            >
              {isAvailable ? (
                <ToggleRight className="w-9 h-9 text-emerald-400" />
              ) : (
                <ToggleLeft className="w-9 h-9 text-slate-500" />
              )}
            </button>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Workload</div>
            <div className="text-3xl font-extrabold text-brand-700 mt-2">
              {(stats.assignedCount || 0) + (stats.inProgressCount || 0)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Total pending repairs</div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="text-xs font-bold uppercase tracking-wider text-blue-700">Awaiting Repair</div>
            <div className="text-3xl font-extrabold text-blue-600 mt-2">{stats.assignedCount || 0}</div>
            <div className="text-[11px] text-slate-400 mt-1">Status: Assigned</div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="text-xs font-bold uppercase tracking-wider text-cyan-700">In Progress</div>
            <div className="text-3xl font-extrabold text-cyan-600 mt-2">{stats.inProgressCount || 0}</div>
            <div className="text-[11px] text-slate-400 mt-1">Work underway</div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">Resolved Work</div>
            <div className="text-3xl font-extrabold text-emerald-600 mt-2">{stats.resolvedCount || 0}</div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-1">Completed repairs</div>
          </div>
        </div>

        {/* Assigned Issues Queue */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Assigned Campus Tickets (Prioritized by Urgency)
              </h2>
              <p className="text-xs text-slate-500">
                Inspect site details, start progress, and submit final resolution proof.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Filter tasks..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500 w-44 sm:w-56"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-medium"
              >
                <option value="all">All States</option>
                <option value="Assigned">Assigned</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs text-slate-500 font-medium">Fetching assigned tickets...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 mb-2" />
              <p className="font-bold text-slate-800 text-sm">No pending tasks matching criteria</p>
              <p className="text-xs text-slate-400 mt-1">All assigned repairs are completed or filtered out.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filtered.map((c) => (
                <div
                  key={c.id}
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                        {c.reference_id}
                      </span>
                      <PriorityBadge priority={c.priority} size="sm" />
                      <StatusBadge status={c.status} size="sm" />
                    </div>

                    <h3 className="font-bold text-slate-900 text-base">{c.title}</h3>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {c.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                      <span className="flex items-center gap-1 font-semibold text-slate-700">
                        <MapPin className="w-3.5 h-3.5 text-brand-600" />
                        {c.building} • {c.room_area}
                      </span>
                      <span>•</span>
                      <span>Reporter: {c.reporter_name}</span>
                      <span>•</span>
                      <span>Category: {c.category}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
                    <Link
                      to={`/complaints/${c.reference_id}`}
                      className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-sm transition-colors flex items-center gap-1.5"
                    >
                      <Wrench className="w-4 h-4" />
                      Manage & Update Status (US10, US11)
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
