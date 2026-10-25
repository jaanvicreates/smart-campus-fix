// Local Demonstration Data Layer for Standalone / Vercel Deployments
// Provides full client-side persistence and business logic for all 13 user stories
// when an external backend is not deployed.

const STORAGE_KEY = 'scf_local_database_v2';

// Initial seed data mirroring server/seed.js
const INITIAL_USERS = [
  {
    id: 1,
    name: 'Alex Rivera',
    email: 'alex.student@campus.edu',
    password: 'Student123!',
    role: 'student',
    department: 'Computer Science & Engineering',
    phone: '+1 (555) 234-5678',
    created_at: '2026-10-25T08:00:00.000Z'
  },
  {
    id: 2,
    name: 'Dr. Evelyn Patel',
    email: 'dr.patel@campus.edu',
    password: 'Admin123!',
    role: 'admin',
    department: 'Facilities & Campus Infrastructure',
    phone: '+1 (555) 876-5432',
    created_at: '2026-10-25T08:00:00.000Z'
  },
  {
    id: 3,
    name: 'Marcus Vance',
    email: 'marcus.elec@campus.edu',
    password: 'Staff123!',
    role: 'staff',
    department: 'Electrical Maintenance',
    specialty: 'Electrical',
    phone: '+1 (555) 432-1098',
    active_tickets_count: 2,
    is_available: 1,
    created_at: '2026-10-25T08:00:00.000Z'
  },
  {
    id: 4,
    name: 'Sarah Jenkins',
    email: 'sarah.plumb@campus.edu',
    password: 'Staff123!',
    role: 'staff',
    department: 'Plumbing & Hydraulics',
    specialty: 'Plumbing',
    phone: '+1 (555) 654-3210',
    active_tickets_count: 1,
    is_available: 1,
    created_at: '2026-10-25T08:00:00.000Z'
  },
  {
    id: 5,
    name: 'David Kim',
    email: 'david.tech@campus.edu',
    password: 'Staff123!',
    role: 'staff',
    department: 'Campus IT & Wi-Fi Systems',
    specialty: 'Internet/Wi-Fi',
    phone: '+1 (555) 321-9876',
    active_tickets_count: 1,
    is_available: 1,
    created_at: '2026-10-25T08:00:00.000Z'
  }
];

