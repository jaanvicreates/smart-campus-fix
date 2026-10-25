import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { api } from '../services/api.js';
import StatusBadge from '../components/StatusBadge.jsx';
import PriorityBadge from '../components/PriorityBadge.jsx';
import Timeline from '../components/Timeline.jsx';
import { 
  ArrowLeft, 
  MapPin, 
  User, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Wrench, 
  AlertCircle, 
  Maximize2, 
  X, 
  UserCheck, 
  RotateCcw,
  Archive,
  Phone,
  Mail,
  Building2,
  FileText
} from 'lucide-react';

export default function ComplaintDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageModalOpen, setImageModalOpen] = useState(false);

  // Modals for actions
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [assignRemarks, setAssignRemarks] = useState('');

  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');

  const [reopenModalOpen, setReopenModalOpen] = useState(false);
  const [reopenReason, setReopenReason] = useState('');

  const [statusUpdateRemarks, setStatusUpdateRemarks] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const loadComplaint = async () => {
    try {
      const res = await api.getComplaint(id);
      setData(res);
    } catch (err) {
      toastError(err.message || 'Failed to load complaint.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaint();
  }, [id]);

  // Open Assign Modal and fetch staff
  const handleOpenAssign = async () => {
    try {
      const res = await api.getStaff();
      setStaffList(res.staff || []);
      setAssignModalOpen(true);
    } catch (err) {
      toastError('Failed to fetch staff list.');
    }
  };

  // Submit Assignment
  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStaffId) {
      toastError('Please select a maintenance staff member.');
      return;
    }
    setActionLoading(true);
    try {
      await api.assignComplaint(data.complaint.id, {
        staff_id: selectedStaffId,
        remarks: assignRemarks
      });
      success('Complaint successfully assigned to maintenance staff!');
      setAssignModalOpen(false);
      loadComplaint();
    } catch (err) {
      toastError(err.message || 'Assignment failed.');
    } finally {
      setActionLoading(false);
    }
  };

  // Staff moves to In Progress
  const handleStartProgress = async () => {
    setActionLoading(true);
    try {
      await api.updateStatus(data.complaint.id, {
        status: 'In Progress',
        remarks: statusUpdateRemarks || 'Technician has arrived on site and initiated diagnostic/repair work.'
      });
      success('Status updated to In Progress.');
      setStatusUpdateRemarks('');
      loadComplaint();
    } catch (err) {
      toastError(err.message || 'Status update failed.');
    } finally {
      setActionLoading(false);
    }
  };

  // Submit Resolution
  const handleResolveSubmit = async (e) => {
    e.preventDefault();
    if (!resolutionNotes || resolutionNotes.trim().length < 10) {
      toastError('Please enter detailed resolution notes (at least 10 characters).');
      return;
    }
    setActionLoading(true);
    try {
      await api.resolveComplaint(data.complaint.id, { resolution_notes: resolutionNotes });
      success('Work completed! Complaint marked as Resolved.');
      setResolveModalOpen(false);
      loadComplaint();
    } catch (err) {
      toastError(err.message || 'Failed to resolve complaint.');
    } finally {
      setActionLoading(false);
    }
  };

  // Admin or Reporter Closes Ticket
  const handleCloseComplaint = async () => {
    if (!window.confirm('Are you sure you want to officially close and archive this complaint?')) return;
    setActionLoading(true);
    try {
      await api.closeComplaint(data.complaint.id, { closure_remarks: 'Verified complete and operational.' });
      success('Complaint officially closed.');
      loadComplaint();
    } catch (err) {
      toastError(err.message || 'Failed to close complaint.');
    } finally {
      setActionLoading(false);
    }
  };

  // Reopen Ticket
  const handleReopenSubmit = async (e) => {
    e.preventDefault();
    if (!reopenReason || reopenReason.trim().length < 10) {
      toastError('Please provide a reason for reopening (minimum 10 characters).');
      return;
    }
    setActionLoading(true);
    try {
      await api.reopenComplaint(data.complaint.id, { reason: reopenReason });
      success('Complaint has been reopened for follow-up review.');
      setReopenModalOpen(false);
      loadComplaint();
    } catch (err) {
      toastError(err.message || 'Failed to reopen complaint.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6">
        <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mb-4" />
        <p className="text-slate-600 text-sm font-medium">Fetching complaint and audit timeline...</p>
      </div>
    );
  }

  if (!data || !data.complaint) {
    return (
      <div className="min-h-[70vh] max-w-lg mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-900">Complaint Not Found</h2>
        <p className="text-xs text-slate-500 mt-1 mb-6">
          The requested ticket does not exist or you lack authorization to inspect it.
        </p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 text-white font-bold text-xs"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Dashboard
        </Link>
      </div>
    );
  }

  const { complaint, timeline } = data;
  const isStaffAssigned = user?.role === 'staff' && complaint.assigned_staff_id === user.id;
  const isAdmin = user?.role === 'admin';
  const isReporter = user?.id === complaint.user_id;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to previous page
          </button>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
            <span>Ticket Ref:</span>
            <span className="font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
              {complaint.reference_id}
            </span>
          </div>
        </div>

        {/* Top Header Card */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={complaint.status} />
              <PriorityBadge priority={complaint.priority} />
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                {complaint.category}
              </span>
            </div>

            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Reported on: {new Date(complaint.created_at).toLocaleString()}</span>
            </div>
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">
            {complaint.title}
          </h1>

          <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 whitespace-pre-wrap">
            {complaint.description}
          </p>

          {/* Quick Action Bar for Roles */}
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-slate-500 font-medium">
              Actions for: <strong className="text-slate-800 capitalize">{user?.role}</strong>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Admin: Assign or Reassign */}
              {isAdmin && complaint.status !== 'Closed' && (
                <button
                  onClick={handleOpenAssign}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <UserCheck className="w-4 h-4" />
                  {complaint.assigned_staff_id ? 'Reassign Staff' : 'Assign to Staff'}
                </button>
              )}

              {/* Staff: Start Progress */}
              {isStaffAssigned && complaint.status === 'Assigned' && (
                <button
                  onClick={handleStartProgress}
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <Wrench className="w-4 h-4" />
                  Begin Repair (Mark In Progress)
                </button>
              )}

              {/* Staff or Admin: Resolve Ticket */}
              {(isStaffAssigned || isAdmin) && complaint.status === 'In Progress' && (
                <button
                  onClick={() => setResolveModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Mark Work Completed & Resolved
                </button>
              )}

              {/* Admin or Reporter: Official Close */}
              {(isAdmin || isReporter) && complaint.status === 'Resolved' && (
                <button
                  onClick={handleCloseComplaint}
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <Archive className="w-4 h-4" />
                  Confirm & Close Ticket
                </button>
              )}

              {/* Reopen Workflow */}
              {(isAdmin || isReporter) && ['Resolved', 'Closed'].includes(complaint.status) && (
                <button
                  onClick={() => setReopenModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 font-bold text-xs transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reopen Issue
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 2-Column Info Grid: Left is Info & Evidence, Right is Live Audit Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Location, Photo Evidence, Staff & Reporter Info */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Structured Location Box */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-brand-600" />
                Campus Location (US04)
              </h2>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-500">Building</span>
                  <span className="font-bold text-slate-900">{complaint.building}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-500">Block / Wing</span>
                  <span className="font-semibold text-slate-800">{complaint.block || 'Main'}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-500">Floor</span>
                  <span className="font-semibold text-slate-800">{complaint.floor || 'Ground'}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-500">Room / Area</span>
                  <span className="font-bold text-brand-700">{complaint.room_area}</span>
                </div>
                {complaint.additional_location && (
                  <div className="pt-1 text-slate-600 italic">
                    Note: {complaint.additional_location}
                  </div>
                )}
              </div>
            </div>

            {/* Photo Evidence Box (US05) */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Photo Evidence (US05)
              </h2>
              {complaint.photo_url ? (
                <div className="relative group rounded-xl overflow-hidden border border-slate-200">
                  <img
                    src={complaint.photo_url}
                    alt="Campus issue evidence"
                    className="w-full h-44 object-cover cursor-pointer group-hover:scale-105 transition-transform duration-300"
                    onClick={() => setImageModalOpen(true)}
                  />
                  <button
                    onClick={() => setImageModalOpen(true)}
                    className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/60 text-white hover:bg-black/80 transition-colors text-xs flex items-center gap-1"
                  >
                    <Maximize2 className="w-3.5 h-3.5" /> Full View
                  </button>
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  No photographic attachment provided.
                </div>
              )}
            </div>

            {/* Assigned Staff Box (US09, US10) */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Wrench className="w-4 h-4 text-cyan-600" />
                Assigned Maintenance Staff
              </h2>
              {complaint.assigned_staff_id ? (
                <div className="space-y-2 text-xs">
                  <div className="font-bold text-slate-900 text-sm">{complaint.assigned_staff_name}</div>
                  <div className="text-slate-500">{complaint.assigned_staff_dept || 'Facility Maintenance'}</div>
                  {complaint.assigned_staff_email && (
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{complaint.assigned_staff_email}</span>
                    </div>
                  )}
                  {complaint.assigned_staff_phone && (
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{complaint.assigned_staff_phone}</span>
                    </div>
                  )}
                  {complaint.assigned_at && (
                    <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                      Assigned on: {new Date(complaint.assigned_at).toLocaleString()}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 text-center text-xs text-slate-500 bg-amber-50/60 rounded-xl border border-amber-200">
                  Awaiting Administrative Assignment
                </div>
              )}
            </div>

            {/* Resolution Box if resolved (US11) */}
            {complaint.resolution_notes && (
              <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-200 shadow-sm space-y-2 text-xs">
                <h2 className="font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Official Resolution Notes
                </h2>
                <p className="text-emerald-950 leading-relaxed whitespace-pre-wrap">
                  {complaint.resolution_notes}
                </p>
                {complaint.resolved_at && (
                  <div className="pt-2 text-[11px] text-emerald-700">
                    Completed: {new Date(complaint.resolved_at).toLocaleString()}
                  </div>
                )}
              </div>
            )}

            {/* Reporter Profile Box */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2 text-xs">
              <h2 className="font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <User className="w-4 h-4 text-brand-600" />
                Campus Reporter
              </h2>
              <div className="font-semibold text-slate-900">{complaint.reporter_name}</div>
              <div className="text-slate-500">{complaint.reporter_department || 'Student'}</div>
              <div className="text-slate-500">{complaint.reporter_email}</div>
            </div>

          </div>

          {/* Right Column: Live Audit Timeline (US07, US10, US11) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Audit & Status Transition History (US07)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Chronological lifecycle records with responsible actors and timestamps.
                  </p>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                  {timeline.length} Recorded Events
                </span>
              </div>

              {/* Render visual vertical timeline component */}
              <Timeline history={timeline} />
            </div>
          </div>

        </div>

      </div>

      {/* FULL-SIZE IMAGE LIGHTBOX MODAL */}
      {imageModalOpen && complaint.photo_url && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setImageModalOpen(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={complaint.photo_url}
              alt="High-resolution evidence"
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
            />
            <button
              onClick={() => setImageModalOpen(false)}
              className="absolute -top-3 -right-3 p-2 rounded-full bg-white text-slate-900 hover:bg-slate-100 shadow-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* ASSIGN MODAL (US09) */}
      {assignModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Assign Maintenance Staff (US09)</h2>
              <button onClick={() => setAssignModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Technician *</label>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {staffList.map((s) => (
                    <label
                      key={s.id}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedStaffId === s.id
                          ? 'border-brand-500 bg-brand-50/70 ring-2 ring-brand-500/20'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-slate-900">{s.name}</div>
                        <div className="text-[11px] text-slate-500">{s.specialty || s.department}</div>
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border">
                          {s.active_tickets_count} Active Tickets
                        </span>
                        <input
                          type="radio"
                          name="staff"
                          value={s.id}
                          checked={selectedStaffId === s.id}
                          onChange={() => setSelectedStaffId(s.id)}
                          className="hidden"
                        />
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Assignment Remarks (Optional)</label>
                <textarea
                  rows={2}
                  value={assignRemarks}
                  onChange={(e) => setAssignRemarks(e.target.value)}
                  placeholder="Instructions for technician (e.g. check sub-breaker 3 first)..."
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
                  disabled={actionLoading || !selectedStaffId}
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-sm disabled:opacity-50"
                >
                  Confirm Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESOLVE MODAL (US11) */}
      {resolveModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Submit Work Completion (US11)</h2>
              <button onClick={() => setResolveModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResolveSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Detailed Resolution Notes *</label>
                <p className="text-[11px] text-slate-500 mb-2">
                  Document the exact repairs performed, parts replaced, and functional tests executed.
                </p>
                <textarea
                  rows={4}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="e.g. Replaced 32A breaker fuse. Tested load at full 240V for 30 minutes without trip..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setResolveModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm disabled:opacity-50"
                >
                  Confirm Resolution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REOPEN MODAL */}
      {reopenModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Reopen Issue Ticket</h2>
              <button onClick={() => setReopenModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReopenSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Reason for Reopening *</label>
                <textarea
                  rows={3}
                  value={reopenReason}
                  onChange={(e) => setReopenReason(e.target.value)}
                  placeholder="Explain why the issue is not resolved or has reoccurred..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReopenModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm disabled:opacity-50"
                >
                  Reopen Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
