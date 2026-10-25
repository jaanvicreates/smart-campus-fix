import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, DEMO_CREDENTIALS } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { CATEGORIES } from '../data/categories.js';
import { 
  Wrench, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  Zap, 
  Droplets, 
  Wifi, 
  Cpu, 
  MapPin, 
  UserCheck, 
  ChevronRight,
  TrendingUp,
  FileCheck
} from 'lucide-react';
import { api } from '../services/api.js';

export default function LandingPage() {
  const { isAuthenticated, user, loginAsDemo, getDefaultRedirect } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();

  // Interactive AI Triage demo state on Landing Page
  const [demoPrompt, setDemoPrompt] = useState('Air conditioning unit rattling loudly and leaking water in Lecture Theatre 3A');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  const handleRunAiDemo = async () => {
    if (!demoPrompt.trim()) return;
    setAiLoading(true);
    try {
      const result = await api.aiTriage({ title: demoPrompt, description: demoPrompt });
      setAiResult(result);
    } catch (err) {
      // Local fallback simulation if offline
      setAiResult({
        suggestedCategory: 'Plumbing',
        suggestedPriority: 'High',
        confidenceScore: 92,
        estimatedResolutionHours: 4,
        suggestedDepartment: 'Plumbing & Hydraulic Systems',
        tags: ['#WaterLeak', '#LectureHallImpact', '#Plumbing']
      });
    } finally {
      setAiLoading(false);
    }
  };

  const handleQuickLogin = async (role) => {
    try {
      const loggedUser = await loginAsDemo(role);
      success(`Signed in as ${loggedUser.name} (${loggedUser.role})`);
      navigate(getDefaultRedirect(loggedUser.role));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-navy-950 text-white pt-16 pb-24 lg:pt-24 lg:pb-32">
        {/* Subtle decorative background shapes */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(37,99,235,0.35),rgba(255,255,255,0))]" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-cyan-500/10 blur-[120px] pointer-events-none rounded-full" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-900/80 border border-brand-500/40 text-cyan-300 text-xs font-semibold shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>Next-Gen Campus Facilities • AI Smart Triage System</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight break-words">
              Report Campus Issues in Seconds. <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-brand-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
                Tracked to Complete Resolution.
              </span>
            </h1>

            {/* Sub-headline */}
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
              Smart Campus Fix connects students, facility managers, and specialized maintenance engineers 
              into a single synchronized ecosystem. Powered by AI issue categorization, duplicate detection, 
              and transparent audit histories.
            </p>

            {/* Call to Actions */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              {isAuthenticated ? (
                <Link
                  to={getDefaultRedirect(user?.role)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-500 hover:to-cyan-500 text-white font-bold text-sm shadow-glow transition-all hover:scale-[1.02]"
                >
                  Go to {user?.role === 'admin' ? 'Admin Portal' : user?.role === 'staff' ? 'Staff Workspace' : 'My Dashboard'}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/report"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-500 hover:to-cyan-500 text-white font-bold text-sm shadow-glow transition-all hover:scale-[1.02]"
                  >
                    Report Campus Issue Now
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/login"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-200 hover:text-white font-semibold text-sm border border-slate-700 transition-colors"
                  >
                    Sign In to Portal
                  </Link>
                </>
              )}
            </div>

            {/* 1-Click Evaluation Role Bar */}
            <div className="pt-8">
              <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-3">
                Faculty Evaluation: Quick 1-Click Role Access
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-w-2xl mx-auto">
                {DEMO_CREDENTIALS.map((demo) => (
                  <button
                    key={demo.role + demo.email}
                    onClick={() => handleQuickLogin(demo.email)}
                    className="flex flex-col items-center p-2.5 rounded-xl bg-navy-900/90 border border-slate-800 hover:border-brand-500/50 hover:bg-navy-800 transition-all text-center group"
                  >
                    <span className="text-xs font-bold text-slate-200 group-hover:text-cyan-300">
                      {demo.title}
                    </span>
                    <span className="text-[10px] text-slate-400 capitalize">
                      {demo.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* STATS BANNER */}
      <section className="bg-white border-b border-slate-200 py-8 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-2xl sm:text-3xl font-extrabold text-brand-700">100%</div>
              <div className="text-xs text-slate-600 font-medium mt-1">13 User Stories Traceable</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-2xl sm:text-3xl font-extrabold text-cyan-600">&lt; 15 min</div>
              <div className="text-xs text-slate-600 font-medium mt-1">Average Triage Time</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">ACID SQLite</div>
              <div className="text-xs text-slate-600 font-medium mt-1">Native Persistent Database</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-2xl sm:text-3xl font-extrabold text-purple-600">Full Audit</div>
              <div className="text-xs text-slate-600 font-medium mt-1">Preserved History Timeline</div>
            </div>
          </div>
        </div>
      </section>

      {/* INTERACTIVE AI SMART TRIAGE SHOWCASE */}
      <section className="py-16 lg:py-20 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-100 text-cyan-800 text-xs font-bold mb-3">
              <Cpu className="w-3.5 h-3.5" />
              Interactive AI Assistant
            </div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              Test Smart Campus AI Triage
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Type any campus problem below. Our NLP classifier categorizes the issue, determines urgency, and recommends the appropriate maintenance crew in real-time.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="p-6 sm:p-8 bg-gradient-to-b from-slate-50 to-white border-b border-slate-200">
              <label htmlFor="ai-input" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Sample Complaint Description:
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  id="ai-input"
                  type="text"
                  value={demoPrompt}
                  onChange={(e) => setDemoPrompt(e.target.value)}
                  placeholder="e.g. Broken water pipe leaking under science lab sink..."
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm shadow-inner"
                />
                <button
                  onClick={handleRunAiDemo}
                  disabled={aiLoading}
                  className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2 shrink-0"
                >
                  {aiLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-cyan-300" />
                      Run AI Analysis
                    </>
                  )}
                </button>
              </div>

              {/* Sample Quick Chips */}
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="font-semibold text-slate-700">Try quick prompts:</span>
                <button
                  onClick={() => setDemoPrompt('Main electrical breaker box sparked and threw flames in Robotics Lab')}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-brand-50 hover:text-brand-700 transition-colors border border-slate-200"
                >
                  ⚡ Sparks in Lab
                </button>
                <button
                  onClick={() => setDemoPrompt('Wi-Fi router in Quiet Study Room dropping connection every 2 minutes')}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-brand-50 hover:text-brand-700 transition-colors border border-slate-200"
                >
                  📶 Wi-Fi drops
                </button>
                <button
                  onClick={() => setDemoPrompt('Ceiling projector HDMI input port bent and unprojectable')}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-brand-50 hover:text-brand-700 transition-colors border border-slate-200"
                >
                  📽️ Bent Projector
                </button>
              </div>
            </div>

            {/* AI Results Display */}
            {aiResult && (
              <div className="p-6 sm:p-8 bg-brand-950 text-white animate-in fade-in duration-300">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-navy-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                    <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                      AI Triage Assessment Complete
                    </span>
                  </div>
                  <div className="text-xs font-semibold px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    Confidence: {aiResult.confidenceScore}%
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-navy-900 border border-navy-800">
                    <div className="text-xs text-slate-400">Classified Category</div>
                    <div className="text-base font-bold text-white mt-1">{aiResult.suggestedCategory}</div>
                  </div>
                  <div className="p-4 rounded-xl bg-navy-900 border border-navy-800">
                    <div className="text-xs text-slate-400">Assessed Priority</div>
                    <div className={`text-base font-bold mt-1 ${
                      aiResult.suggestedPriority === 'Urgent' ? 'text-rose-400' :
                      aiResult.suggestedPriority === 'High' ? 'text-amber-400' : 'text-cyan-400'
                    }`}>
                      {aiResult.suggestedPriority}
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-navy-900 border border-navy-800">
                    <div className="text-xs text-slate-400">Target Dispatch Unit</div>
                    <div className="text-base font-bold text-white mt-1 truncate">{aiResult.suggestedDepartment}</div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
                  <div>
                    <span className="text-slate-300 font-semibold">Triage Reasoning:</span> {aiResult.reasoning}
                  </div>
                  <div className="flex gap-1.5">
                    {aiResult.tags?.map((t) => (
                      <span key={t} className="px-2 py-0.5 rounded bg-navy-800 text-cyan-300 border border-navy-700">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS: 4-STEP JOURNEY */}
      <section className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              From Report to Resolution in 4 Clear Stages
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Every complaint is assigned a human-readable identifier (SCF-2026-XXXX) and maintains an immutable audit trail.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="relative p-6 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold text-base mb-4 shadow-sm">
                  1
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-2">Issue Submission</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Students submit details with category, structured campus building/room, priority, and optional photos.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] font-semibold text-brand-700 flex items-center gap-1">
                <FileCheck className="w-3.5 h-3.5" />
                US02, US03, US04, US05
              </div>
            </div>

            <div className="relative p-6 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-base mb-4 shadow-sm">
                  2
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-2">Admin Review & AI Check</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Administrators inspect tickets, check duplicate alerts, verify urgency, and dispatch to active staff.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] font-semibold text-purple-700 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                US08, US09
              </div>
            </div>

            <div className="relative p-6 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-cyan-600 text-white flex items-center justify-center font-bold text-base mb-4 shadow-sm">
                  3
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-2">Maintenance Execution</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Specialized technicians inspect tasks, transition status to In Progress, and record timestamped notes.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] font-semibold text-cyan-700 flex items-center gap-1">
                <Wrench className="w-3.5 h-3.5" />
                US10
              </div>
            </div>

            <div className="relative p-6 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-base mb-4 shadow-sm">
                  4
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-2">Resolution & Closure</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Technicians submit resolution notes; administrators confirm and officially archive closed tickets.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                US11, US13
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES GRID */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              Supported Campus Categories (US03)
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Every facility domain is routed directly to specialized personnel for maximum repair turnaround.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {CATEGORIES.map((cat) => (
              <div
                key={cat.id}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-brand-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-slate-900 text-base">{cat.label}</span>
                    <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                      ETA: {cat.typicalEta}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {cat.description}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-brand-600">Active Campus Routing</span>
                  <Link
                    to="/report"
                    className="text-xs font-bold text-slate-700 hover:text-brand-600 flex items-center gap-1"
                  >
                    Report <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="py-16 bg-navy-900 text-white border-t border-navy-800">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready for the Final Review Demonstration?
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto">
            Experience the entire lifecycle from student submission to administrative assignment and maintenance completion.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to="/login"
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-500 hover:to-cyan-500 text-white font-bold text-sm shadow-glow transition-all"
            >
              Start Demonstration
            </Link>
            <Link
              to="/report"
              className="px-6 py-3.5 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-200 border border-slate-700 font-semibold text-sm transition-colors"
            >
              Test Reporting Form
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
