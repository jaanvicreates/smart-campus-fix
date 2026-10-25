import express from 'express';
import { db } from '../db.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// GET /api/stats/admin - Comprehensive real-time metrics for Admin Dashboard (US08)
router.get('/admin', verifyToken, requireRole(['admin']), (req, res) => {
  try {
    const total = db.prepare('SELECT COUNT(*) as count FROM complaints').get().count;
    const pending = db.prepare("SELECT COUNT(*) as count FROM complaints WHERE status = 'Submitted'").get().count;
    const assigned = db.prepare("SELECT COUNT(*) as count FROM complaints WHERE status = 'Assigned'").get().count;
    const in_progress = db.prepare("SELECT COUNT(*) as count FROM complaints WHERE status = 'In Progress'").get().count;
    const resolved = db.prepare("SELECT COUNT(*) as count FROM complaints WHERE status = 'Resolved'").get().count;
    const closed = db.prepare("SELECT COUNT(*) as count FROM complaints WHERE status = 'Closed'").get().count;
    const urgent = db.prepare("SELECT COUNT(*) as count FROM complaints WHERE priority = 'Urgent' AND status NOT IN ('Resolved', 'Closed')").get().count;

    // Category breakdown
    const categoryCounts = db.prepare(`
      SELECT category, COUNT(*) as count 
      FROM complaints 
      GROUP BY category 
      ORDER BY count DESC
    `).all();

    // Priority breakdown
    const priorityCounts = db.prepare(`
      SELECT priority, COUNT(*) as count 
      FROM complaints 
      GROUP BY priority
    `).all();

    // Building breakdown
    const buildingCounts = db.prepare(`
      SELECT building, COUNT(*) as count 
      FROM complaints 
      GROUP BY building 
      ORDER BY count DESC 
      LIMIT 6
    `).all();

    // Resolution rate calculation
    const completedCount = resolved + closed;
    const resolutionRate = total > 0 ? Math.round((completedCount / total) * 100) : 0;

    // Staff workload stats
    const staffWorkload = db.prepare(`
      SELECT u.id, u.name, u.department, sp.specialty, sp.active_tickets_count, sp.is_available
      FROM users u
      LEFT JOIN staff_profiles sp ON u.id = sp.user_id
      WHERE u.role = 'staff'
      ORDER BY sp.active_tickets_count DESC
    `).all();

    // Recent activity (latest 6 events)
    const recentActivity = db.prepare(`
      SELECT h.*, c.reference_id, c.title as complaint_title
      FROM complaint_history h
      JOIN complaints c ON h.complaint_id = c.id
      ORDER BY h.created_at DESC
      LIMIT 8
    `).all();

    res.json({
      summary: {
        total,
        pending,
        assigned,
        in_progress,
        resolved,
        closed,
        urgent,
        completedCount,
        resolutionRate
      },
      categoryCounts,
      priorityCounts,
      buildingCounts,
      staffWorkload,
      recentActivity
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    res.status(500).json({ error: 'Failed to compute admin statistics.' });
  }
});

// GET /api/stats/staff - Maintenance staff individual metrics (US10)
router.get('/staff', verifyToken, requireRole(['staff']), (req, res) => {
  try {
    const assignedCount = db.prepare("SELECT COUNT(*) as count FROM complaints WHERE assigned_staff_id = ? AND status = 'Assigned'").get(req.user.id).count;
    const inProgressCount = db.prepare("SELECT COUNT(*) as count FROM complaints WHERE assigned_staff_id = ? AND status = 'In Progress'").get(req.user.id).count;
    const resolvedCount = db.prepare("SELECT COUNT(*) as count FROM complaints WHERE assigned_staff_id = ? AND status IN ('Resolved', 'Closed')").get(req.user.id).count;
    const urgentCount = db.prepare("SELECT COUNT(*) as count FROM complaints WHERE assigned_staff_id = ? AND priority = 'Urgent' AND status NOT IN ('Resolved', 'Closed')").get(req.user.id).count;

    res.json({
      assignedCount,
      inProgressCount,
      resolvedCount,
      urgentCount,
      totalActive: assignedCount + inProgressCount
    });
  } catch (err) {
    console.error('Staff stats error:', err);
    res.status(500).json({ error: 'Failed to compute staff statistics.' });
  }
});

// GET /api/stats/student - Student user dashboard summary
router.get('/student', verifyToken, (req, res) => {
  try {
    const totalReports = db.prepare('SELECT COUNT(*) as count FROM complaints WHERE user_id = ?').get(req.user.id).count;
    const activeReports = db.prepare("SELECT COUNT(*) as count FROM complaints WHERE user_id = ? AND status NOT IN ('Resolved', 'Closed')").get(req.user.id).count;
    const resolvedReports = db.prepare("SELECT COUNT(*) as count FROM complaints WHERE user_id = ? AND status IN ('Resolved', 'Closed')").get(req.user.id).count;

    res.json({
      totalReports,
      activeReports,
      resolvedReports
    });
  } catch (err) {
    console.error('Student stats error:', err);
    res.status(500).json({ error: 'Failed to compute student statistics.' });
  }
});

export default router;
