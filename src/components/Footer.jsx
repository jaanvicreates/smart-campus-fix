import React from 'react';
import { Link } from 'react-router-dom';
import { Wrench, PhoneCall, Shield, Cpu } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-navy-950 border-t border-navy-800 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Col 1: System info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-cyanAccent-400 flex items-center justify-center text-white">
                <Wrench className="w-4 h-4" />
              </div>
              <span className="font-bold text-white text-base">Smart Campus Fix</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              AI-driven issue reporting, automated triage, and lifecycle management platform for university infrastructure.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
              <Cpu className="w-4 h-4" />
              <span>Smart Triage & Duplicate Prevention</span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h3 className="font-semibold text-white text-xs tracking-wider uppercase mb-3">Campus Portals</h3>
            <ul className="space-y-2 text-xs">
              <li><Link to="/dashboard" className="hover:text-cyan-300 transition-colors">Student Reporting Portal</Link></li>
              <li><Link to="/staff" className="hover:text-cyan-300 transition-colors">Maintenance Operations Desk</Link></li>
              <li><Link to="/admin" className="hover:text-cyan-300 transition-colors">Administrative Overview</Link></li>
              <li><Link to="/report" className="hover:text-cyan-300 transition-colors">Submit Urgent Ticket</Link></li>
              <li><Link to="/my-complaints" className="hover:text-cyan-300 transition-colors">Live Issue Tracking</Link></li>
            </ul>
          </div>

          {/* Col 3: Academic Specification Checklist */}
          <div>
            <h3 className="font-semibold text-white text-xs tracking-wider uppercase mb-3">Academic Specification</h3>
            <div className="text-xs space-y-1.5 text-slate-400">
              <p className="flex items-center gap-1.5 text-emerald-400">
                <Shield className="w-3.5 h-3.5" />
                <span>13 Fixed Official User Stories (US01–US13)</span>
              </p>
              <p>• Native SQLite Database Engine</p>
              <p>• Multi-Tier Role-Based Security</p>
              <p>• Audit History Trail Preservation</p>
              <p>• Real-time Notification Engine</p>
            </div>
          </div>

          {/* Col 4: Campus Dispatch Contacts */}
          <div>
            <h3 className="font-semibold text-white text-xs tracking-wider uppercase mb-3">Facility Emergency</h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <PhoneCall className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-white font-medium">Campus Dispatch Emergency</div>
                  <div className="text-slate-400">+1 (555) 0199 (24/7 Hot-line)</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <PhoneCall className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-white font-medium">IT & Network Helpdesk</div>
                  <div className="text-slate-400">+1 (555) 0142 (8am - 8pm)</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-navy-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 Smart Campus Fix • University Final Review Capstone Project. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>Built for Modern Universities</span>
            <span>•</span>
            <span className="text-brand-400 font-medium">v1.0.0 Stable</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
