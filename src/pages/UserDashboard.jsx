import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import StatusBadge from '../components/StatusBadge.jsx';
import PriorityBadge from '../components/PriorityBadge.jsx';
import { 
  PlusCircle, 
  ListOrdered, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  ArrowRight, 
  MapPin, 
  Sparkles,
  ChevronRight
} from 'lucide-react';

export default function UserDashboard() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({ totalReports: 0, activeReports: 0, resolvedReports: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const [complaintsRes, statsRes] = await Promise.all([
          api.getComplaints({ sort: 'newest' }),
          api.getStudentStats()
        ]);
        setComplaints(complaintsRes.complaints || []);
        setStats(statsRes || { totalReports: 0, activeReports: 0, resolvedReports: 0 });
      } catch (err) {
        console.error('Failed to load user dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredComplaints = complaints.filter((c) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      c.title.toLowerCase().includes(term) ||
      c.reference_id.toLowerCase().includes(term) ||
      c.building.toLowerCase().includes(term) ||
      c.category.toLowerCase().includes(term)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Welcome Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-navy-950 via-navy-900 to-brand-950 text-white border border-navy-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-semibold mb-2 border border-cyan-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              Student & Campus User Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name || 'Campus Reporter'}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Department: {user?.department || 'General Campus'} • Campus ID: SCF-USR-{user?.id}
            </p>
          </div>

          <Link
            to="/report"
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-500 hover:to-cyan-500 text-white font-bold text-sm shadow-glow transition-all hover:scale-[1.02] flex items-center gap-2 shrink-0"
          >
            <PlusCircle className="w-5 h-5" />
            Report Campus Issue
          </Link>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-brand-600 flex items-center justify-center font-bold text-lg">
              <ListOrdered className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900">{stats.totalReports}</div>
              <div className="text-xs text-slate-500 font-medium">Total Issues Submitted</div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-lg">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900">{stats.activeReports}</div>
              <div className="text-xs text-slate-500 font-medium">Active (Under Review / In Progress)</div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900">{stats.resolvedReports}</div>
              <div className="text-xs text-slate-500 font-medium">Successfully Resolved & Closed</div>
            </div>
          </div>
        </div>

        {/* Recent Complaints Section */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">My Recent Submissions</h2>
              <p className="text-xs text-slate-500">Track progress, technician updates, and resolution status</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search my reports..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 w-48 sm:w-64"
                />
              </div>

              <Link
                to="/my-complaints"
                className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 shrink-0"
              >
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs text-slate-500">Loading your complaint records...</p>
            </div>
          ) : filteredComplaints.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <AlertCircle className="w-10 h-10 mx-auto text-slate-400 mb-2" />
              <p className="font-semibold text-slate-700 text-sm">No complaints found</p>
              <p className="text-xs mt-1 text-slate-500">
                {search ? 'Try clearing your search query.' : "You haven't reported any campus issues yet."}
              </p>
              <Link
                to="/report"
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 transition-colors shadow-sm"
              >
                <PlusCircle className="w-4 h-4" />
                Report First Issue
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredComplaints.slice(0, 5).map((complaint) => (
                <Link
                  key={complaint.id}
                  to={`/complaints/${complaint.reference_id}`}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors group"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                        {complaint.reference_id}
                      </span>
                      <StatusBadge status={complaint.status} size="sm" />
                      <PriorityBadge priority={complaint.priority} size="sm" />
                    </div>
                    <div className="font-bold text-slate-900 text-sm group-hover:text-brand-600 transition-colors">
                      {complaint.title}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {complaint.building} • {complaint.room_area}
                      </span>
                      <span>•</span>
                      <span>Category: {complaint.category}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    <span className="text-[11px] text-slate-400">
                      {new Date(complaint.created_at).toLocaleDateString()}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
