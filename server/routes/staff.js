import express from 'express';
import { db } from '../db.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// GET /api/staff - List all maintenance staff with workload and specialty (US09)
router.get('/', verifyToken, (req, res) => {
  try {
    const staffMembers = db.prepare(`
      SELECT u.id, u.name, u.email, u.department, u.phone,
             COALESCE(sp.specialty, u.department, 'General Maintenance') as specialty,
             COALESCE(sp.active_tickets_count, 0) as active_tickets_count,
             COALESCE(sp.is_available, 1) as is_available
      FROM users u
      LEFT JOIN staff_profiles sp ON u.id = sp.user_id
      WHERE u.role = 'staff'
      ORDER BY sp.active_tickets_count ASC, u.name ASC
    `).all();

    res.json({ staff: staffMembers });
  } catch (err) {
    console.error('Fetch staff error:', err);
    res.status(500).json({ error: 'Failed to retrieve maintenance staff list.' });
  }
});

// PATCH /api/staff/availability - Toggle staff availability
router.patch('/availability', verifyToken, requireRole(['staff']), (req, res) => {
  try {
    const { is_available } = req.body;
    db.prepare(`
      UPDATE staff_profiles 
      SET is_available = ? 
      WHERE user_id = ?
    `).run(is_available ? 1 : 0, req.user.id);

    res.json({ message: 'Availability status updated', is_available: !!is_available });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update availability.' });
  }
});

export default router;