const INITIAL_COMPLAINTS = [
  {
    id: 1,
    reference_id: 'SCF-2026-1001',
    title: 'Main Electrical Distribution Board Sparking & Tripping',
    description: 'Audible crackling and visible sparks observed from the secondary breaker in Computer Lab 104. Circuit breaker tripped twice during afternoon laboratory session. Needs immediate safety inspection before student practical exams.',
    category: 'Electrical',
    priority: 'Urgent',
    status: 'In Progress',
    building: 'Science Complex',
    block: 'Block B',
    floor: '1st Floor',
    room_area: 'Lab 104 (Robotics Lab)',
    additional_location: 'Adjacent to North emergency exit corridor',
    photo_url: null,
    user_id: 1,
    reporter_name: 'Alex Rivera',
    reporter_email: 'alex.student@campus.edu',
    reporter_phone: '+1 (555) 234-5678',
    reporter_department: 'Computer Science & Engineering',
    assigned_staff_id: 3,
    assigned_staff_name: 'Marcus Vance',
    assigned_staff_dept: 'Electrical Maintenance',
    assigned_staff_email: 'marcus.elec@campus.edu',
    assigned_staff_phone: '+1 (555) 432-1098',
    assigned_by_id: 2,
    assigned_by_name: 'Dr. Evelyn Patel',
    assigned_at: '2026-10-25T10:15:00.000Z',
    resolution_notes: null,
    resolved_at: null,
    closed_at: null,
    created_at: '2026-10-25T09:30:00.000Z',
    updated_at: '2026-10-25T11:00:00.000Z'
  },
  {
    id: 2,
    reference_id: 'SCF-2026-1002',
    title: 'Restroom Water Supply Pipe Joint Ruptured & Flooding',
    description: 'High pressure waterline joint under the second handwash basin sheared off, causing significant water accumulation across the entrance lobby. Water is actively spreading towards corridor carpet.',
    category: 'Plumbing',
    priority: 'Urgent',
    status: 'Resolved',
    building: 'Engineering Hall',
    block: 'Block C',
    floor: 'Ground Floor',
    room_area: 'Restroom C-02 (West Lobby)',
    additional_location: 'Behind main staircase landing',
    photo_url: null,
    user_id: 1,
    reporter_name: 'Alex Rivera',
    reporter_email: 'alex.student@campus.edu',
    reporter_phone: '+1 (555) 234-5678',
    reporter_department: 'Computer Science & Engineering',
    assigned_staff_id: 4,
    assigned_staff_name: 'Sarah Jenkins',
    assigned_staff_dept: 'Plumbing & Hydraulics',
    assigned_staff_email: 'sarah.plumb@campus.edu',
    assigned_staff_phone: '+1 (555) 654-3210',
    assigned_by_id: 2,
    assigned_by_name: 'Dr. Evelyn Patel',
    assigned_at: '2026-10-24T14:00:00.000Z',
    resolution_notes: 'Shut down main branch valve 2B. Replaced cracked PVC union joint with reinforced brass fitting, tested under 6 bar operational pressure. Mopping and drying completed.',
    resolved_at: '2026-10-24T16:45:00.000Z',
    closed_at: null,
    created_at: '2026-10-24T13:40:00.000Z',
    updated_at: '2026-10-24T16:45:00.000Z'
  },
  {
    id: 3,
    reference_id: 'SCF-2026-1003',
    title: 'Enterprise Wi-Fi AP-04 Dropping Connections Continuously',
    description: 'Students in the Quiet Study Hall cannot authenticate to the campus eduroam / CampusNet SSID. Signal strength fluctuates constantly and IP allocation times out with DHCP error.',
    category: 'Internet/Wi-Fi',
    priority: 'High',
    status: 'Assigned',
    building: 'Central Library',
    block: 'North Wing',
    floor: '2nd Floor',
    room_area: 'Quiet Study Hall Zone D',
    additional_location: 'Near reference collection shelves 12-18',
    photo_url: null,
    user_id: 1,
    reporter_name: 'Alex Rivera',
    reporter_email: 'alex.student@campus.edu',
    reporter_phone: '+1 (555) 234-5678',
    reporter_department: 'Computer Science & Engineering',
    assigned_staff_id: 5,
    assigned_staff_name: 'David Kim',
    assigned_staff_dept: 'Campus IT & Wi-Fi Systems',
    assigned_staff_email: 'david.tech@campus.edu',
    assigned_staff_phone: '+1 (555) 321-9876',
    assigned_by_id: 2,
    assigned_by_name: 'Dr. Evelyn Patel',
    assigned_at: '2026-10-25T11:30:00.000Z',
    resolution_notes: null,
    resolved_at: null,
    closed_at: null,
    created_at: '2026-10-25T10:50:00.000Z',
    updated_at: '2026-10-25T11:30:00.000Z'
  },
  {
    id: 4,
    reference_id: 'SCF-2026-1004',
    title: 'Ceiling Projector HDMI Input Port Pins Bent and Unusable',
    description: 'The wall interface plate for the EPSON ceiling projector in Lecture Theatre 3A has bent connector pins inside the HDMI socket. Faculty cannot project lecture slides for CS302.',
    category: 'Classroom Equipment',
    priority: 'Medium',
    status: 'Submitted',
    building: 'Main Academic Block',
    block: 'Central Core',
    floor: '3rd Floor',
    room_area: 'Lecture Theatre 3A',
    additional_location: 'Instructor podium media box',
    photo_url: null,
    user_id: 1,
    reporter_name: 'Alex Rivera',
    reporter_email: 'alex.student@campus.edu',
    reporter_phone: '+1 (555) 234-5678',
    reporter_department: 'Computer Science & Engineering',
    assigned_staff_id: null,
    assigned_staff_name: null,
    assigned_staff_dept: null,
    assigned_by_id: null,
    assigned_by_name: null,
    assigned_at: null,
    resolution_notes: null,
    resolved_at: null,
    closed_at: null,
    created_at: '2026-10-25T12:15:00.000Z',
    updated_at: '2026-10-25T12:15:00.000Z'
  },
  {
    id: 5,
    reference_id: 'SCF-2026-1005',
    title: 'Damaged Ergonomic Swivel Chairs With Exposed Metal Edges',
    description: 'Three swivel chairs in the student hostel study room have broken backrests and jagged metal frames that pose a minor cutting hazard. Replacement or repair requested.',
    category: 'Furniture',
    priority: 'Low',
    status: 'Closed',
    building: 'Student Hostel A',
    block: 'Block 1',
    floor: 'Ground Floor',
    room_area: 'Common Study Room A-12',
    additional_location: 'Next to notice board',
    photo_url: null,
    user_id: 1,
    reporter_name: 'Alex Rivera',
    reporter_email: 'alex.student@campus.edu',
    reporter_phone: '+1 (555) 234-5678',
    reporter_department: 'Computer Science & Engineering',
    assigned_staff_id: 3,
    assigned_staff_name: 'Marcus Vance',
    assigned_staff_dept: 'Electrical Maintenance',
    assigned_by_id: 2,
    assigned_by_name: 'Dr. Evelyn Patel',
    assigned_at: '2026-10-21T09:00:00.000Z',
    resolution_notes: 'Replaced three broken chairs with brand new standard campus study chairs from central warehouse stock.',
    resolved_at: '2026-10-22T15:00:00.000Z',
    closed_at: '2026-10-23T10:00:00.000Z',
    created_at: '2026-10-20T16:30:00.000Z',
    updated_at: '2026-10-23T10:00:00.000Z'
  },
  {
    id: 6,
    reference_id: 'SCF-2026-1006',
    title: 'Drinking Water Chiller Unit Not Cooling and Tasting Lukewarm',
    description: 'The stainless steel water cooler on the 1st floor gym corridor compressor is running hot and water dispenser outputs lukewarm water. Needs filter check and refrigerant diagnostics.',
    category: 'Water Supply',
    priority: 'Medium',
    status: 'Submitted',
    building: 'Sports & Gym Complex',
    block: 'East Wing',
    floor: '1st Floor',
    room_area: 'Fitness Center Corridor Fountain',
    additional_location: 'Near locker room 108',
    photo_url: null,
    user_id: 1,
    reporter_name: 'Alex Rivera',
    reporter_email: 'alex.student@campus.edu',
    reporter_phone: '+1 (555) 234-5678',
    reporter_department: 'Computer Science & Engineering',
    assigned_staff_id: null,
    assigned_staff_name: null,
    assigned_staff_dept: null,
    assigned_by_id: null,
    assigned_by_name: null,
    assigned_at: null,
    resolution_notes: null,
    resolved_at: null,
    closed_at: null,
    created_at: '2026-10-25T14:00:00.000Z',
    updated_at: '2026-10-25T14:00:00.000Z'
  },
  {
    id: 7,
    reference_id: 'SCF-2026-1007',
    title: 'Hazardous Slippery Surface on West Emergency Exit Stairwell',
    description: 'Persistent algae and condensation leak from air handler making outdoor emergency staircase treacherous during rain. Two students reported near slips.',
    category: 'Safety',
    priority: 'High',
    status: 'In Progress',
    building: 'Engineering Hall',
    block: 'West Wing',
    floor: 'Ground Floor',
    room_area: 'Emergency Stairwell B',
    additional_location: 'Exterior door egress',
    photo_url: null,
    user_id: 1,
    reporter_name: 'Alex Rivera',
    reporter_email: 'alex.student@campus.edu',
    reporter_phone: '+1 (555) 234-5678',
    reporter_department: 'Computer Science & Engineering',
    assigned_staff_id: 3,
    assigned_staff_name: 'Marcus Vance',
    assigned_staff_dept: 'Electrical Maintenance',
    assigned_by_id: 2,
    assigned_by_name: 'Dr. Evelyn Patel',
    assigned_at: '2026-10-25T08:30:00.000Z',
    resolution_notes: null,
    resolved_at: null,
    closed_at: null,
    created_at: '2026-10-24T17:15:00.000Z',
    updated_at: '2026-10-25T09:10:00.000Z'
  }
];

