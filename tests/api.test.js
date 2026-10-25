process.env.NODE_ENV = 'test';
import test from 'node:test';
import assert from 'node:assert/strict';
import app from '../server/index.js';
import { db } from '../server/db.js';
import { seed } from '../server/seed.js';

let server;
let baseUrl;

test.before(async () => {
  seed();
  await new Promise((resolve) => {
    server = app.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

test.after(async () => {
  if (server) {
    server.close();
  }
  setTimeout(() => process.exit(0), 100);
});

async function api(path, options = {}) {
  const res = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

test('US01: Authentication & Role Management', async (t) => {
  await t.test('Login with valid student demo credentials', async () => {
    const res = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'alex.student@campus.edu', password: 'Student123!' })
    });
    assert.equal(res.status, 200);
    assert.equal(res.data.user.role, 'student');
    assert.ok(res.data.token);
  });

  await t.test('Login with incorrect password fails with 401', async () => {
    const res = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'alex.student@campus.edu', password: 'WrongPassword!' })
    });
    assert.equal(res.status, 401);
  });

  await t.test('Register new student account with validation', async () => {
    const testEmail = `new.student.${Date.now()}@campus.edu`;
    const res = await api('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Jordan Lee',
        email: testEmail,
        password: 'Password123!',
        role: 'student',
        department: 'Biomedical Sciences'
      })
    });
    assert.equal(res.status, 201);
    assert.equal(res.data.user.name, 'Jordan Lee');
    assert.ok(res.data.token);

    // Duplicate email rejected
    const dupRes = await api('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Jordan Lee',
        email: testEmail,
        password: 'Password123!'
      })
    });
    assert.equal(dupRes.status, 409);
  });
});

