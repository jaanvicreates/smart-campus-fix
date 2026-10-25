import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';
import StatusBadge from '../components/StatusBadge.jsx';
import PriorityBadge from '../components/PriorityBadge.jsx';
import { 
  CheckCircle2, 
  ArrowRight, 
  Copy, 
  Check, 
  PlusCircle, 
  LayoutDashboard, 
  MapPin, 
  Building2, 
  Clock,
  Sparkles
} from 'lucide-react';

export default function ConfirmationPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(location.state?.complaint || null);
  const [loading, setLoading] = useState(!location.state?.complaint);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!complaint && id) {
      api.getComplaint(id)
        .then((res) => {
          setComplaint(res.complaint);
        })
        .catch((err) => {
          console.error(err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id, complaint]);

  const copyRefId = () => {
    if (complaint?.reference_id) {
      navigator.clipboard.writeText(complaint.reference_id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6">
        <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mb-4" />
        <p className="text-slate-600 text-sm font-medium">Verifying ticket persistence...</p>
      </div>
    );
  }

  const refId = complaint?.reference_id || id;

  return (
    <div className="min-h-[85vh] bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-300">
        
        {/* Success Banner Card */}
        <div className="p-8 rounded-3xl bg-gradient-to-b from-navy-900 to-navy-950 text-white border border-navy-800 shadow-2xl text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center mb-4 shadow-inner">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-semibold mb-3 border border-cyan-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            Official Complaint Registered & Persisted (US12)
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Report Submitted Successfully!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-md mx-auto leading-relaxed">
            Your issue has been logged into the central campus repository. Facility administrators and engineers have been notified.
          </p>

          {/* Reference ID Pill */}
          <div className="mt-6 inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-navy-900 border border-slate-700 shadow-inner">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Reference ID:</span>
            <span className="font-mono font-extrabold text-base sm:text-lg text-cyan-300 tracking-wide">
              {refId}
            </span>
            <button
              onClick={copyRefId}
              className="p-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-300 hover:text-white transition-colors"
              title="Copy Reference ID"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Issue Snapshot Card */}
        {complaint && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">
              Complaint Record Snapshot
            </h2>

            <div>
              <div className="text-base font-bold text-slate-900">{complaint.title}</div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                {complaint.description}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 block text-[10px] font-semibold uppercase">Category</span>
                <span className="font-bold text-slate-900 mt-0.5 block">{complaint.category}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 block text-[10px] font-semibold uppercase">Priority</span>
                <div className="mt-1"><PriorityBadge priority={complaint.priority} size="sm" /></div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 block text-[10px] font-semibold uppercase">Initial Status</span>
                <div className="mt-1"><StatusBadge status={complaint.status} size="sm" /></div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 block text-[10px] font-semibold uppercase">Location</span>
                <span className="font-bold text-slate-900 mt-0.5 block truncate">{complaint.building}</span>
                <span className="text-[10px] text-slate-500 block">{complaint.room_area}</span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to={`/complaints/${refId}`}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2"
          >
            <span>Track Status & View Live Timeline</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/report"
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-300 transition-colors flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            Report Another Issue
          </Link>
          <Link
            to="/dashboard"
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors flex items-center justify-center gap-2"
          >
            <LayoutDashboard className="w-4 h-4" />
            Go to Dashboard
          </Link>
        </div>

      </div>
    </div>
  );
}
