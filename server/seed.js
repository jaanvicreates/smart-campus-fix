import bcrypt from 'bcryptjs';
import { db, initDatabase } from './db.js';

export function seed() {
  console.log('🌱 Seeding Smart Campus Fix database...');
  initDatabase();

  // Clear existing data for clean idempotent re-seed
  db.exec(`
    DELETE FROM notifications;
    DELETE FROM complaint_history;
    DELETE FROM complaints;
    DELETE FROM staff_profiles;
    DELETE FROM users;
  `);

  const salt = bcrypt.genSaltSync(10);
  const studentPw = bcrypt.hashSync('Student123!', salt);
  const adminPw = bcrypt.hashSync('Admin123!', salt);
  const staffPw = bcrypt.hashSync('Staff123!', salt);

  // 1. Insert Users
  const insertUser = db.prepare(`
    INSERT INTO users (name, email, password, role, department, phone)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const studentResult = insertUser.run(
    'Alex Rivera',
    'alex.student@campus.edu',
    studentPw,
    'student',
    'Computer Science & Engineering',
    '+1 (555) 234-5678'
  );
  const studentId = Number(studentResult.lastInsertRowid);

  const adminResult = insertUser.run(
    'Dr. Evelyn Patel',
    'dr.patel@campus.edu',
    adminPw,
    'admin',
    'Facilities & Campus Infrastructure',
    '+1 (555) 876-5432'
  );
  const adminId = Number(adminResult.lastInsertRowid);

  const staff1Result = insertUser.run(
    'Marcus Vance',
    'marcus.elec@campus.edu',
    staffPw,
    'staff',
    'Electrical Maintenance',
    '+1 (555) 432-1098'
  );
  const staff1Id = Number(staff1Result.lastInsertRowid);

  const staff2Result = insertUser.run(
    'Sarah Jenkins',
    'sarah.plumb@campus.edu',
    staffPw,
    'staff',
    'Plumbing & Hydraulics',
    '+1 (555) 654-3210'
  );
  const staff2Id = Number(staff2Result.lastInsertRowid);

  const staff3Result = insertUser.run(
    'David Kim',
    'david.tech@campus.edu',
    staffPw,
    'staff',
    'Campus IT & Wi-Fi Systems',
    '+1 (555) 321-9876'
  );
  const staff3Id = Number(staff3Result.lastInsertRowid);

  // 2. Insert Staff Profiles
  const insertStaffProfile = db.prepare(`
    INSERT INTO staff_profiles (user_id, specialty, active_tickets_count, is_available)
    VALUES (?, ?, ?, ?)
  `);

  insertStaffProfile.run(staff1Id, 'Electrical', 2, 1);
  insertStaffProfile.run(staff2Id, 'Plumbing', 1, 1);
  insertStaffProfile.run(staff3Id, 'Internet/Wi-Fi', 1, 1);

  // 3. Seed Realistic Complaints
  const insertComplaint = db.prepare(`
    INSERT INTO complaints (
      reference_id, title, description, category, priority, status,
      building, block, floor, room_area, additional_location,
      user_id, assigned_staff_id, assigned_by_id, assigned_at,
      resolution_notes, resolved_at, closed_at, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertHistory = db.prepare(`
    INSERT INTO complaint_history (
      complaint_id, action, from_status, to_status, actor_id, actor_name, actor_role, remarks, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertNotification = db.prepare(`
    INSERT INTO notifications (user_id, complaint_id, title, message, type, is_read, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  // Complaint 1: Electrical Sparking (Urgent, In Progress)
  const c1 = insertComplaint.run(
    'SCF-2026-1001',
    'Main Electrical Distribution Board Sparking & Tripping',
    'Audible crackling and visible sparks observed from the secondary breaker in Computer Lab 104. Circuit breaker tripped twice during afternoon laboratory session. Needs immediate safety inspection before student practical exams.',
    'Electrical',
    'Urgent',
    'In Progress',
    'Science Complex',
    'Block B',
    '1st Floor',
    'Lab 104 (Robotics Lab)',
    'Adjacent to North emergency exit corridor',
    studentId,
    staff1Id,
    adminId,
    '2026-10-25 10:15:00',
    null,
    null,
    null,
    '2026-10-25 09:30:00',
    '2026-10-25 11:00:00'
  );
  const c1Id = Number(c1.lastInsertRowid);

  insertHistory.run(c1Id, 'Submitted', null, 'Submitted', studentId, 'Alex Rivera', 'student', 'Initial report submitted by Alex Rivera with urgent electrical hazard priority.', '2026-10-25 09:30:00');
  insertHistory.run(c1Id, 'Assigned', 'Submitted', 'Assigned', adminId, 'Dr. Evelyn Patel', 'admin', 'Assigned to Marcus Vance (Electrical Maintenance). Immediate priority dispatch.', '2026-10-25 10:15:00');
  insertHistory.run(c1Id, 'Status Updated', 'Assigned', 'In Progress', staff1Id, 'Marcus Vance', 'staff', 'Arrived at site. Isolated breaker circuit B-4. Replacing damaged 32A contactor.', '2026-10-25 11:00:00');

  // Complaint 2: Restroom Pipe Burst (Resolved)
  const c2 = insertComplaint.run(
    'SCF-2026-1002',
    'Restroom Water Supply Pipe Joint Ruptured & Flooding',
    'High pressure waterline joint under the second handwash basin sheared off, causing significant water accumulation across the entrance lobby. Water is actively spreading towards corridor carpet.',
    'Plumbing',
    'Urgent',
    'Resolved',
    'Engineering Hall',
    'Block C',
    'Ground Floor',
    'Restroom C-02 (West Lobby)',
    'Behind main staircase landing',
    studentId,
    staff2Id,
    adminId,
    '2026-10-24 14:00:00',
    'Shut down main branch valve 2B. Replaced cracked PVC union joint with reinforced brass fitting, tested under 6 bar operational pressure. Mopping and drying completed.',
    '2026-10-24 16:45:00',
    null,
    '2026-10-24 13:40:00',
    '2026-10-24 16:45:00'
  );
  const c2Id = Number(c2.lastInsertRowid);

  insertHistory.run(c2Id, 'Submitted', null, 'Submitted', studentId, 'Alex Rivera', 'student', 'Urgent plumbing flooding complaint submitted.', '2026-10-24 13:40:00');
  insertHistory.run(c2Id, 'Assigned', 'Submitted', 'Assigned', adminId, 'Dr. Evelyn Patel', 'admin', 'Assigned to Sarah Jenkins (Plumbing).', '2026-10-24 14:00:00');
  insertHistory.run(c2Id, 'Status Updated', 'Assigned', 'In Progress', staff2Id, 'Sarah Jenkins', 'staff', 'Isolated main building shut-off valve. Drainage underway.', '2026-10-24 14:20:00');
  insertHistory.run(c2Id, 'Resolved', 'In Progress', 'Resolved', staff2Id, 'Sarah Jenkins', 'staff', 'Brass fitting installed, pressure verified without leaks. Floor sanitized.', '2026-10-24 16:45:00');

  // Complaint 3: Wi-Fi Access Point Offline (Assigned)
  const c3 = insertComplaint.run(
    'SCF-2026-1003',
    'Enterprise Wi-Fi AP-04 Dropping Connections Continuously',
    'Students in the Quiet Study Hall cannot authenticate to the campus eduroam / CampusNet SSID. Signal strength fluctuates constantly and IP allocation times out with DHCP error.',
    'Internet/Wi-Fi',
    'High',
    'Assigned',
    'Central Library',
    'North Wing',
    '2nd Floor',
    'Quiet Study Hall Zone D',
    'Near reference collection shelves 12-18',
    studentId,
    staff3Id,
    adminId,
    '2026-10-25 11:30:00',
    null,
    null,
    null,
    '2026-10-25 10:50:00',
    '2026-10-25 11:30:00'
  );
  const c3Id = Number(c3.lastInsertRowid);
  insertHistory.run(c3Id, 'Submitted', null, 'Submitted', studentId, 'Alex Rivera', 'student', 'Wi-Fi connection drop issue reported.', '2026-10-25 10:50:00');
  insertHistory.run(c3Id, 'Assigned', 'Submitted', 'Assigned', adminId, 'Dr. Evelyn Patel', 'admin', 'Assigned to David Kim (IT & Wi-Fi Systems).', '2026-10-25 11:30:00');

  // Complaint 4: Ceiling Projector HDMI Port Damaged (Submitted, Pending Admin Review)
  const c4 = insertComplaint.run(
    'SCF-2026-1004',
    'Ceiling Projector HDMI Input Port Pins Bent and Unusable',
    'The wall interface plate for the EPSON ceiling projector in Lecture Theatre 3A has bent connector pins inside the HDMI socket. Faculty cannot project lecture slides for CS302.',
    'Classroom Equipment',
    'Medium',
    'Submitted',
    'Main Academic Block',
    'Central Core',
    '3rd Floor',
    'Lecture Theatre 3A',
    'Instructor podium media box',
    studentId,
    null,
    null,
    null,
    null,
    null,
    null,
    '2026-10-25 12:15:00',
    '2026-10-25 12:15:00'
  );
  const c4Id = Number(c4.lastInsertRowid);
  insertHistory.run(c4Id, 'Submitted', null, 'Submitted', studentId, 'Alex Rivera', 'student', 'Issue submitted. Awaiting administrative review and technician dispatch.', '2026-10-25 12:15:00');

  // Complaint 5: Broken Ergonomic Chairs (Closed)
  const c5 = insertComplaint.run(
    'SCF-2026-1005',
    'Damaged Ergonomic Swivel Chairs With Exposed Metal Edges',
    'Three swivel chairs in the student hostel study room have broken backrests and jagged metal frames that pose a minor cutting hazard. Replacement or repair requested.',
    'Furniture',
    'Low',
    'Closed',
    'Student Hostel A',
    'Block 1',
    'Ground Floor',
    'Common Study Room A-12',
    'Next to notice board',
    studentId,
    staff1Id,
    adminId,
    '2026-10-21 09:00:00',
    'Replaced three broken chairs with brand new standard campus study chairs from central warehouse stock.',
    '2026-10-22 15:00:00',
    '2026-10-23 10:00:00',
    '2026-10-20 16:30:00',
    '2026-10-23 10:00:00'
  );
  const c5Id = Number(c5.lastInsertRowid);
  insertHistory.run(c5Id, 'Submitted', null, 'Submitted', studentId, 'Alex Rivera', 'student', 'Furniture repair reported.', '2026-10-20 16:30:00');
  insertHistory.run(c5Id, 'Assigned', 'Submitted', 'Assigned', adminId, 'Dr. Evelyn Patel', 'admin', 'Assigned to facility crew.', '2026-10-21 09:00:00');
  insertHistory.run(c5Id, 'Resolved', 'Assigned', 'Resolved', staff1Id, 'Marcus Vance', 'staff', 'Chairs replaced from central inventory.', '2026-10-22 15:00:00');
  insertHistory.run(c5Id, 'Closed', 'Resolved', 'Closed', adminId, 'Dr. Evelyn Patel', 'admin', 'Closure confirmed and verified with hostel warden.', '2026-10-23 10:00:00');

  // Complaint 6: Drinking Water Chiller Unit (Submitted)
  const c6 = insertComplaint.run(
    'SCF-2026-1006',
    'Drinking Water Chiller Unit Not Cooling and Tasting Lukewarm',
    'The stainless steel water cooler on the 1st floor gym corridor compressor is running hot and water dispenser outputs lukewarm water. Needs filter check and refrigerant diagnostics.',
    'Water Supply',
    'Medium',
    'Submitted',
    'Sports & Gym Complex',
    'East Wing',
    '1st Floor',
    'Fitness Center Corridor Fountain',
    'Near locker room 108',
    studentId,
    null,
    null,
    null,
    null,
    null,
    null,
    '2026-10-25 14:00:00',
    '2026-10-25 14:00:00'
  );
  const c6Id = Number(c6.lastInsertRowid);
  insertHistory.run(c6Id, 'Submitted', null, 'Submitted', studentId, 'Alex Rivera', 'student', 'Water dispenser maintenance reported.', '2026-10-25 14:00:00');

  // Complaint 7: Slippery Steps (In Progress)
  const c7 = insertComplaint.run(
    'SCF-2026-1007',
    'Hazardous Slippery Surface on West Emergency Exit Stairwell',
    'Persistent algae and condensation leak from air handler making outdoor emergency staircase treacherous during rain. Two students reported near slips.',
    'Safety',
    'High',
    'In Progress',
    'Engineering Hall',
    'West Wing',
    'Ground Floor',
    'Emergency Stairwell B',
    'Exterior door egress',
    studentId,
    staff1Id,
    adminId,
    '2026-10-25 08:30:00',
    null,
    null,
    null,
    '2026-10-24 17:15:00',
    '2026-10-25 09:10:00'
  );
  const c7Id = Number(c7.lastInsertRowid);
  insertHistory.run(c7Id, 'Submitted', null, 'Submitted', studentId, 'Alex Rivera', 'student', 'Safety hazard flagged.', '2026-10-24 17:15:00');
  insertHistory.run(c7Id, 'Assigned', 'Submitted', 'Assigned', adminId, 'Dr. Evelyn Patel', 'admin', 'Assigned with high safety priority.', '2026-10-25 08:30:00');
  insertHistory.run(c7Id, 'Status Updated', 'Assigned', 'In Progress', staff1Id, 'Marcus Vance', 'staff', 'Erected hazard caution signage. Pressure washing and anti-slip tread adhesive in progress.', '2026-10-25 09:10:00');

  // Notifications
  insertNotification.run(studentId, c1Id, 'Complaint Status: In Progress', 'Marcus Vance is actively working on your electrical panel report [SCF-2026-1001].', 'status_change', 0, '2026-10-25 11:00:00');
  insertNotification.run(studentId, c2Id, 'Complaint Resolved!', 'Restroom pipe rupture [SCF-2026-1002] has been repaired and verified by Sarah Jenkins.', 'resolution', 0, '2026-10-24 16:45:00');
  insertNotification.run(studentId, c3Id, 'Staff Assigned to Wi-Fi Issue', 'David Kim has been assigned to investigate eduroam connectivity in Library [SCF-2026-1003].', 'assignment', 1, '2026-10-25 11:30:00');
  insertNotification.run(adminId, c1Id, 'Urgent Electrical Issue Reported', 'New Urgent report in Science Complex Lab 104 [Ref: SCF-2026-1001].', 'alert', 0, '2026-10-25 09:30:00');
  insertNotification.run(adminId, c4Id, 'New Complaint Pending Review', 'Classroom Equipment issue submitted in Lecture Theatre 3A [SCF-2026-1004].', 'info', 0, '2026-10-25 12:15:00');
  insertNotification.run(staff1Id, c1Id, 'New Urgent Task Assigned', 'You have been assigned to SCF-2026-1001: Main Electrical Panel Sparking.', 'assignment', 0, '2026-10-25 10:15:00');

  console.log('✅ Seed completed successfully: 5 users, 3 staff profiles, 7 detailed campus complaints, complete audit timelines and notifications.');
}

if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seed();
}
