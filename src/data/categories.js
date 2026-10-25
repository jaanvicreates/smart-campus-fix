export const CATEGORIES = [
  {
    id: 'Electrical',
    label: 'Electrical',
    description: 'Power outages, flickering lights, damaged switches, sparks, circuit breakers',
    icon: 'Zap',
    color: 'from-amber-500 to-yellow-600',
    lightBg: 'bg-amber-50 text-amber-700 border-amber-200',
    typicalEta: '2 - 4 hours'
  },
  {
    id: 'Plumbing',
    label: 'Plumbing',
    description: 'Pipe leaks, clogged sinks, restroom toilet malfunctions, water drainage',
    icon: 'Droplets',
    color: 'from-blue-500 to-cyan-600',
    lightBg: 'bg-blue-50 text-blue-700 border-blue-200',
    typicalEta: '3 - 6 hours'
  },
  {
    id: 'Cleaning',
    label: 'Cleaning',
    description: 'Trash overflow, spills, classroom sanitation, pest control, restroom hygiene',
    icon: 'Sparkles',
    color: 'from-emerald-500 to-teal-600',
    lightBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    typicalEta: '1 - 3 hours'
  },
  {
    id: 'Internet/Wi-Fi',
    label: 'Internet / Wi-Fi',
    description: 'Campus Wi-Fi connectivity drops, ethernet wall ports, slow speeds, router offline',
    icon: 'Wifi',
    color: 'from-indigo-500 to-blue-600',
    lightBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    typicalEta: '2 - 6 hours'
  },
  {
    id: 'Classroom Equipment',
    label: 'Classroom Equipment',
    description: 'Projectors, smartboards, podium microphones, audio speakers, HDMI display',
    icon: 'Tv',
    color: 'from-violet-500 to-purple-600',
    lightBg: 'bg-violet-50 text-violet-700 border-violet-200',
    typicalEta: '4 - 8 hours'
  },
  {
    id: 'Furniture',
    label: 'Furniture',
    description: 'Broken desks, squeaking or broken chairs, whiteboard damage, door locks',
    icon: 'Armchair',
    color: 'from-orange-500 to-amber-700',
    lightBg: 'bg-orange-50 text-orange-700 border-orange-200',
    typicalEta: '1 - 2 days'
  },
  {
    id: 'Safety',
    label: 'Safety',
    description: 'Fire extinguisher checks, emergency exit obstructions, broken handrails, slippery hazards',
    icon: 'ShieldAlert',
    color: 'from-rose-500 to-red-600',
    lightBg: 'bg-rose-50 text-rose-700 border-rose-200',
    typicalEta: 'Immediate (1 - 2 hrs)'
  },
  {
    id: 'Water Supply',
    label: 'Water Supply',
    description: 'Drinking water coolers, RO filters, lack of running water, tank refill',
    icon: 'GlassWater',
    color: 'from-cyan-500 to-blue-500',
    lightBg: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    typicalEta: '2 - 4 hours'
  },
  {
    id: 'Other',
    label: 'Other',
    description: 'General maintenance, HVAC air-conditioning, campus landscaping, signage',
    icon: 'HelpCircle',
    color: 'from-slate-500 to-slate-700',
    lightBg: 'bg-slate-50 text-slate-700 border-slate-200',
    typicalEta: '1 - 3 days'
  }
];

export const PRIORITIES = [
  {
    id: 'Urgent',
    label: 'Urgent',
    description: 'Immediate hazard to personal safety or severe structural/campus disruption (e.g., active sparking, pipe flooding, gas odor).',
    color: 'bg-rose-500 text-white',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
    indicator: 'bg-rose-500'
  },
  {
    id: 'High',
    label: 'High',
    description: 'Significant operational impact on classes, labs, exams, or major study areas.',
    color: 'bg-amber-500 text-white',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
    indicator: 'bg-amber-500'
  },
  {
    id: 'Medium',
    label: 'Medium',
    description: 'Noticeable inconvenience or partial disruption that should be addressed within 24 hours.',
    color: 'bg-blue-500 text-white',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
    indicator: 'bg-blue-500'
  },
  {
    id: 'Low',
    label: 'Low',
    description: 'Minor cosmetic flaw, slight wear and tear, or low-priority non-disruptive task.',
    color: 'bg-slate-500 text-white',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-300',
    indicator: 'bg-slate-400'
  }
];