test('US02, US03, US04, US06: Report Campus Issue & Validation', async (t) => {
  // Login as student
  const loginRes = await api('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'alex.student@campus.edu', password: 'Student123!' })
  });
  const token = loginRes.data.token;

  await t.test('Reject submission with invalid or missing fields', async () => {
    const res = await api('/api/complaints', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title: 'Short', description: 'Too short' })
    });
    assert.equal(res.status, 400);
  });

  let createdComplaintRef;
  await t.test('Successfully submit new campus complaint with reference ID', async () => {
    const res = await api('/api/complaints', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        title: 'Water filter leaking onto lab corridor floor',
        description: 'Persistent cold water leakage from lower valve gasket creating a slip hazard near optics bench.',
        category: 'Water Supply',
        priority: 'High',
        building: 'Science Complex',
        block: 'Block A',
        floor: '2nd Floor',
        room_area: 'Optics Lab 204'
      })
    });
    assert.equal(res.status, 201);
    assert.ok(res.data.reference_id.startsWith('SCF-2026-'));
    assert.equal(res.data.complaint.status, 'Submitted');
    createdComplaintRef = res.data.reference_id;
  });

  await t.test('US07: Track Complaint Status & History Timeline', async (t) => {
    const res = await api(`/api/complaints/${createdComplaintRef}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    assert.equal(res.status, 200);
    assert.equal(res.data.complaint.reference_id, createdComplaintRef);
    assert.ok(Array.isArray(res.data.timeline));
    assert.ok(res.data.timeline.length >= 1);
    assert.equal(res.data.timeline[0].action, 'Submitted');
  });
});

test('US08, US09: Admin Review & Assignment Workflow', async (t) => {
  // Login as admin
  const adminLogin = await api('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'dr.patel@campus.edu', password: 'Admin123!' })
  });
  const adminToken = adminLogin.data.token;

  // Login as staff
  const staffLogin = await api('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'marcus.elec@campus.edu', password: 'Staff123!' })
  });
  const staffId = staffLogin.data.user.id;

  // Check admin computed stats
  const statsRes = await api('/api/stats/admin', {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  assert.equal(statsRes.status, 200);
  assert.ok(typeof statsRes.data.summary.total === 'number');
  assert.ok(statsRes.data.categoryCounts.length > 0);

  // Assign complaint SCF-2026-1004 (which is Submitted)
  const complaint = db.prepare("SELECT id FROM complaints WHERE reference_id = 'SCF-2026-1004'").get();
  assert.ok(complaint);

  const assignRes = await api(`/api/complaints/${complaint.id}/assign`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ staff_id: staffId, remarks: 'Assigned for immediate AV inspection.' })
  });
  assert.equal(assignRes.status, 200);
  assert.equal(assignRes.data.complaint.status, 'Assigned');
  assert.equal(assignRes.data.complaint.assigned_staff_id, staffId);
});

test('US10, US11: Maintenance Status Update & Resolution', async (t) => {
  // Login as staff
  const staffLogin = await api('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'marcus.elec@campus.edu', password: 'Staff123!' })
  });
  const staffToken = staffLogin.data.token;

  const complaint = db.prepare("SELECT id FROM complaints WHERE reference_id = 'SCF-2026-1004'").get();

  // Update status to In Progress
  const statusRes = await api(`/api/complaints/${complaint.id}/status`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${staffToken}` },
    body: JSON.stringify({ status: 'In Progress', remarks: 'Replacing bent pins on HDMI receiver panel.' })
  });
  assert.equal(statusRes.status, 200);
  assert.equal(statusRes.data.complaint.status, 'In Progress');

  // Resolve complaint with resolution notes
  const resolveRes = await api(`/api/complaints/${complaint.id}/resolve`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${staffToken}` },
    body: JSON.stringify({ resolution_notes: 'Soldered replacement high-bandwidth HDMI 2.1 faceplate. Projection verified at 4K resolution.' })
  });
  assert.equal(resolveRes.status, 200);
  assert.equal(resolveRes.data.complaint.status, 'Resolved');

  // Verify timeline preserved all steps
  const detailRes = await api(`/api/complaints/${complaint.id}`, {
    headers: { Authorization: `Bearer ${staffToken}` }
  });
  const actions = detailRes.data.timeline.map(t => t.action);
  assert.ok(actions.includes('Submitted'));
  assert.ok(actions.includes('Assigned'));
  assert.ok(actions.includes('Status Updated'));
  assert.ok(actions.includes('Resolved'));
});

test('US13: Notifications & Real Data Layer', async (t) => {
  const studentLogin = await api('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'alex.student@campus.edu', password: 'Student123!' })
  });
  const token = studentLogin.data.token;

  const notifRes = await api('/api/notifications', {
    headers: { Authorization: `Bearer ${token}` }
  });
  assert.equal(notifRes.status, 200);
  assert.ok(Array.isArray(notifRes.data.notifications));

  // Mark all as read
  const markRes = await api('/api/notifications/read-all', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  });
  assert.equal(markRes.status, 200);
});

test('AI Features: Triage & Duplicate Detection', async (t) => {
  const studentLogin = await api('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'alex.student@campus.edu', password: 'Student123!' })
  });
  const token = studentLogin.data.token;

  // AI Triage
  const triageRes = await api('/api/ai/triage', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      title: 'Smoke and spark coming from breaker',
      description: 'The main electrical box started smoking and sparked violently when machines were turned on.'
    })
  });
  assert.equal(triageRes.status, 200);
  assert.equal(triageRes.data.suggestedCategory, 'Electrical');
  assert.equal(triageRes.data.suggestedPriority, 'Urgent');
  assert.ok(triageRes.data.confidenceScore > 70);

  // Duplicate check
  const dupRes = await api('/api/complaints/check-duplicate', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      building: 'Science Complex',
      room_area: 'Lab 104'
    })
  });
  assert.equal(dupRes.status, 200);
  assert.equal(dupRes.data.hasDuplicates, true);
  assert.ok(dupRes.data.duplicates.length >= 1);
});
