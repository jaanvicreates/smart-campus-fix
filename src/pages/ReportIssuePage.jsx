import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { CATEGORIES, PRIORITIES } from '../data/categories.js';
import { CAMPUS_LOCATIONS } from '../data/campusLocations.js';
import { api } from '../services/api.js';
import PriorityBadge from '../components/PriorityBadge.jsx';
import { 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  Upload, 
  X, 
  AlertTriangle, 
  MapPin, 
  Building, 
  HelpCircle,
  FileText,
  ShieldAlert,
  Zap,
  Droplets,
  Tv,
  Wifi,
  Armchair,
  GlassWater
} from 'lucide-react';

export default function ReportIssuePage() {
  const { user } = useAuth();
  const { success, error: toastError, warning } = useToast();
  const navigate = useNavigate();

  // 4 Steps: 1. Category, 2. Details & Location, 3. Priority & Photo, 4. Review & Submit
  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [formData, setFormData] = useState({
    category: '',
    title: '',
    description: '',
    building: CAMPUS_LOCATIONS.buildings[0],
    block: CAMPUS_LOCATIONS.blocks[0],
    floor: CAMPUS_LOCATIONS.floors[1], // Ground Floor
    room_area: '',
    additional_location: '',
    priority: 'Medium'
  });

  // Photo state
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  // AI & Duplicate state
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Check duplicate issues when building or room changes
  useEffect(() => {
    if (formData.building && formData.room_area.trim().length >= 3) {
      const timer = setTimeout(async () => {
        try {
          const res = await api.checkDuplicate({
            building: formData.building,
            room_area: formData.room_area
          });
          if (res.hasDuplicates && res.duplicates.length > 0) {
            setDuplicateWarning(res.duplicates[0]);
          } else {
            setDuplicateWarning(null);
          }
        } catch (err) {
          console.warn('Duplicate check skipped:', err);
        }
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setDuplicateWarning(null);
    }
  }, [formData.building, formData.room_area]);

  // Handle Photo selection
  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toastError('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toastError('Image file size must be less than 5MB.');
      return;
    }

    setPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  // Run AI Triage on title/description
  const handleAiAutoTriage = async () => {
    if (!formData.title.trim() && !formData.description.trim()) {
      warning('Please enter an issue title or description first for the AI to analyze.');
      return;
    }

    setAiLoading(true);
    try {
      const res = await api.aiTriage({
        title: formData.title,
        description: formData.description
      });
      setAiSuggestions(res);

      // Auto apply suggested category and priority
      setFormData((prev) => ({
        ...prev,
        category: res.suggestedCategory,
        priority: res.suggestedPriority
      }));
      success(`AI suggested: Category "${res.suggestedCategory}" & Priority "${res.suggestedPriority}" (${res.confidenceScore}% match)`);
    } catch (err) {
      toastError('Failed to run AI triage.');
    } finally {
      setAiLoading(false);
    }
  };

  // Navigation validations between steps
  const validateStep = (step) => {
    if (step === 1) {
      if (!formData.category) {
        toastError('Please select an issue category to proceed.');
        return false;
      }
    } else if (step === 2) {
      if (!formData.title.trim()) {
        toastError('Please provide a title for the issue.');
        return false;
      }
      if (formData.description.trim().length < 15) {
        toastError('Please describe the issue in detail (at least 15 characters).');
        return false;
      }
      if (!formData.room_area.trim()) {
        toastError('Please enter a specific room, hall, or area.');
        return false;
      }
    } else if (step === 3) {
      if (!formData.priority) {
        toastError('Please choose a priority level.');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(4, prev + 1));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Final submission
  const handleSubmit = async () => {
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) return;

    setSubmitting(true);
    try {
      const payload = new FormData();
      payload.append('title', formData.title.trim());
      payload.append('description', formData.description.trim());
      payload.append('category', formData.category);
      payload.append('priority', formData.priority);
      payload.append('building', formData.building);
      payload.append('block', formData.block);
      payload.append('floor', formData.floor);
      payload.append('room_area', formData.room_area.trim());
      if (formData.additional_location) {
        payload.append('additional_location', formData.additional_location.trim());
      }
      if (photoFile) {
        payload.append('photo', photoFile);
      }

      const res = await api.createComplaint(payload);
      success(`Complaint submitted successfully! Reference: ${res.reference_id}`);
      navigate(`/report/confirmation/${res.reference_id}`, {
        state: { complaint: res.complaint, reference_id: res.reference_id }
      });
    } catch (err) {
      toastError(err.message || 'Failed to submit complaint.');
      setSubmitting(false);
    }
  };

  const getCategoryIcon = (id) => {
    switch (id) {
      case 'Electrical': return <Zap className="w-5 h-5 text-amber-500" />;
      case 'Plumbing': return <Droplets className="w-5 h-5 text-blue-500" />;
      case 'Cleaning': return <Sparkles className="w-5 h-5 text-emerald-500" />;
      case 'Internet/Wi-Fi': return <Wifi className="w-5 h-5 text-indigo-500" />;
      case 'Classroom Equipment': return <Tv className="w-5 h-5 text-violet-500" />;
      case 'Furniture': return <Armchair className="w-5 h-5 text-orange-500" />;
      case 'Safety': return <ShieldAlert className="w-5 h-5 text-rose-500" />;
      case 'Water Supply': return <GlassWater className="w-5 h-5 text-cyan-500" />;
      default: return <HelpCircle className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Report Campus Issue
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Submit a campus infrastructure problem for review and dispatch.
          </p>
        </div>

        {/* 4-Step Progress Indicator (US02) */}
        <div className="mb-8">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 z-0" />
            <div 
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-brand-600 transition-all duration-300 z-0"
              style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
            />
            
            {[
              { num: 1, label: 'Category' },
              { num: 2, label: 'Details & Location' },
              { num: 3, label: 'Priority & Photo' },
              { num: 4, label: 'Review & Submit' }
            ].map((step) => {
              const isCompleted = currentStep > step.num;
              const isCurrent = currentStep === step.num;

              return (
                <div key={step.num} className="relative z-10 flex flex-col items-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all shadow-sm ${
                      isCompleted
                        ? 'bg-brand-600 text-white ring-4 ring-brand-100'
                        : isCurrent
                        ? 'bg-brand-600 text-white ring-4 ring-brand-200 animate-pulse'
                        : 'bg-white border-2 border-slate-300 text-slate-500'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : step.num}
                  </div>
                  <span
                    className={`mt-2 text-[11px] font-semibold hidden sm:block ${
                      isCurrent ? 'text-brand-700' : 'text-slate-500'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* STEP 1: CATEGORY SELECTION (US03) */}
        {currentStep === 1 && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Step 1: Select Issue Category</h2>
                <p className="text-xs text-slate-500">Choose the category that best matches the maintenance issue.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              {CATEGORIES.map((cat) => {
                const isSelected = formData.category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: cat.id })}
                    className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-brand-50/80 border-brand-500 ring-2 ring-brand-500/30 shadow-md'
                        : 'bg-white border-slate-200 hover:border-brand-300 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="p-2 rounded-lg bg-slate-100">
                          {getCategoryIcon(cat.id)}
                        </div>
                        {isSelected && (
                          <span className="w-5 h-5 rounded-full bg-brand-600 text-white flex items-center justify-center">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                      <div className="font-bold text-slate-900 text-sm">{cat.label}</div>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {cat.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 2: DETAILS AND STRUCTURED LOCATION (US04) */}
        {currentStep === 2 && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Step 2: Description & Campus Location</h2>
                <p className="text-xs text-slate-500">Provide precise location data and problem description.</p>
              </div>
              <button
                type="button"
                onClick={handleAiAutoTriage}
                disabled={aiLoading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-800 text-xs font-bold border border-cyan-200 transition-colors shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-600 animate-pulse" />
                {aiLoading ? 'Analyzing...' : 'AI Auto-Detect Category & Urgency'}
              </button>
            </div>

            {/* Duplicate Issue Warning Alert if detected */}
            {duplicateWarning && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="font-bold text-amber-800">
                    Similar active issue already reported in this location!
                  </div>
                  <p className="mt-0.5 text-amber-700">
                    A report <strong>"{duplicateWarning.title}"</strong> [Ref: {duplicateWarning.reference_id}] is currently <strong>{duplicateWarning.status}</strong> in {duplicateWarning.building} ({duplicateWarning.room_area}).
                  </p>
                  <p className="mt-1 text-[11px] text-amber-600 font-medium">
                    You may still proceed if this is a separate occurrence.
                  </p>
                </div>
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Issue Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Electrical Breaker Sparking in Robotics Lab"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
              />
            </div>

            {/* Detailed Description with character guidance */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Detailed Description *
                </label>
                <span className={`text-[11px] font-semibold ${
                  formData.description.length < 15 ? 'text-amber-600' : 'text-emerald-600'
                }`}>
                  {formData.description.length}/15 min chars
                </span>
              </div>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Explain what is wrong, when it started, and any hazards or disruptions caused..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
              />
            </div>

            {/* Structured Location Grid */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center gap-1.5 mb-3 text-xs font-bold uppercase tracking-wider text-slate-700">
                <MapPin className="w-4 h-4 text-brand-600" />
                Structured Campus Location
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Building *</label>
                  <select
                    value={formData.building}
                    onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs bg-white"
                  >
                    {CAMPUS_LOCATIONS.buildings.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Block / Wing</label>
                  <select
                    value={formData.block}
                    onChange={(e) => setFormData({ ...formData, block: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs bg-white"
                  >
                    {CAMPUS_LOCATIONS.blocks.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Floor</label>
                  <select
                    value={formData.floor}
                    onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs bg-white"
                  >
                    {CAMPUS_LOCATIONS.floors.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Room / Specific Area *
                  </label>
                  <input
                    type="text"
                    value={formData.room_area}
                    onChange={(e) => setFormData({ ...formData, room_area: e.target.value })}
                    placeholder="e.g. Lab 104, Room 302, West Lobby Restroom"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Additional Landmark / Notes
                  </label>
                  <input
                    type="text"
                    value={formData.additional_location}
                    onChange={(e) => setFormData({ ...formData, additional_location: e.target.value })}
                    placeholder="e.g. Under the central projector, near fire exit"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs"
                  />
                </div>
              </div>
            </div>

          </div>
        )}

        {/* STEP 3: PRIORITY AND PHOTO ATTACHMENT (US05, US06) */}
        {currentStep === 3 && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6 animate-in fade-in">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Step 3: Select Priority & Attach Photo</h2>
              <p className="text-xs text-slate-500">Define the urgency level and optionally upload photographic evidence.</p>
            </div>

            {/* Priority Selection Cards */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Priority Level (US06)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PRIORITIES.map((pri) => {
                  const isSelected = formData.priority === pri.id;
                  return (
                    <button
                      key={pri.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, priority: pri.id })}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-brand-500 bg-brand-50/70 ring-2 ring-brand-500/20 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <PriorityBadge priority={pri.id} />
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-brand-600" />}
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed mt-1">
                        {pri.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Photo Upload (US05) */}
            <div className="pt-4 border-t border-slate-100">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Supporting Photo (Optional, US05)
              </label>

              {!photoPreview ? (
                <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 hover:border-brand-500 rounded-2xl cursor-pointer bg-slate-50 hover:bg-brand-50/30 transition-all text-center">
                  <Upload className="w-8 h-8 text-brand-600 mb-2" />
                  <span className="text-xs font-bold text-slate-800">
                    Click or Drag to Upload Issue Photo
                  </span>
                  <span className="text-[11px] text-slate-500 mt-1">
                    JPG, PNG, WEBP up to 5MB (Persisted on server)
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoSelect}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={photoPreview}
                      alt="Complaint preview"
                      className="w-16 h-16 rounded-xl object-cover border border-slate-200 shadow-sm"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-800 truncate max-w-[200px] sm:max-w-xs">
                        {photoFile?.name || 'Uploaded photo'}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {photoFile ? `${(photoFile.size / 1024).toFixed(1)} KB` : ''} • Ready for upload
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
                    title="Remove attached photo"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

          </div>
        )}

        {/* STEP 4: REVIEW & SUBMIT (US02, US12) */}
        {currentStep === 4 && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6 animate-in fade-in">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Step 4: Review Summary & Submit</h2>
              <p className="text-xs text-slate-500">Verify all information before generating the official reference ticket.</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
                <div>
                  <span className="text-xs text-slate-500 font-medium">Issue Category</span>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">{formData.category}</div>
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-medium">Urgency</span>
                  <div className="mt-0.5"><PriorityBadge priority={formData.priority} /></div>
                </div>
              </div>

              <div>
                <span className="text-xs text-slate-500 font-medium">Title</span>
                <div className="font-bold text-slate-900 text-base mt-0.5">{formData.title}</div>
              </div>

              <div>
                <span className="text-xs text-slate-500 font-medium">Detailed Description</span>
                <p className="text-xs text-slate-700 leading-relaxed mt-0.5 bg-white p-3 rounded-xl border border-slate-200">
                  {formData.description}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500">Building</span>
                  <div className="font-semibold text-slate-800">{formData.building}</div>
                </div>
                <div>
                  <span className="text-slate-500">Block / Wing</span>
                  <div className="font-semibold text-slate-800">{formData.block}</div>
                </div>
                <div>
                  <span className="text-slate-500">Floor</span>
                  <div className="font-semibold text-slate-800">{formData.floor}</div>
                </div>
                <div>
                  <span className="text-slate-500">Room / Area</span>
                  <div className="font-semibold text-slate-800">{formData.room_area}</div>
                </div>
              </div>

              {photoPreview && (
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-xs text-slate-500 font-medium block mb-2">Photo Attachment:</span>
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-24 h-24 rounded-xl object-cover border border-slate-200"
                  />
                </div>
              )}
            </div>

            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0" />
              <span>
                Once submitted, a unique reference ID will be assigned and campus administrators will review the report for maintenance dispatch.
              </span>
            </div>
          </div>
        )}

        {/* Wizard Controls */}
        <div className="mt-6 flex items-center justify-between">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          ) : <div />}

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-1.5"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="px-7 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-500 hover:to-cyan-500 disabled:opacity-50 text-white font-bold text-sm shadow-glow transition-all flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating Ticket...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Submit Official Report
                </>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
