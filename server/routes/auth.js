import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db.js';
import { verifyToken, JWT_SECRET } from '../middleware/auth.js';

const router = express.Router();

// Seeded demo accounts metadata for final review presentation
export const DEMO_ACCOUNTS = [
  {
    role: 'student',
    label: 'Student / Campus Reporter',
    email: 'alex.student@campus.edu',
    password: 'Student123!',
    name: 'Alex Rivera',
    department: 'Computer Science & Eng.'
  },
  {
    role: 'admin',
    label: 'Campus Facility Administrator',
    email: 'dr.patel@campus.edu',
    password: 'Admin123!',
    name: 'Dr. Evelyn Patel',
    department: 'Campus Infrastructure & Facilities'
  },
  {
    role: 'staff',
    label: 'Maintenance Staff (Electrical)',
    email: 'marcus.elec@campus.edu',
    password: 'Staff123!',
    name: 'Marcus Vance',
    department: 'Electrical Maintenance'
  },
  {
    role: 'staff',
    label: 'Maintenance Staff (Plumbing)',
    email: 'sarah.plumb@campus.edu',
    password: 'Staff123!',
    name: 'Sarah Jenkins',
    department: 'Plumbing & Water Systems'
  }
];

// GET /api/auth/demo-users
router.get('/demo-users', (req, res) => {
  res.json({
    message: 'Demo accounts available for testing and evaluation',
    accounts: DEMO_ACCOUNTS
  });
});

// POST /api/auth/register
router.post('/register', (req, res) => {
  try {
    const { name, email, password, role = 'student', department, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required fields.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    // Role validation
    const validRoles = ['student', 'admin', 'staff'];
    const chosenRole = validRoles.includes(role) ? role : 'student';

    // Check duplicate email
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (existing) {
      return res.status(409).json({ error: 'An account with this email address already exists.' });
    }

    // Hash password with bcryptjs
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const insertUser = db.prepare(`
      INSERT INTO users (name, email, password, role, department, phone)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = insertUser.run(
      name.trim(),
      email.toLowerCase().trim(),
      hashedPassword,
      chosenRole,
      department ? department.trim() : null,
      phone ? phone.trim() : null
    );

    const userId = Number(result.lastInsertRowid);

    // If staff, initialize staff profile
    if (chosenRole === 'staff') {
      db.prepare(`
        INSERT INTO staff_profiles (user_id, specialty, active_tickets_count, is_available)
        VALUES (?, ?, 0, 1)
      `).run(userId, department || 'General');
    }

    // Generate JWT
    const token = jwt.sign(
      { id: userId, email: email.toLowerCase().trim(), role: chosenRole },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const newUser = {
      id: userId,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      role: chosenRole,
      department: department ? department.trim() : null,
      phone: phone ? phone.trim() : null
    };

    // Welcome notification
    db.prepare(`
      INSERT INTO notifications (user_id, title, message, type)
      VALUES (?, 'Welcome to Smart Campus Fix!', 'Your account has been successfully initialized. You can now report campus issues and track their progress live.', 'info')
    `).run(userId);

    res.status(201).json({
      message: 'Account registered successfully',
      user: newUser,
      token
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Internal server error during registration.' });
  }
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = db.prepare(`
      SELECT id, name, email, password, role, department, phone 
      FROM users 
      WHERE email = ?
    `).get(email.toLowerCase().trim());

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password credentials.' });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password credentials.' });
    }

    // Token creation
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      phone: user.phone
    };

    res.json({
      message: 'Authentication successful',
      user: safeUser,
      token
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error during authentication.' });
  }
});

// GET /api/auth/me
router.get('/me', verifyToken, (req, res) => {
  try {
    const unreadCount = db.prepare(`
      SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0
    `).get(req.user.id);

    let extra = {};
    if (req.user.role === 'staff') {
      const profile = db.prepare('SELECT specialty, active_tickets_count, is_available FROM staff_profiles WHERE user_id = ?').get(req.user.id);
      extra.staffProfile = profile || null;
    }

    res.json({
      user: {
        ...req.user,
        unreadNotifications: unreadCount ? unreadCount.count : 0,
        ...extra
      }
    });
  } catch (err) {
    console.error('Profile fetch error:', err);
    res.status(500).json({ error: 'Failed to retrieve user profile.' });
  }
});

// PUT /api/auth/profile
router.put('/profile', verifyToken, (req, res) => {
  try {
    const { name, department, phone } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required.' });
    }

    db.prepare(`
      UPDATE users 
      SET name = ?, department = ?, phone = ?
      WHERE id = ?
    `).run(name.trim(), department ? department.trim() : null, phone ? phone.trim() : null, req.user.id);

    const updated = db.prepare('SELECT id, name, email, role, department, phone FROM users WHERE id = ?').get(req.user.id);
    res.json({ message: 'Profile updated successfully', user: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

export default router;