const INITIAL_TIMELINE = [
  { id: 1, complaint_id: 1, action: 'Submitted', from_status: null, to_status: 'Submitted', actor_id: 1, actor_name: 'Alex Rivera', actor_role: 'student', remarks: 'Initial report submitted by Alex Rivera with urgent electrical hazard priority.', created_at: '2026-10-25T09:30:00.000Z' },
  { id: 2, complaint_id: 1, action: 'Assigned', from_status: 'Submitted', to_status: 'Assigned', actor_id: 2, actor_name: 'Dr. Evelyn Patel', actor_role: 'admin', remarks: 'Assigned to Marcus Vance (Electrical Maintenance). Immediate priority dispatch.', created_at: '2026-10-25T10:15:00.000Z' },
  { id: 3, complaint_id: 1, action: 'Status Updated', from_status: 'Assigned', to_status: 'In Progress', actor_id: 3, actor_name: 'Marcus Vance', actor_role: 'staff', remarks: 'Arrived at site. Isolated breaker circuit B-4. Replacing damaged 32A contactor.', created_at: '2026-10-25T11:00:00.000Z' },
  
  { id: 4, complaint_id: 2, action: 'Submitted', from_status: null, to_status: 'Submitted', actor_id: 1, actor_name: 'Alex Rivera', actor_role: 'student', remarks: 'Urgent plumbing flooding complaint submitted.', created_at: '2026-10-24T13:40:00.000Z' },
  { id: 5, complaint_id: 2, action: 'Assigned', from_status: 'Submitted', to_status: 'Assigned', actor_id: 2, actor_name: 'Dr. Evelyn Patel', actor_role: 'admin', remarks: 'Assigned to Sarah Jenkins (Plumbing).', created_at: '2026-10-24T14:00:00.000Z' },
  { id: 6, complaint_id: 2, action: 'Status Updated', from_status: 'Assigned', to_status: 'In Progress', actor_id: 4, actor_name: 'Sarah Jenkins', actor_role: 'staff', remarks: 'Isolated main building shut-off valve. Drainage underway.', created_at: '2026-10-24T14:20:00.000Z' },
  { id: 7, complaint_id: 2, action: 'Resolved', from_status: 'In Progress', to_status: 'Resolved', actor_id: 4, actor_name: 'Sarah Jenkins', actor_role: 'staff', remarks: 'Brass fitting installed, pressure verified without leaks. Floor sanitized.', created_at: '2026-10-24T16:45:00.000Z' },

  { id: 8, complaint_id: 3, action: 'Submitted', from_status: null, to_status: 'Submitted', actor_id: 1, actor_name: 'Alex Rivera', actor_role: 'student', remarks: 'Wi-Fi connection drop issue reported.', created_at: '2026-10-25T10:50:00.000Z' },
  { id: 9, complaint_id: 3, action: 'Assigned', from_status: 'Submitted', to_status: 'Assigned', actor_id: 2, actor_name: 'Dr. Evelyn Patel', actor_role: 'admin', remarks: 'Assigned to David Kim (IT & Wi-Fi Systems).', created_at: '2026-10-25T11:30:00.000Z' },

  { id: 10, complaint_id: 4, action: 'Submitted', from_status: null, to_status: 'Submitted', actor_id: 1, actor_name: 'Alex Rivera', actor_role: 'student', remarks: 'Issue submitted. Awaiting administrative review and technician dispatch.', created_at: '2026-10-25T12:15:00.000Z' },

  { id: 11, complaint_id: 5, action: 'Submitted', from_status: null, to_status: 'Submitted', actor_id: 1, actor_name: 'Alex Rivera', actor_role: 'student', remarks: 'Furniture repair reported.', created_at: '2026-10-20T16:30:00.000Z' },
  { id: 12, complaint_id: 5, action: 'Assigned', from_status: 'Submitted', to_status: 'Assigned', actor_id: 2, actor_name: 'Dr. Evelyn Patel', actor_role: 'admin', remarks: 'Assigned to facility crew.', created_at: '2026-10-21T09:00:00.000Z' },
  { id: 13, complaint_id: 5, action: 'Resolved', from_status: 'Assigned', to_status: 'Resolved', actor_id: 3, actor_name: 'Marcus Vance', actor_role: 'staff', remarks: 'Chairs replaced from central inventory.', created_at: '2026-10-22T15:00:00.000Z' },
  { id: 14, complaint_id: 5, action: 'Closed', from_status: 'Resolved', to_status: 'Closed', actor_id: 2, actor_name: 'Dr. Evelyn Patel', actor_role: 'admin', remarks: 'Closure confirmed and verified with hostel warden.', created_at: '2026-10-23T10:00:00.000Z' },

  { id: 15, complaint_id: 6, action: 'Submitted', from_status: null, to_status: 'Submitted', actor_id: 1, actor_name: 'Alex Rivera', actor_role: 'student', remarks: 'Water dispenser maintenance reported.', created_at: '2026-10-25T14:00:00.000Z' },

  { id: 16, complaint_id: 7, action: 'Submitted', from_status: null, to_status: 'Submitted', actor_id: 1, actor_name: 'Alex Rivera', actor_role: 'student', remarks: 'Safety hazard flagged.', created_at: '2026-10-24T17:15:00.000Z' },
  { id: 17, complaint_id: 7, action: 'Assigned', from_status: 'Submitted', to_status: 'Assigned', actor_id: 2, actor_name: 'Dr. Evelyn Patel', actor_role: 'admin', remarks: 'Assigned with high safety priority.', created_at: '2026-10-25T08:30:00.000Z' },
  { id: 18, complaint_id: 7, action: 'Status Updated', from_status: 'Assigned', to_status: 'In Progress', actor_id: 3, actor_name: 'Marcus Vance', actor_role: 'staff', remarks: 'Erected hazard caution signage. Pressure washing and anti-slip tread adhesive in progress.', created_at: '2026-10-25T09:10:00.000Z' }
];

