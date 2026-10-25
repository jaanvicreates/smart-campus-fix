import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { db } from '../db.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Multer storage for complaint photo uploads
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `complaint-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp|gif/;
  const extValid = allowed.test(path.extname(file.originalname).toLowerCase());
  const mimeValid = allowed.test(file.mimetype);
  if (extValid && mimeValid) {
    cb(null, true);
  } else {
    cb(new Error('Only valid image files (JPG, PNG, WEBP, GIF) under 5MB are allowed.'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter
});

// Helper to generate reference ID: SCF-2026-XXXX
function generateReferenceId() {
  const year = new Date().getFullYear();
  const lastComplaint = db.prepare('SELECT id FROM complaints ORDER BY id DESC LIMIT 1').get();
  const nextNum = (lastComplaint ? lastComplaint.id : 0) + 1001;
  return `SCF-${year}-${nextNum}`;
}

// POST /api/complaints/check-duplicate (AI / Smart Duplicate Alert)
router.post('/check-duplicate', verifyToken, (req, res) => {
  try {
    const { building, room_area, category } = req.body;
    if (!building || !room_area) {
      return res.json({ hasDuplicates: false, duplicates: [] });
    }

    const matches = db.prepare(`
      SELECT id, reference_id, title, category, priority, status, building, room_area, created_at
      FROM complaints
      WHERE status NOT IN ('Closed', 'Resolved')
        AND LOWER(building) = LOWER(?)
        AND (LOWER(room_area) = LOWER(?) OR LOWER(room_area) LIKE LOWER(?))
      LIMIT 3
    `).all(building.trim(), room_area.trim(), `%${room_area.trim()}%`);

    res.json({
      hasDuplicates: matches.length > 0,
      duplicates: matches
    });
  } catch (err) {
    console.error('Check duplicate error:', err);
    res.status(500).json({ error: 'Failed to check duplicate issues.' });
  }
});

// GET /api/complaints - List complaints with filters and role-aware scoping
router.get('/', verifyToken, (req, res) => {
  try {
    const { status, category, priority, building, search, sort = 'newest' } = req.query;

    let query = `
      SELECT c.*, 
             u.name as reporter_name, u.email as reporter_email,
             s.name as assigned_staff_name, s.department as assigned_staff_dept
      FROM complaints c
      JOIN users u ON c.user_id = u.id
      LEFT JOIN users s ON c.assigned_staff_id = s.id
      WHERE 1=1
    `;
    const params = [];

    // Role-based scoping
    if (req.user.role === 'student') {
      query += ` AND c.user_id = ?`;
      params.push(req.user.id);
    } else if (req.user.role === 'staff') {
      query += ` AND c.assigned_staff_id = ?`;
      params.push(req.user.id);
    }
    // Admin sees all

    // Filters
    if (status && status !== 'all') {
      query += ` AND c.status = ?`;
      params.push(status);
    }
    if (category && category !== 'all') {
      query += ` AND c.category = ?`;
      params.push(category);
    }
    if (priority && priority !== 'all') {
      query += ` AND c.priority = ?`;
      params.push(priority);
    }
    if (building && building !== 'all') {
      query += ` AND c.building = ?`;
      params.push(building);
    }
    if (search && search.trim()) {
      const searchTerm = `%${search.trim().toLowerCase()}%`;
      query += ` AND (
        LOWER(c.reference_id) LIKE ? OR
        LOWER(c.title) LIKE ? OR
        LOWER(c.description) LIKE ? OR
        LOWER(c.room_area) LIKE ?
      )`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    // Sorting
    if (sort === 'oldest') {
      query += ` ORDER BY c.created_at ASC`;
    } else if (sort === 'priority') {
      query += ` ORDER BY CASE c.priority 
        WHEN 'Urgent' THEN 1 
        WHEN 'High' THEN 2 
        WHEN 'Medium' THEN 3 
        WHEN 'Low' THEN 4 
        ELSE 5 END, c.created_at DESC`;
    } else {
      query += ` ORDER BY c.created_at DESC`;
    }

    const complaints = db.prepare(query).all(...params);
    res.json({ complaints, total: complaints.length });
  } catch (err) {
    console.error('Fetch complaints error:', err);
    res.status(500).json({ error: 'Failed to retrieve complaints.' });
  }
});

// GET /api/complaints/:id - Single complaint with audit timeline
router.get('/:id', verifyToken, (req, res) => {
  try {
    const { id } = req.params;

    // Can query by numeric id or reference_id
    const isRef = id.startsWith('SCF-');
    const complaint = db.prepare(`
      SELECT c.*, 
             u.name as reporter_name, u.email as reporter_email, u.phone as reporter_phone, u.department as reporter_department,
             s.name as assigned_staff_name, s.email as assigned_staff_email, s.phone as assigned_staff_phone, s.department as assigned_staff_dept,
             a.name as assigned_by_name
      FROM complaints c
      JOIN users u ON c.user_id = u.id
      LEFT JOIN users s ON c.assigned_staff_id = s.id
      LEFT JOIN users a ON c.assigned_by_id = a.id
      WHERE ${isRef ? 'c.reference_id = ?' : 'c.id = ?'}
    `).get(id);

    if (!complaint) {
      return res.status(404).json({ error: 'Complaint record not found.' });
    }

    // Security check: Student can only view their own complaint
    if (req.user.role === 'student' && complaint.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied. You are not authorized to view this complaint.' });
    }

    // Maintenance staff can only view complaints assigned to them (or any if admin)
    if (req.user.role === 'staff' && complaint.assigned_staff_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied. This complaint is not assigned to you.' });
    }

    // Fetch full audit timeline
    const timeline = db.prepare(`
      SELECT * FROM complaint_history 
      WHERE complaint_id = ? 
      ORDER BY created_at ASC
    `).all(complaint.id);

    res.json({ complaint, timeline });
  } catch (err) {
    console.error('Get complaint detail error:', err);
    res.status(500).json({ error: 'Failed to retrieve complaint details.' });
  }
});

// POST /api/complaints - Submit new campus complaint
router.post('/', verifyToken, upload.single('photo'), (req, res) => {
  try {
    const {
      title,
      description,
      category,
      priority = 'Medium',
      building,
      block,
      floor,
      room_area,
      additional_location
    } = req.body;

    // Validation
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Issue title is required.' });
    }
    if (!description || description.trim().length < 15) {
      return res.status(400).json({ error: 'Detailed description is required (minimum 15 characters).' });
    }
    const validCategories = [
      'Electrical', 'Plumbing', 'Cleaning', 'Internet/Wi-Fi', 
      'Classroom Equipment', 'Furniture', 'Safety', 'Water Supply', 'Other'
    ];
    if (!category || !validCategories.includes(category)) {
      return res.status(400).json({ error: 'Please select a valid campus issue category.' });
    }
    const validPriorities = ['Low', 'Medium', 'High', 'Urgent'];
    if (!validPriorities.includes(priority)) {
      return res.status(400).json({ error: 'Please select a valid priority level.' });
    }
    if (!building || !building.trim()) {
      return res.status(400).json({ error: 'Campus building is required.' });
    }
    if (!room_area || !room_area.trim()) {
      return res.status(400).json({ error: 'Room or specific area is required.' });
    }

    const reference_id = generateReferenceId();
    const photo_url = req.file ? `/uploads/${req.file.filename}` : null;

    const insert = db.prepare(`
      INSERT INTO complaints (
        reference_id, title, description, category, priority, status,
        building, block, floor, room_area, additional_location,
        photo_url, user_id
      ) VALUES (?, ?, ?, ?, ?, 'Submitted', ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insert.run(
      reference_id,
      title.trim(),
      description.trim(),
      category,
      priority,
      building.trim(),
      block ? block.trim() : null,
      floor ? floor.trim() : null,
      room_area.trim(),
      additional_location ? additional_location.trim() : null,
      photo_url,
      req.user.id
    );

    const complaintId = Number(result.lastInsertRowid);

    // Initial audit log
    db.prepare(`
      INSERT INTO complaint_history (
        complaint_id, action, from_status, to_status, actor_id, actor_name, actor_role, remarks
      ) VALUES (?, 'Submitted', NULL, 'Submitted', ?, ?, ?, ?)
    `).run(
      complaintId,
      req.user.id,
      req.user.name,
      req.user.role,
      `Report submitted by ${req.user.name} (${req.user.role}). Initial status: Submitted.`
    );

    // Reporter notification
    db.prepare(`
      INSERT INTO notifications (user_id, complaint_id, title, message, type)
      VALUES (?, ?, 'Complaint Submitted Successfully', ?, 'info')
    `).run(
      req.user.id,
      complaintId,
      `Your complaint "${title.trim()}" has been received with Ref ID: ${reference_id}. Our facility team is reviewing it.`
    );

    // Notify all admins of new submission
    const admins = db.prepare("SELECT id FROM users WHERE role = 'admin'").all();
    for (const admin of admins) {
      db.prepare(`
        INSERT INTO notifications (user_id, complaint_id, title, message, type)
        VALUES (?, ?, 'New Campus Issue Reported', ?, 'alert')
      `).run(
        admin.id,
        complaintId,
        `New [${priority}] issue in ${building.trim()} (${room_area.trim()}): "${title.trim()}" [Ref: ${reference_id}].`
      );
    }

    const createdComplaint = db.prepare('SELECT * FROM complaints WHERE id = ?').get(complaintId);

    res.status(201).json({
      message: 'Complaint submitted successfully.',
      complaint: createdComplaint,
      reference_id
    });
  } catch (err) {
    console.error('Create complaint error:', err);
    res.status(500).json({ error: 'Failed to submit complaint. ' + err.message });
  }
});

