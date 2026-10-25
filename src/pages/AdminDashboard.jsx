import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import StatusBadge from '../components/StatusBadge.jsx';
import PriorityBadge from '../components/PriorityBadge.jsx';
import { 
  ShieldCheck, 
  Clock, 
  Wrench, 
  CheckCircle2, 
  AlertTriangle, 
  Users, 
  ArrowRight, 
  Activity, 
  Building2, 
  ListOrdered, 
  TrendingUp,
  Sparkles,
  BarChart3
} from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [urgentComplaints, setUrgentComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAdminData() {
      try {
        const [statsData, complaintsData] = await Promise.all([
          api.getAdminStats(),
          api.getComplaints({ priority: 'Urgent', status: 'all' })
        ]);
        setStats(statsData);
        setUrgentComplaints(complaintsData.complaints || []);
      } catch (err) {
        console.error('Failed to load admin dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAdminData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6">
        <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mb-4" />
        <p className="text-slate-600 text-sm font-medium">Computing live campus metrics from database...</p>
      </div>
    );
  }

  const { summary, categoryCounts, buildingCounts, staffWorkload, recentActivity } = stats || {
    summary: {}, categoryCounts: [], buildingCounts: [], staffWorkload: [], recentActivity: []
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Admin Header Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-navy-950 via-purple-950 to-navy-900 text-white border border-purple-900/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold mb-2 border border-purple-500/30">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              Campus Facilities & Infrastructure Command Center (US08)
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Administrative Control Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Administrator: {user?.name} ({user?.department || 'Director of Facilities'}) • Live Database Sync
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/admin/complaints"
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-500 hover:to-cyan-500 text-white font-bold text-xs shadow-glow transition-all flex items-center gap-2"
            >
              <ListOrdered className="w-4 h-4" />
              Manage & Assign Workspace (US09)
            </Link>
          </div>
        </div>

        {/* 6 Real Computed Summary Metrics (US08) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Registered</div>
            <div className="text-3xl font-extrabold text-slate-900 mt-2">{summary.total || 0}</div>
            <div className="text-[11px] text-slate-400 mt-1">Campus tickets</div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="text-xs font-bold uppercase tracking-wider text-amber-700">Pending Review</div>
            <div className="text-3xl font-extrabold text-amber-600 mt-2">{summary.pending || 0}</div>
            <div className="text-[11px] text-amber-600 font-medium mt-1">Requires dispatch</div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="text-xs font-bold uppercase tracking-wider text-blue-700">Assigned</div>
            <div className="text-3xl font-extrabold text-blue-600 mt-2">{summary.assigned || 0}</div>
            <div className="text-[11px] text-slate-400 mt-1">Queued for staff</div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="text-xs font-bold uppercase tracking-wider text-cyan-700">In Progress</div>
            <div className="text-3xl font-extrabold text-cyan-600 mt-2">{summary.in_progress || 0}</div>
            <div className="text-[11px] text-slate-400 mt-1">Active repair underway</div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">Resolved / Closed</div>
            <div className="text-3xl font-extrabold text-emerald-600 mt-2">
              {(summary.resolved || 0) + (summary.closed || 0)}
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-1">
              {summary.resolutionRate}% closure rate
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm ring-2 ring-rose-500/20">
            <div className="text-xs font-bold uppercase tracking-wider text-rose-700 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> Urgent
            </div>
            <div className="text-3xl font-extrabold text-rose-600 mt-2">{summary.urgent || 0}</div>
            <div className="text-[11px] text-rose-600 font-bold mt-1">Immediate hazards</div>
          </div>
        </div>

        {/* Urgent Attention Queue */}
        {urgentComplaints.length > 0 && (
          <div className="bg-rose-50/70 border border-rose-300 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-900 font-bold text-sm">
                <AlertTriangle className="w-4 h-4 text-rose-600 animate-pulse" />
                <span>Urgent Campus Attention Queue ({urgentComplaints.length})</span>
              </div>
              <Link to="/admin/complaints?priority=Urgent" className="text-xs font-bold text-rose-700 hover:underline">
                View All Urgent Issues
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {urgentComplaints.slice(0, 2).map((c) => (
                <div key={c.id} className="p-3.5 bg-white rounded-xl border border-rose-200 shadow-xs flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.2 rounded">
                        {c.reference_id}
                      </span>
                      <StatusBadge status={c.status} size="sm" />
                    </div>
                    <div className="font-bold text-slate-900 text-xs mt-1 truncate">{c.title}</div>
                    <div className="text-[10px] text-slate-500">{c.building} • {c.room_area}</div>
                  </div>
                  <Link
                    to={`/complaints/${c.reference_id}`}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shrink-0"
                  >
                    Dispatch / Review
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2-Column Section: Category Distribution & Staff Workload */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Category Breakdown (computed from real data) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-brand-600" />
                <h2 className="text-sm font-bold text-slate-900">Issues by Category Distribution</h2>
              </div>
              <span className="text-xs text-slate-500 font-semibold">{categoryCounts.length} Categories</span>
            </div>

            <div className="space-y-3">
              {categoryCounts.map((cat) => {
                const percentage = summary.total > 0 ? Math.round((cat.count / summary.total) * 100) : 0;
                return (
                  <div key={cat.category} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-800">{cat.category}</span>
                      <span className="text-slate-500">{cat.count} tickets ({percentage}%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-brand-600 to-cyan-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Maintenance Staff Availability & Active Workload (US09) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-600" />
                <h2 className="text-sm font-bold text-slate-900">Technician Fleet & Workload (US09)</h2>
              </div>
              <Link to="/admin/complaints" className="text-xs font-bold text-brand-600 hover:underline">
                Assign Tickets
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {staffWorkload.map((staff) => (
                <div key={staff.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-900">{staff.name}</div>
                    <div className="text-[11px] text-slate-500">
                      Specialty: {staff.specialty || staff.department}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      staff.active_tickets_count > 2 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {staff.active_tickets_count} Active Task{staff.active_tickets_count !== 1 ? 's' : ''}
                    </span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" title="Active on duty" />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Recent Audit Timeline Across Campus */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-brand-600" />
              <h2 className="text-sm font-bold text-slate-900">Live Campus Audit Log Activity</h2>
            </div>
            <span className="text-xs text-slate-400">Chronological System Events</span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {recentActivity.map((act) => (
              <div key={act.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-brand-700 bg-brand-50 px-1.5 py-0.2 rounded text-[10px]">
                      {act.reference_id}
                    </span>
                    <span className="font-bold text-slate-800">{act.action}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                      {act.actor_role}
                    </span>
                  </div>
                  <p className="text-slate-600 text-xs">{act.remarks}</p>
                </div>
                <div className="text-[11px] text-slate-400 shrink-0">
                  {new Date(act.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
