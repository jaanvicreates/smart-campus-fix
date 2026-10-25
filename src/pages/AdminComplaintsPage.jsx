import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { api } from '../services/api.js';
import StatusBadge from '../components/StatusBadge.jsx';
import PriorityBadge from '../components/PriorityBadge.jsx';
import { CATEGORIES, PRIORITIES } from '../data/categories.js';
import { CAMPUS_LOCATIONS } from '../data/campusLocations.js';
import { 
  Search, 
  Filter, 
  UserCheck, 
  ChevronRight, 
  X, 
  MapPin, 
  Calendar, 
  AlertCircle,
  Tag,
  Wrench,
  CheckCircle2
} from 'lucide-react';

export default function AdminComplaintsPage() {
  const [searchParams] = useSearchParams();
  const { success, error: toastError } = useToast();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState(searchParams.get('priority') || 'all');
  const [buildingFilter, setBuildingFilter] = useState('all');

  // Assign Modal
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [targetComplaint, setTargetComplaint] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [assignmentRemarks, setAssignmentRemarks] = useState('');
  const [submittingAssign, setSubmittingAssign] = useState(false);

  // Priority change state
  const [priorityModalOpen, setPriorityModalOpen] = useState(false);
  const [targetPriorityComplaint, setTargetPriorityComplaint] = useState(null);
  const [newPriority, setNewPriority] = useState('Medium');

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await api.getComplaints({
        status: statusFilter,
        category: categoryFilter,
        priority: priorityFilter,
        building: buildingFilter,
        search
      });
      setComplaints(res.complaints || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchComplaints, 250);
    return () => clearTimeout(timer);
  }, [search, statusFilter, categoryFilter, priorityFilter, buildingFilter]);

  const openAssignModal = async (complaint) => {
    setTargetComplaint(complaint);
    setAssignmentRemarks('');
    setSelectedStaffId(complaint.assigned_staff_id || '');
    try {
      const res = await api.getStaff();
      setStaffList(res.staff || []);
      setAssignModalOpen(true);
    } catch (err) {
      toastError('Failed to load technician fleet.');
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStaffId) {
      toastError('Please choose a staff member.');
      return;
    }
    setSubmittingAssign(true);
    try {
      await api.assignComplaint(targetComplaint.id, {
        staff_id: selectedStaffId,
        remarks: assignmentRemarks
      });
      success(`Ticket [${targetComplaint.reference_id}] successfully assigned!`);
      setAssignModalOpen(false);
      fetchComplaints();
    } catch (err) {
      toastError(err.message || 'Assignment failed.');
    } finally {
      setSubmittingAssign(false);
    }
  };

  const openPriorityModal = (complaint) => {
    setTargetPriorityComplaint(complaint);
    setNewPriority(complaint.priority);
    setPriorityModalOpen(true);
  };

  const handlePrioritySubmit = async (e) => {
    e.preventDefault();
    try {
      await api.updatePriority(targetPriorityComplaint.id, { priority: newPriority });
      success(`Priority for [${targetPriorityComplaint.reference_id}] updated to ${newPriority}.`);
      setPriorityModalOpen(false);
      fetchComplaints();
    } catch (err) {
      toastError(err.message || 'Failed to update priority.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Campus Review & Assignment Workspace (US08, US09)
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Inspect reports, re-categorize, prioritize, and dispatch tasks to active maintenance crews.
            </p>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by ticket ID, title, description, room, or reporter..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2 border-t border-slate-100">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 bg-white"
              >
                <option value="all">All Statuses</option>
                <option value="Submitted">Submitted (Needs Review)</option>
                <option value="Assigned">Assigned</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 bg-white"
              >
                <option value="all">All Categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Priority</label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 bg-white"
              >
                <option value="all">All Priorities</option>
                <option value="Urgent">Urgent</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Building</label>
              <select
                value={buildingFilter}
                onChange={(e) => setBuildingFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 bg-white"
              >
                <option value="all">All Buildings</option>
                {CAMPUS_LOCATIONS.buildings.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Complaints Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs text-slate-500 font-medium">Loading campus tickets...</p>
            </div>
          ) : complaints.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <AlertCircle className="w-10 h-10 mx-auto text-slate-400 mb-2" />
              <p className="font-bold text-slate-800 text-sm">No complaints found</p>
              <p className="text-xs text-slate-400 mt-1">Adjust filters or search parameters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[10px] tracking-wider">
                    <th className="p-3.5">Ref ID</th>
                    <th className="p-3.5">Title & Location</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Priority</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Assigned Technician</th>
                    <th className="p-3.5">Reporter</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {complaints.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-brand-700 whitespace-nowrap">
                        <Link to={`/complaints/${c.reference_id}`} className="hover:underline">
                          {c.reference_id}
                        </Link>
                      </td>
                      <td className="p-3.5 max-w-xs">
                        <div className="font-bold text-slate-900 truncate">{c.title}</div>
                        <div className="text-[11px] text-slate-500 truncate">{c.building} ({c.room_area})</div>
                      </td>
                      <td className="p-3.5 font-medium text-slate-700 whitespace-nowrap">
                        {c.category}
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <button
                          onClick={() => openPriorityModal(c)}
                          title="Click to adjust priority"
                          className="hover:opacity-80"
                        >
                          <PriorityBadge priority={c.priority} size="sm" />
                        </button>
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <StatusBadge status={c.status} size="sm" />
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        {c.assigned_staff_name ? (
                          <div>
                            <span className="font-bold text-slate-800">{c.assigned_staff_name}</span>
                            <div className="text-[10px] text-slate-400">{c.assigned_staff_dept}</div>
                          </div>
                        ) : (
                          <span className="text-[11px] text-amber-600 font-semibold italic">Unassigned</span>
                        )}
                      </td>
                      <td className="p-3.5 whitespace-nowrap text-slate-600">
                        {c.reporter_name}
                      </td>
                      <td className="p-3.5 text-right whitespace-nowrap space-x-1.5">
                        <button
                          onClick={() => openAssignModal(c)}
                          className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs inline-flex items-center gap-1 border border-purple-200"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>{c.assigned_staff_id ? 'Reassign' : 'Assign'}</span>
                        </button>
                        <Link
                          to={`/complaints/${c.reference_id}`}
                          className="px-2.5 py-1 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold text-xs inline-flex items-center gap-1 border border-brand-200"
                        >
                          Details <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* ASSIGNMENT MODAL (US09) */}
      {assignModalOpen && targetComplaint && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Assign Complaint to Maintenance Staff (US09)
                </h2>
                <p className="text-xs text-slate-500 font-mono">
                  Ticket: {targetComplaint.reference_id} • Category: {targetComplaint.category}
                </p>
              </div>
              <button onClick={() => setAssignModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-2">
                  Select Active Technician Fleet (With Workload & Specialty):
                </label>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {staffList.map((s) => {
                    const isSelected = selectedStaffId === s.id;
                    const matchesCategory = s.specialty?.toLowerCase().includes(targetComplaint.category.toLowerCase()) ||
                                            targetComplaint.category.toLowerCase().includes(s.specialty?.toLowerCase());

                    return (
                      <label
                        key={s.id}
                        className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-500/20'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm">{s.name}</span>
                            {matchesCategory && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-cyan-100 text-cyan-800 border border-cyan-200">
                                Specialty Match
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {s.specialty || s.department} • {s.email}
                          </div>
                        </div>

                        <div className="text-right">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            s.active_tickets_count > 2 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {s.active_tickets_count} Active Task{s.active_tickets_count !== 1 ? 's' : ''}
                          </span>
                          <input
                            type="radio"
                            name="targetStaff"
                            value={s.id}
                            checked={isSelected}
                            onChange={() => setSelectedStaffId(s.id)}
                            className="hidden"
                          />
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Administrative Dispatch Instructions (Optional):
                </label>
                <textarea
                  rows={2}
                  value={assignmentRemarks}
                  onChange={(e) => setAssignmentRemarks(e.target.value)}
                  placeholder="e.g. Please bring replacement HDMI faceplate and test before 2 PM lecture..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAssignModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAssign || !selectedStaffId}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm disabled:opacity-50"
                >
                  {submittingAssign ? 'Assigning...' : 'Confirm Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRIORITY MODAL (US06) */}
      {priorityModalOpen && targetPriorityComplaint && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">Adjust Priority Level (US06)</h2>
              <button onClick={() => setPriorityModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePrioritySubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-2">Select new priority for {targetPriorityComplaint.reference_id}:</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-300 text-xs bg-white font-bold"
                >
                  <option value="Urgent">Urgent Priority</option>
                  <option value="High">High Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="Low">Low Priority</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPriorityModalOpen(false)}
                  className="px-4 py-1.5 rounded-xl border border-slate-300 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold"
                >
                  Save Priority
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