// POST /api/complaints/:id/assign - Admin assigns to maintenance staff (US09)
router.post('/:id/assign', verifyToken, requireRole(['admin']), (req, res) => {
  try {
    const { id } = req.params;
    const { staff_id, remarks } = req.body;

    if (!staff_id) {
      return res.status(400).json({ error: 'Please select a maintenance staff member for assignment.' });
    }

    const complaint = db.prepare('SELECT * FROM complaints WHERE id = ?').get(id);
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found.' });
    }

    const staff = db.prepare("SELECT id, name, email, department FROM users WHERE id = ? AND role = 'staff'").get(staff_id);
    if (!staff) {
      return res.status(400).json({ error: 'Selected user is not an active maintenance staff member.' });
    }

    const previousStatus = complaint.status;
    const newStatus = 'Assigned';
    const now = new Date().toISOString();

    // If reassigned from another staff, decrement previous staff active count
    if (complaint.assigned_staff_id && complaint.assigned_staff_id !== staff.id) {
      db.prepare(`
        UPDATE staff_profiles 
        SET active_tickets_count = MAX(0, active_tickets_count - 1)
        WHERE user_id = ?
      `).run(complaint.assigned_staff_id);
    }

    // Increment new staff active count
    db.prepare(`
      UPDATE staff_profiles 
      SET active_tickets_count = active_tickets_count + 1
      WHERE user_id = ?
    `).run(staff.id);

    // Update complaint
    db.prepare(`
      UPDATE complaints 
      SET assigned_staff_id = ?, assigned_by_id = ?, assigned_at = ?, status = ?, updated_at = ?
      WHERE id = ?
    `).run(staff.id, req.user.id, now, newStatus, now, id);

    // Audit log
    const auditRemark = remarks && remarks.trim() 
      ? `Assigned to ${staff.name} (${staff.department || 'Maintenance'}). Admin Notes: ${remarks.trim()}`
      : `Assigned to ${staff.name} (${staff.department || 'Maintenance'}) by Admin ${req.user.name}.`;

    db.prepare(`
      INSERT INTO complaint_history (
        complaint_id, action, from_status, to_status, actor_id, actor_name, actor_role, remarks
      ) VALUES (?, 'Assigned', ?, ?, ?, ?, 'admin', ?)
    `).run(id, previousStatus, newStatus, req.user.id, req.user.name, auditRemark);

    // Notify assigned staff
    db.prepare(`
      INSERT INTO notifications (user_id, complaint_id, title, message, type)
      VALUES (?, ?, 'New Task Assigned', ?, 'assignment')
    `).run(
      staff.id,
      id,
      `You have been assigned to issue "${complaint.title}" at ${complaint.building} [Ref: ${complaint.reference_id}].`
    );

    // Notify complaint reporter
    db.prepare(`
      INSERT INTO notifications (user_id, complaint_id, title, message, type)
      VALUES (?, ?, 'Staff Assigned to Your Issue', ?, 'status_change')
    `).run(
      complaint.user_id,
      id,
      `Your complaint [${complaint.reference_id}] has been assigned to ${staff.name} from ${staff.department || 'Maintenance'}.`
    );

    const updated = db.prepare('SELECT * FROM complaints WHERE id = ?').get(id);
    res.json({ message: 'Complaint assigned successfully.', complaint: updated });
  } catch (err) {
    console.error('Assign complaint error:', err);
    res.status(500).json({ error: 'Failed to assign complaint.' });
  }
});