const INITIAL_NOTIFICATIONS = [
  { id: 1, user_id: 1, complaint_id: 1, reference_id: 'SCF-2026-1001', title: 'Complaint Status: In Progress', message: 'Marcus Vance is actively working on your electrical panel report [SCF-2026-1001].', type: 'status_change', is_read: 0, created_at: '2026-10-25T11:00:00.000Z' },
  { id: 2, user_id: 1, complaint_id: 2, reference_id: 'SCF-2026-1002', title: 'Complaint Resolved!', message: 'Restroom pipe rupture [SCF-2026-1002] has been repaired and verified by Sarah Jenkins.', type: 'resolution', is_read: 0, created_at: '2026-10-24T16:45:00.000Z' },
  { id: 3, user_id: 1, complaint_id: 3, reference_id: 'SCF-2026-1003', title: 'Staff Assigned to Wi-Fi Issue', message: 'David Kim has been assigned to investigate eduroam connectivity in Library [SCF-2026-1003].', type: 'assignment', is_read: 1, created_at: '2026-10-25T11:30:00.000Z' },
  { id: 4, user_id: 2, complaint_id: 1, reference_id: 'SCF-2026-1001', title: 'Urgent Electrical Issue Reported', message: 'New Urgent report in Science Complex Lab 104 [Ref: SCF-2026-1001].', type: 'alert', is_read: 0, created_at: '2026-10-25T09:30:00.000Z' },
  { id: 5, user_id: 2, complaint_id: 4, reference_id: 'SCF-2026-1004', title: 'New Complaint Pending Review', message: 'Classroom Equipment issue submitted in Lecture Theatre 3A [SCF-2026-1004].', type: 'info', is_read: 0, created_at: '2026-10-25T12:15:00.000Z' },
  { id: 6, user_id: 3, complaint_id: 1, reference_id: 'SCF-2026-1001', title: 'New Urgent Task Assigned', message: 'You have been assigned to SCF-2026-1001: Main Electrical Panel Sparking.', type: 'assignment', is_read: 0, created_at: '2026-10-25T10:15:00.000Z' }
];

function getStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to parse localStorage data:', e);
  }

  // Initialize store
  const fresh = {
    users: INITIAL_USERS,
    complaints: INITIAL_COMPLAINTS,
    timeline: INITIAL_TIMELINE,
    notifications: INITIAL_NOTIFICATIONS
  };
  saveStore(fresh);
  return fresh;
}

function saveStore(store) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

// Current logged in user helper from token
function getCurrentUser(store) {
  const token = localStorage.getItem('scf_token');
  if (!token) return null;
  try {
    // If it's a mock token formatted like "mock_token_USERID_TIMESTAMP"
    if (token.startsWith('mock_token_')) {
      const parts = token.split('_');
      const userId = parseInt(parts[2], 10);
      return store.users.find(u => u.id === userId) || null;
    }
    // If it was a JWT payload, decode base64 payload
    const payloadPart = token.split('.')[1];
    if (payloadPart) {
      const payload = JSON.parse(atob(payloadPart));
      return store.users.find(u => u.id === payload.id || u.email === payload.email) || null;
    }
  } catch (e) {
    console.warn('Token parse error:', e);
  }
  return null;
}

export const localBackend = {
  // US01: Auth Login
  async login({ email, password }) {
    if (!email || !password) {
      const err = new Error('Email and password are required.');
      err.status = 400;
      throw err;
    }

    const store = getStore();
    const cleanEmail = email.toLowerCase().trim();
    const user = store.users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!user || user.password !== password) {
      const err = new Error('Invalid email or password credentials.');
      err.status = 401;
      throw err;
    }

    const token = `mock_token_${user.id}_${Date.now()}`;
    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      phone: user.phone
    };

    return { message: 'Authentication successful', user: safeUser, token };
  },

  // US01: Auth Register
  async register({ name, email, password, role = 'student', department, phone }) {
    if (!name || !email || !password) {
      const err = new Error('Name, email, and password are required fields.');
      err.status = 400;
      throw err;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      const err = new Error('Please provide a valid email address.');
      err.status = 400;
      throw err;
    }

    if (password.length < 6) {
      const err = new Error('Password must be at least 6 characters long.');
      err.status = 400;
      throw err;
    }

    const store = getStore();
    const cleanEmail = email.toLowerCase().trim();
    if (store.users.some(u => u.email.toLowerCase() === cleanEmail)) {
      const err = new Error('An account with this email address already exists.');
      err.status = 409;
      throw err;
    }

    const nextId = store.users.length > 0 ? Math.max(...store.users.map(u => u.id)) + 1 : 1;
    const newUser = {
      id: nextId,
      name: name.trim(),
      email: cleanEmail,
      password,
      role: ['student', 'admin', 'staff'].includes(role) ? role : 'student',
      department: department?.trim() || null,
      phone: phone?.trim() || null,
      specialty: role === 'staff' ? (department || 'General') : null,
      active_tickets_count: 0,
      is_available: 1,
      created_at: new Date().toISOString()
    };

    store.users.push(newUser);
    store.notifications.push({
      id: Date.now(),
      user_id: nextId,
      complaint_id: null,
      reference_id: null,
      title: 'Welcome to Smart Campus Fix!',
      message: 'Your account has been initialized. You can now report campus issues and track their progress live.',
      type: 'info',
      is_read: 0,
      created_at: new Date().toISOString()
    });
    saveStore(store);

    const token = `mock_token_${newUser.id}_${Date.now()}`;
    const safeUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      department: newUser.department,
      phone: newUser.phone
    };

    return { message: 'Account registered successfully', user: safeUser, token };
  },

  // Auth Me
  async getMe() {
    const store = getStore();
    const user = getCurrentUser(store);
    if (!user) {
      const err = new Error('Authentication required.');
      err.status = 401;
      throw err;
    }

    const unreadCount = store.notifications.filter(n => n.user_id === user.id && n.is_read === 0).length;
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        phone: user.phone,
        unreadNotifications: unreadCount
      }
    };
  },

  // Auth Profile
  async updateProfile({ name, department, phone }) {
    const store = getStore();
    const user = getCurrentUser(store);
    if (!user) {
      const err = new Error('Authentication required.');
      err.status = 401;
      throw err;
    }

    user.name = name?.trim() || user.name;
    user.department = department?.trim() || user.department;
    user.phone = phone?.trim() || user.phone;
    saveStore(store);

    return { message: 'Profile updated successfully', user };
  },

  // Demo users
  async getDemoUsers() {
    return {
      message: 'Demo accounts available for testing and evaluation',
      accounts: INITIAL_USERS.slice(0, 4)
    };
  },

  // US07: Get Complaints
  async getComplaints(params = {}) {
    const store = getStore();
    const user = getCurrentUser(store);
    if (!user) {
      const err = new Error('Authentication required.');
      err.status = 401;
      throw err;
    }

    let list = [...store.complaints];

    // Scoping by role
    if (user.role === 'student') {
      list = list.filter(c => c.user_id === user.id);
    } else if (user.role === 'staff') {
      list = list.filter(c => c.assigned_staff_id === user.id);
    }
    // Admin sees all

    // Filtering
    if (params.status && params.status !== 'all') {
      list = list.filter(c => c.status === params.status);
    }
    if (params.category && params.category !== 'all') {
      list = list.filter(c => c.category === params.category);
    }
    if (params.priority && params.priority !== 'all') {
      list = list.filter(c => c.priority === params.priority);
    }
    if (params.building && params.building !== 'all') {
      list = list.filter(c => c.building === params.building);
    }
    if (params.search && params.search.trim()) {
      const term = params.search.toLowerCase().trim();
      list = list.filter(c =>
        c.reference_id.toLowerCase().includes(term) ||
        c.title.toLowerCase().includes(term) ||
        c.description.toLowerCase().includes(term) ||
        c.room_area.toLowerCase().includes(term) ||
        c.building.toLowerCase().includes(term)
      );
    }

    // Sorting
    if (params.sort === 'oldest') {
      list.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    } else if (params.sort === 'priority') {
      const pMap = { Urgent: 1, High: 2, Medium: 3, Low: 4 };
      list.sort((a, b) => (pMap[a.priority] || 5) - (pMap[b.priority] || 5));
    } else {
      list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    return { complaints: list, total: list.length };
  },

  // US07: Get Complaint by ID or Ref
  async getComplaint(idOrRef) {
    const store = getStore();
    const user = getCurrentUser(store);
    if (!user) {
      const err = new Error('Authentication required.');
      err.status = 401;
      throw err;
    }

    const complaint = store.complaints.find(
      c => c.id === parseInt(idOrRef, 10) || c.reference_id === idOrRef
    );

    if (!complaint) {
      const err = new Error('Complaint record not found.');
      err.status = 404;
      throw err;
    }

    // Authorization
    if (user.role === 'student' && complaint.user_id !== user.id) {
      const err = new Error('Access denied. You are not authorized to view this complaint.');
      err.status = 403;
      throw err;
    }

    const timeline = store.timeline
      .filter(t => t.complaint_id === complaint.id)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    return { complaint, timeline };
  },

  // US02, US03, US04, US05, US06: Create Complaint
  async createComplaint(formData) {
    const store = getStore();
    const user = getCurrentUser(store);
    if (!user) {
      const err = new Error('Authentication required.');
      err.status = 401;
      throw err;
    }

    // Extract fields whether from FormData or standard object
    let title, description, category, priority, building, block, floor, room_area, additional_location, photoFile;
    if (formData instanceof FormData) {
      title = formData.get('title');
      description = formData.get('description');
      category = formData.get('category');
      priority = formData.get('priority') || 'Medium';
      building = formData.get('building');
      block = formData.get('block');
      floor = formData.get('floor');
      room_area = formData.get('room_area');
      additional_location = formData.get('additional_location');
      photoFile = formData.get('photo');
    } else {
      ({ title, description, category, priority = 'Medium', building, block, floor, room_area, additional_location } = formData);
    }

    if (!title || !title.trim()) throw new Error('Issue title is required.');
    if (!description || description.trim().length < 15) throw new Error('Detailed description is required (minimum 15 characters).');
    if (!category) throw new Error('Please select an issue category.');
    if (!building) throw new Error('Campus building is required.');
    if (!room_area) throw new Error('Room or specific area is required.');

    const year = new Date().getFullYear();
    const nextComplaintId = store.complaints.length > 0 ? Math.max(...store.complaints.map(c => c.id)) + 1 : 1;
    const reference_id = `SCF-${year}-${1000 + nextComplaintId}`;

    let photo_url = null;
    if (photoFile && typeof photoFile === 'object' && photoFile.name) {
      // In browser demo, we can generate a blob or data URL or mock URL
      photo_url = URL.createObjectURL(photoFile);
    }

    const now = new Date().toISOString();
    const newComplaint = {
      id: nextComplaintId,
      reference_id,
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
      status: 'Submitted',
      building: building.trim(),
      block: block || null,
      floor: floor || null,
      room_area: room_area.trim(),
      additional_location: additional_location?.trim() || null,
      photo_url,
      user_id: user.id,
      reporter_name: user.name,
      reporter_email: user.email,
      reporter_phone: user.phone,
      reporter_department: user.department,
      assigned_staff_id: null,
      assigned_staff_name: null,
      assigned_staff_dept: null,
      assigned_by_id: null,
      assigned_by_name: null,
      assigned_at: null,
      resolution_notes: null,
      resolved_at: null,
      closed_at: null,
      created_at: now,
      updated_at: now
    };

    store.complaints.unshift(newComplaint);

    // Initial audit log
    const nextTimelineId = store.timeline.length > 0 ? Math.max(...store.timeline.map(t => t.id)) + 1 : 1;
    store.timeline.push({
      id: nextTimelineId,
      complaint_id: nextComplaintId,
      action: 'Submitted',
      from_status: null,
      to_status: 'Submitted',
      actor_id: user.id,
      actor_name: user.name,
      actor_role: user.role,
      remarks: `Report submitted by ${user.name} (${user.role}). Initial status: Submitted.`,
      created_at: now
    });

    // Notify user
    const nextNotifId = store.notifications.length > 0 ? Math.max(...store.notifications.map(n => n.id)) + 1 : 1;
    store.notifications.push({
      id: nextNotifId,
      user_id: user.id,
      complaint_id: nextComplaintId,
      reference_id,
      title: 'Complaint Submitted Successfully',
      message: `Your complaint "${title.trim()}" has been received with Ref ID: ${reference_id}. Our facility team is reviewing it.`,
      type: 'info',
      is_read: 0,
      created_at: now
    });

    // Notify admins
    const admins = store.users.filter(u => u.role === 'admin');
    for (const a of admins) {
      store.notifications.push({
        id: nextNotifId + a.id,
        user_id: a.id,
        complaint_id: nextComplaintId,
        reference_id,
        title: 'New Campus Issue Reported',
        message: `New [${priority}] issue in ${building.trim()} (${room_area.trim()}): "${title.trim()}" [Ref: ${reference_id}].`,
        type: 'alert',
        is_read: 0,
        created_at: now
      });
    }

    saveStore(store);
    return { message: 'Complaint submitted successfully.', complaint: newComplaint, reference_id };
  },

  // AI Duplicate Check
  async checkDuplicate({ building, room_area }) {
    if (!building || !room_area) return { hasDuplicates: false, duplicates: [] };
    const store = getStore();
    const bTerm = building.toLowerCase().trim();
    const rTerm = room_area.toLowerCase().trim();

    const matches = store.complaints.filter(c =>
      !['Closed', 'Resolved'].includes(c.status) &&
      c.building.toLowerCase() === bTerm &&
      (c.room_area.toLowerCase() === rTerm || c.room_area.toLowerCase().includes(rTerm))
    ).slice(0, 3);

    return { hasDuplicates: matches.length > 0, duplicates: matches };
  },

  // US09: Assign Complaint
  async assignComplaint(id, { staff_id, remarks }) {
    const store = getStore();
    const user = getCurrentUser(store);
    if (!user || user.role !== 'admin') {
      const err = new Error('Access denied. Administrator clearance required.');
      err.status = 403;
      throw err;
    }

    const complaint = store.complaints.find(c => c.id === parseInt(id, 10));
    if (!complaint) throw new Error('Complaint not found.');

    const staff = store.users.find(u => u.id === parseInt(staff_id, 10) && u.role === 'staff');
    if (!staff) throw new Error('Selected user is not an active maintenance staff member.');

    const prevStatus = complaint.status;
    const now = new Date().toISOString();

    complaint.assigned_staff_id = staff.id;
    complaint.assigned_staff_name = staff.name;
    complaint.assigned_staff_dept = staff.department;
    complaint.assigned_staff_email = staff.email;
    complaint.assigned_staff_phone = staff.phone;
    complaint.assigned_by_id = user.id;
    complaint.assigned_by_name = user.name;
    complaint.assigned_at = now;
    complaint.status = 'Assigned';
    complaint.updated_at = now;

    const nextTimelineId = store.timeline.length > 0 ? Math.max(...store.timeline.map(t => t.id)) + 1 : 1;
    store.timeline.push({
      id: nextTimelineId,
      complaint_id: complaint.id,
      action: 'Assigned',
      from_status: prevStatus,
      to_status: 'Assigned',
      actor_id: user.id,
      actor_name: user.name,
      actor_role: 'admin',
      remarks: remarks?.trim() ? `Assigned to ${staff.name} (${staff.department}). Admin Notes: ${remarks.trim()}` : `Assigned to ${staff.name} (${staff.department}) by Admin ${user.name}.`,
      created_at: now
    });

    // Notify staff
    store.notifications.push({
      id: Date.now() + 1,
      user_id: staff.id,
      complaint_id: complaint.id,
      reference_id: complaint.reference_id,
      title: 'New Task Assigned',
      message: `You have been assigned to issue "${complaint.title}" at ${complaint.building} [Ref: ${complaint.reference_id}].`,
      type: 'assignment',
      is_read: 0,
      created_at: now
    });

    // Notify reporter
    store.notifications.push({
      id: Date.now() + 2,
      user_id: complaint.user_id,
      complaint_id: complaint.id,
      reference_id: complaint.reference_id,
      title: 'Staff Assigned to Your Issue',
      message: `Your complaint [${complaint.reference_id}] has been assigned to ${staff.name} from ${staff.department}.`,
      type: 'status_change',
      is_read: 0,
      created_at: now
    });

    saveStore(store);
    return { message: 'Complaint assigned successfully.', complaint };
  },

  // US10: Update Status
  async updateStatus(id, { status, remarks }) {
    const store = getStore();
    const user = getCurrentUser(store);
    if (!user || !['staff', 'admin'].includes(user.role)) {
      const err = new Error('Access denied.');
      err.status = 403;
      throw err;
    }

    const complaint = store.complaints.find(c => c.id === parseInt(id, 10));
    if (!complaint) throw new Error('Complaint not found.');

    const prevStatus = complaint.status;
    const now = new Date().toISOString();

    complaint.status = status;
    complaint.updated_at = now;

    const nextTimelineId = store.timeline.length > 0 ? Math.max(...store.timeline.map(t => t.id)) + 1 : 1;
    store.timeline.push({
      id: nextTimelineId,
      complaint_id: complaint.id,
      action: 'Status Updated',
      from_status: prevStatus,
      to_status: status,
      actor_id: user.id,
      actor_name: user.name,
      actor_role: user.role,
      remarks: remarks?.trim() || `Status transitioned from ${prevStatus} to ${status}.`,
      created_at: now
    });

    // Notify reporter
    store.notifications.push({
      id: Date.now(),
      user_id: complaint.user_id,
      complaint_id: complaint.id,
      reference_id: complaint.reference_id,
      title: 'Complaint Progress Update',
      message: `Your complaint [${complaint.reference_id}] status is now: ${status}. Notes: ${remarks || 'Work ongoing'}`,
      type: 'status_change',
      is_read: 0,
      created_at: now
    });

    saveStore(store);
    return { message: 'Complaint status updated.', complaint };
  },

  // US11: Resolve Complaint
  async resolveComplaint(id, { resolution_notes }) {
    if (!resolution_notes || resolution_notes.trim().length < 10) {
      throw new Error('Resolution notes are required (minimum 10 characters).');
    }

    const store = getStore();
    const user = getCurrentUser(store);
    if (!user || !['staff', 'admin'].includes(user.role)) {
      const err = new Error('Access denied.');
      err.status = 403;
      throw err;
    }

    const complaint = store.complaints.find(c => c.id === parseInt(id, 10));
    if (!complaint) throw new Error('Complaint not found.');

    const prevStatus = complaint.status;
    const now = new Date().toISOString();

    complaint.status = 'Resolved';
    complaint.resolution_notes = resolution_notes.trim();
    complaint.resolved_at = now;
    complaint.updated_at = now;

    const nextTimelineId = store.timeline.length > 0 ? Math.max(...store.timeline.map(t => t.id)) + 1 : 1;
    store.timeline.push({
      id: nextTimelineId,
      complaint_id: complaint.id,
      action: 'Resolved',
      from_status: prevStatus,
      to_status: 'Resolved',
      actor_id: user.id,
      actor_name: user.name,
      actor_role: user.role,
      remarks: `Work Completed: ${resolution_notes.trim()}`,
      created_at: now
    });

    // Notify reporter
    store.notifications.push({
      id: Date.now(),
      user_id: complaint.user_id,
      complaint_id: complaint.id,
      reference_id: complaint.reference_id,
      title: 'Complaint Resolved!',
      message: `Your complaint [${complaint.reference_id}] has been marked as Resolved. Resolution: "${resolution_notes.trim()}".`,
      type: 'resolution',
      is_read: 0,
      created_at: now
    });

    saveStore(store);
    return { message: 'Complaint resolved successfully.', complaint };
  },

  // US11: Close Complaint
  async closeComplaint(id, { closure_remarks }) {
    const store = getStore();
    const user = getCurrentUser(store);
    if (!user) throw new Error('Authentication required.');

    const complaint = store.complaints.find(c => c.id === parseInt(id, 10));
    if (!complaint) throw new Error('Complaint not found.');

    if (user.role !== 'admin' && complaint.user_id !== user.id) {
      throw new Error('Only the administrator or the original reporter can close this complaint.');
    }

    const prevStatus = complaint.status;
    const now = new Date().toISOString();

    complaint.status = 'Closed';
    complaint.closed_at = now;
    complaint.updated_at = now;

    const nextTimelineId = store.timeline.length > 0 ? Math.max(...store.timeline.map(t => t.id)) + 1 : 1;
    store.timeline.push({
      id: nextTimelineId,
      complaint_id: complaint.id,
      action: 'Closed',
      from_status: prevStatus,
      to_status: 'Closed',
      actor_id: user.id,
      actor_name: user.name,
      actor_role: user.role,
      remarks: closure_remarks?.trim() || `Complaint officially closed by ${user.name} (${user.role}).`,
      created_at: now
    });

    saveStore(store);
    return { message: 'Complaint closed successfully.', complaint };
  },

  // Reopen Complaint
  async reopenComplaint(id, { reason }) {
    if (!reason || reason.trim().length < 10) {
      throw new Error('Please provide a clear reason for reopening (minimum 10 characters).');
    }

    const store = getStore();
    const user = getCurrentUser(store);
    if (!user) throw new Error('Authentication required.');

    const complaint = store.complaints.find(c => c.id === parseInt(id, 10));
    if (!complaint) throw new Error('Complaint not found.');

    const prevStatus = complaint.status;
    const now = new Date().toISOString();

    complaint.status = 'Reopened';
    complaint.reopened_at = now;
    complaint.updated_at = now;

    const nextTimelineId = store.timeline.length > 0 ? Math.max(...store.timeline.map(t => t.id)) + 1 : 1;
    store.timeline.push({
      id: nextTimelineId,
      complaint_id: complaint.id,
      action: 'Reopened',
      from_status: prevStatus,
      to_status: 'Reopened',
      actor_id: user.id,
      actor_name: user.name,
      actor_role: user.role,
      remarks: `Complaint reopened by ${user.name}. Reason: ${reason.trim()}`,
      created_at: now
    });

    saveStore(store);
    return { message: 'Complaint reopened for review.', complaint };
  },

  // US06: Update Priority
  async updatePriority(id, { priority }) {
    const store = getStore();
    const user = getCurrentUser(store);
    if (!user || user.role !== 'admin') throw new Error('Administrator clearance required.');

    const complaint = store.complaints.find(c => c.id === parseInt(id, 10));
    if (!complaint) throw new Error('Complaint not found.');

    const prevPriority = complaint.priority;
    complaint.priority = priority;
    complaint.updated_at = new Date().toISOString();

    const nextTimelineId = store.timeline.length > 0 ? Math.max(...store.timeline.map(t => t.id)) + 1 : 1;
    store.timeline.push({
      id: nextTimelineId,
      complaint_id: complaint.id,
      action: 'Priority Changed',
      from_status: complaint.status,
      to_status: complaint.status,
      actor_id: user.id,
      actor_name: user.name,
      actor_role: 'admin',
      remarks: `Priority adjusted from ${prevPriority} to ${priority} by Administrator.`,
      created_at: new Date().toISOString()
    });

    saveStore(store);
    return { message: 'Priority updated successfully.', complaint };
  },

  // US09: Get Staff List
  async getStaff() {
    const store = getStore();
    const staffList = store.users.filter(u => u.role === 'staff').map(s => {
      const activeCount = store.complaints.filter(c => c.assigned_staff_id === s.id && !['Closed', 'Resolved'].includes(c.status)).length;
      return {
        id: s.id,
        name: s.name,
        email: s.email,
        department: s.department,
        specialty: s.specialty || s.department,
        phone: s.phone,
        active_tickets_count: activeCount,
        is_available: s.is_available ?? 1
      };
    });

    return { staff: staffList };
  },

  // Staff Availability Toggle
  async updateAvailability(isAvailable) {
    const store = getStore();
    const user = getCurrentUser(store);
    if (!user || user.role !== 'staff') throw new Error('Staff clearance required.');

    user.is_available = isAvailable ? 1 : 0;
    saveStore(store);
    return { message: 'Availability status updated', is_available: !!isAvailable };
  },

  // US13: Get Notifications
  async getNotifications() {
    const store = getStore();
    const user = getCurrentUser(store);
    if (!user) throw new Error('Authentication required.');

    const userNotifs = store.notifications
      .filter(n => n.user_id === user.id)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const unreadCount = userNotifs.filter(n => n.is_read === 0).length;
    return { notifications: userNotifs, unreadCount };
  },

  // Mark Read
  async markNotificationRead(id) {
    const store = getStore();
    const user = getCurrentUser(store);
    const n = store.notifications.find(item => item.id === parseInt(id, 10) && item.user_id === user?.id);
    if (n) {
      n.is_read = 1;
      saveStore(store);
    }
    return { message: 'Notification marked as read.' };
  },

  // Mark All Read
  async markAllNotificationsRead() {
    const store = getStore();
    const user = getCurrentUser(store);
    store.notifications.forEach(n => {
      if (n.user_id === user?.id) n.is_read = 1;
    });
    saveStore(store);
    return { message: 'All notifications marked as read.' };
  },

  // US08: Admin Stats
  async getAdminStats() {
    const store = getStore();
    const c = store.complaints;
    const total = c.length;
    const pending = c.filter(item => item.status === 'Submitted').length;
    const assigned = c.filter(item => item.status === 'Assigned').length;
    const in_progress = c.filter(item => item.status === 'In Progress').length;
    const resolved = c.filter(item => item.status === 'Resolved').length;
    const closed = c.filter(item => item.status === 'Closed').length;
    const urgent = c.filter(item => item.priority === 'Urgent' && !['Resolved', 'Closed'].includes(item.status)).length;

    // Categories
    const catMap = {};
    c.forEach(item => { catMap[item.category] = (catMap[item.category] || 0) + 1; });
    const categoryCounts = Object.entries(catMap).map(([category, count]) => ({ category, count }));

    // Buildings
    const bMap = {};
    c.forEach(item => { bMap[item.building] = (bMap[item.building] || 0) + 1; });
    const buildingCounts = Object.entries(bMap).map(([building, count]) => ({ building, count }));

    // Staff Workload
    const staffWorkload = store.users.filter(u => u.role === 'staff').map(s => {
      const active = c.filter(item => item.assigned_staff_id === s.id && !['Resolved', 'Closed'].includes(item.status)).length;
      return {
        id: s.id,
        name: s.name,
        department: s.department,
        specialty: s.specialty || s.department,
        active_tickets_count: active,
        is_available: s.is_available ?? 1
      };
    });

    const recentActivity = store.timeline.slice(-8).reverse();

    return {
      summary: {
        total,
        pending,
        assigned,
        in_progress,
        resolved,
        closed,
        urgent,
        completedCount: resolved + closed,
        resolutionRate: total > 0 ? Math.round(((resolved + closed) / total) * 100) : 0
      },
      categoryCounts,
      buildingCounts,
      staffWorkload,
      recentActivity
    };
  },

  // Staff Stats
  async getStaffStats() {
    const store = getStore();
    const user = getCurrentUser(store);
    const myTickets = store.complaints.filter(c => c.assigned_staff_id === user?.id);

    return {
      assignedCount: myTickets.filter(c => c.status === 'Assigned').length,
      inProgressCount: myTickets.filter(c => c.status === 'In Progress').length,
      resolvedCount: myTickets.filter(c => ['Resolved', 'Closed'].includes(c.status)).length,
      urgentCount: myTickets.filter(c => c.priority === 'Urgent' && !['Resolved', 'Closed'].includes(c.status)).length,
      totalActive: myTickets.filter(c => !['Resolved', 'Closed'].includes(c.status)).length
    };
  },

  // Student Stats
  async getStudentStats() {
    const store = getStore();
    const user = getCurrentUser(store);
    const myTickets = store.complaints.filter(c => c.user_id === user?.id);

    return {
      totalReports: myTickets.length,
      activeReports: myTickets.filter(c => !['Resolved', 'Closed'].includes(c.status)).length,
      resolvedReports: myTickets.filter(c => ['Resolved', 'Closed'].includes(c.status)).length
    };
  },

  // AI Smart Triage Heuristic
  async aiTriage({ title = '', description = '' }) {
    const combined = `${title} ${description}`.toLowerCase();

    const CATEGORY_KEYWORDS = {
      'Electrical': ['spark', 'shock', 'wire', 'cable', 'breaker', 'fuse', 'light', 'flicker', 'outlet', 'socket', 'switch', 'power', 'blackout', 'generator', 'bulb'],
      'Plumbing': ['leak', 'pipe', 'clog', 'sink', 'toilet', 'flush', 'drain', 'overflow', 'faucet', 'sewage', 'drip', 'restroom', 'bathroom'],
      'Water Supply': ['water filter', 'drinking water', 'tap dry', 'no water', 'water cooler', 'water pressure', 'muddy water'],
      'Internet/Wi-Fi': ['wifi', 'wi-fi', 'router', 'network', 'ethernet', 'disconnect', 'slow internet', 'ip address', 'lan', 'connection', 'signal', 'access point'],
      'Classroom Equipment': ['projector', 'smartboard', 'mic', 'microphone', 'speaker', 'podium', 'hdmi', 'screen', 'audio', 'visual', 'av', 'camera', 'display'],
      'Furniture': ['chair', 'desk', 'bench', 'table', 'whiteboard', 'door handle', 'hinge', 'cabinet', 'lock', 'window latch', 'blind', 'podium broken'],
      'Cleaning': ['trash', 'garbage', 'dirty', 'dust', 'spill', 'stain', 'mess', 'smell', 'odor', 'pest', 'cockroach', 'insects', 'litter'],
      'Safety': ['fire', 'extinguisher', 'smoke', 'exit door', 'hazard', 'slippery', 'glass broken', 'stairs', 'railing', 'emergency', 'gas leak', 'danger']
    };

    let bestCategory = 'Other';
    let maxMatches = 0;
    const tags = [];

    for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      let count = 0;
      for (const kw of keywords) {
        if (combined.includes(kw)) {
          count++;
          if (!tags.includes(`#${cat.replace(/[^a-zA-Z]/g, '')}`)) {
            tags.push(`#${cat.replace(/[^a-zA-Z]/g, '')}`);
          }
        }
      }
      if (count > maxMatches) {
        maxMatches = count;
        bestCategory = cat;
      }
    }

    const urgentTriggers = ['fire', 'gas leak', 'sparking', 'electric shock', 'flooding', 'smoke', 'collapse', 'open wire', 'danger', 'emergency', 'hazard'];
    const highTriggers = ['no power', 'broken glass', 'blackout', 'toilet overflow', 'projector dead', 'exam hall', 'lab offline', 'water shutdown', 'slippery stairs'];
    const lowTriggers = ['paint chip', 'scratched desk', 'bulletin board', 'cosmetic', 'minor stain', 'sign missing'];

    let priority = 'Medium';
    let reasoning = `Pattern matched ${maxMatches} facility indicators.`;

    for (const kw of urgentTriggers) {
      if (combined.includes(kw)) {
        priority = 'Urgent';
        reasoning = `Triggered urgent hazard keyword: "${kw}"`;
        break;
      }
    }

    if (priority !== 'Urgent') {
      for (const kw of highTriggers) {
        if (combined.includes(kw)) {
          priority = 'High';
          reasoning = `High impact detected on campus operations: "${kw}"`;
          break;
        }
      }
    }

    if (priority === 'Medium') {
      for (const kw of lowTriggers) {
        if (combined.includes(kw)) {
          priority = 'Low';
          break;
        }
      }
    }

    const confidence = Math.min(98, Math.max(68, 65 + maxMatches * 10 + (priority === 'Urgent' ? 15 : 5)));
    const etaMap = { Urgent: 2, High: 6, Medium: 24, Low: 48 };

    return {
      suggestedCategory: bestCategory,
      suggestedPriority: priority,
      confidenceScore: confidence,
      estimatedResolutionHours: etaMap[priority] || 24,
      suggestedDepartment: `${bestCategory} Maintenance Division`,
      reasoning,
      tags: tags.slice(0, 4)
    };
  }
};