// POST /api/complaints/:id/status - Update status by Maintenance Staff or Admin (US10)
router.post('/:id/status', verifyToken, requireRole(['staff', 'admin']), (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    const complaint = db.prepare('SELECT * FROM complaints WHERE id = ?').get(id);
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found.' });
    }

    // Role check: if staff, ensure it is assigned to this staff member
    if (req.user.role === 'staff' && complaint.assigned_staff_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied. You can only update tickets assigned to you.' });
    }

    const validStatuses = ['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Closed'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid target status requested.' });
    }

    const previousStatus = complaint.status;
    const now = new Date().toISOString();

    db.prepare(`
      UPDATE complaints 
      SET status = ?, updated_at = ?
      WHERE id = ?
    `).run(status, now, id);

    // Audit log
    db.prepare(`
      INSERT INTO complaint_history (
        complaint_id, action, from_status, to_status, actor_id, actor_name, actor_role, remarks
      ) VALUES (?, 'Status Updated', ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      previousStatus,
      status,
      req.user.id,
      req.user.name,
      req.user.role,
      remarks && remarks.trim() ? remarks.trim() : `Status transitioned from ${previousStatus} to ${status}.`
    );

    // Notify reporter
    db.prepare(`
      INSERT INTO notifications (user_id, complaint_id, title, message, type)
      VALUES (?, ?, 'Complaint Progress Update', ?, 'status_change')
    `).run(
      complaint.user_id,
      id,
      `Your complaint [${complaint.reference_id}] status is now: ${status}. Notes: ${remarks || 'Work ongoing'}`
    );

    const updated = db.prepare('SELECT * FROM complaints WHERE id = ?').get(id);
    res.json({ message: 'Complaint status updated.', complaint: updated });
  } catch (err) {
    console.error('Update status error:', err);
    res.status(500).json({ error: 'Failed to update complaint status.' });
  }
});

// POST /api/complaints/:id/resolve - Mark resolved with resolution notes (US11)
router.post('/:id/resolve', verifyToken, requireRole(['staff', 'admin']), (req, res) => {
  try {
    const { id } = req.params;
    const { resolution_notes } = req.body;

    if (!resolution_notes || resolution_notes.trim().length < 10) {
      return res.status(400).json({ error: 'Resolution notes are required (minimum 10 characters).' });
    }

    const complaint = db.prepare('SELECT * FROM complaints WHERE id = ?').get(id);
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found.' });
    }

    if (req.user.role === 'staff' && complaint.assigned_staff_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied. You can only resolve your assigned tickets.' });
    }

    const now = new Date().toISOString();
    const previousStatus = complaint.status;

    // Decrement staff active ticket count
    if (complaint.assigned_staff_id) {
      db.prepare(`
        UPDATE staff_profiles 
        SET active_tickets_count = MAX(0, active_tickets_count - 1)
        WHERE user_id = ?
      `).run(complaint.assigned_staff_id);
    }

    db.prepare(`
      UPDATE complaints 
      SET status = 'Resolved', resolution_notes = ?, resolved_at = ?, updated_at = ?
      WHERE id = ?
    `).run(resolution_notes.trim(), now, now, id);

    // Audit log
    db.prepare(`
      INSERT INTO complaint_history (
        complaint_id, action, from_status, to_status, actor_id, actor_name, actor_role, remarks
      ) VALUES (?, 'Resolved', ?, 'Resolved', ?, ?, ?, ?)
    `).run(
      id,
      previousStatus,
      req.user.id,
      req.user.name,
      req.user.role,
      `Work Completed: ${resolution_notes.trim()}`
    );

    // Notify reporter
    db.prepare(`
      INSERT INTO notifications (user_id, complaint_id, title, message, type)
      VALUES (?, ?, 'Complaint Resolved!', ?, 'resolution')
    `).run(
      complaint.user_id,
      id,
      `Your complaint [${complaint.reference_id}] has been marked as Resolved. Resolution: "${resolution_notes.trim()}". Please review and confirm closure.`
    );

    // Notify admin
    const admins = db.prepare("SELECT id FROM users WHERE role = 'admin'").all();
    for (const a of admins) {
      db.prepare(`
        INSERT INTO notifications (user_id, complaint_id, title, message, type)
        VALUES (?, ?, 'Issue Resolved by Staff', ?, 'resolution')
      `).run(
        a.id,
        id,
        `Issue [${complaint.reference_id}] resolved by ${req.user.name}. Ready for administrative closure.`
      );
    }

    const updated = db.prepare('SELECT * FROM complaints WHERE id = ?').get(id);
    res.json({ message: 'Complaint resolved successfully.', complaint: updated });
  } catch (err) {
    console.error('Resolve complaint error:', err);
    res.status(500).json({ error: 'Failed to resolve complaint.' });
  }
});

// POST /api/complaints/:id/close - Final closure by Admin or Reporter (US11)
router.post('/:id/close', verifyToken, (req, res) => {
  try {
    const { id } = req.params;
    const { closure_remarks } = req.body;

    const complaint = db.prepare('SELECT * FROM complaints WHERE id = ?').get(id);
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found.' });
    }

    // Only Admin or the original reporter can close the ticket
    if (req.user.role !== 'admin' && complaint.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Only the administrator or the original reporter can close this complaint.' });
    }

    const previousStatus = complaint.status;
    const now = new Date().toISOString();

    db.prepare(`
      UPDATE complaints 
      SET status = 'Closed', closed_at = ?, updated_at = ?
      WHERE id = ?
    `).run(now, now, id);

    // Audit log
    db.prepare(`
      INSERT INTO complaint_history (
        complaint_id, action, from_status, to_status, actor_id, actor_name, actor_role, remarks
      ) VALUES (?, 'Closed', ?, 'Closed', ?, ?, ?, ?)
    `).run(
      id,
      previousStatus,
      req.user.id,
      req.user.name,
      req.user.role,
      closure_remarks && closure_remarks.trim() ? closure_remarks.trim() : `Complaint officially closed by ${req.user.name} (${req.user.role}).`
    );

    // Notifications
    if (req.user.id !== complaint.user_id) {
      db.prepare(`
        INSERT INTO notifications (user_id, complaint_id, title, message, type)
        VALUES (?, ?, 'Complaint Closed', ?, 'info')
      `).run(
        complaint.user_id,
        id,
        `Your complaint [${complaint.reference_id}] has been closed and archived. Thank you for helping keep our campus safe and functional!`
      );
    }

    const updated = db.prepare('SELECT * FROM complaints WHERE id = ?').get(id);
    res.json({ message: 'Complaint closed successfully.', complaint: updated });
  } catch (err) {
    console.error('Close complaint error:', err);
    res.status(500).json({ error: 'Failed to close complaint.' });
  }
});

// POST /api/complaints/:id/reopen - Reopen workflow if problem recurs
router.post('/:id/reopen', verifyToken, (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || reason.trim().length < 10) {
      return res.status(400).json({ error: 'Please provide a clear reason for reopening (minimum 10 characters).' });
    }

    const complaint = db.prepare('SELECT * FROM complaints WHERE id = ?').get(id);
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found.' });
    }

    if (req.user.role !== 'admin' && complaint.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Only the original reporter or an administrator can reopen this complaint.' });
    }

    const previousStatus = complaint.status;
    const now = new Date().toISOString();

    db.prepare(`
      UPDATE complaints 
      SET status = 'Reopened', reopened_at = ?, updated_at = ?
      WHERE id = ?
    `).run(now, now, id);

    db.prepare(`
      INSERT INTO complaint_history (
        complaint_id, action, from_status, to_status, actor_id, actor_name, actor_role, remarks
      ) VALUES (?, 'Reopened', ?, 'Reopened', ?, ?, ?, ?)
    `).run(
      id,
      previousStatus,
      req.user.id,
      req.user.name,
      req.user.role,
      `Complaint reopened by ${req.user.name}. Reason: ${reason.trim()}`
    );

    // Notify admins
    const admins = db.prepare("SELECT id FROM users WHERE role = 'admin'").all();
    for (const a of admins) {
      db.prepare(`
        INSERT INTO notifications (user_id, complaint_id, title, message, type)
        VALUES (?, ?, 'Complaint Reopened', ?, 'alert')
      `).run(
        a.id,
        id,
        `Issue [${complaint.reference_id}] was reopened by ${req.user.name}. Reason: "${reason.trim()}".`
      );
    }

    const updated = db.prepare('SELECT * FROM complaints WHERE id = ?').get(id);
    res.json({ message: 'Complaint reopened for review.', complaint: updated });
  } catch (err) {
    console.error('Reopen complaint error:', err);
    res.status(500).json({ error: 'Failed to reopen complaint.' });
  }
});

// PATCH /api/complaints/:id/priority - Admin updates priority (US06)
router.patch('/:id/priority', verifyToken, requireRole(['admin']), (req, res) => {
  try {
    const { id } = req.params;
    const { priority } = req.body;

    const validPriorities = ['Low', 'Medium', 'High', 'Urgent'];
    if (!validPriorities.includes(priority)) {
      return res.status(400).json({ error: 'Invalid priority level.' });
    }

    const complaint = db.prepare('SELECT * FROM complaints WHERE id = ?').get(id);
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found.' });
    }

    const previousPriority = complaint.priority;
    const now = new Date().toISOString();

    db.prepare('UPDATE complaints SET priority = ?, updated_at = ? WHERE id = ?').run(priority, now, id);

    db.prepare(`
      INSERT INTO complaint_history (
        complaint_id, action, from_status, to_status, actor_id, actor_name, actor_role, remarks
      ) VALUES (?, 'Priority Changed', ?, ?, ?, ?, 'admin', ?)
    `).run(
      id,
      complaint.status,
      complaint.status,
      req.user.id,
      req.user.name,
      `Priority adjusted from ${previousPriority} to ${priority} by Administrator.`
    );

    const updated = db.prepare('SELECT * FROM complaints WHERE id = ?').get(id);
    res.json({ message: 'Priority updated successfully.', complaint: updated });
  } catch (err) {
    console.error('Update priority error:', err);
    res.status(500).json({ error: 'Failed to update priority.' });
  }
});

export default router;
