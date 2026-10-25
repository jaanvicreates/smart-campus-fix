import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import { JWT_SECRET } from '../server/middleware/auth.js';
import { db } from '../server/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const screenshotsDir = path.join(__dirname, '..', 'screenshots');

if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Generate tokens for each role
const student = db.prepare("SELECT * FROM users WHERE role = 'student' LIMIT 1").get();
const admin = db.prepare("SELECT * FROM users WHERE role = 'admin' LIMIT 1").get();
const staff = db.prepare("SELECT * FROM users WHERE role = 'staff' LIMIT 1").get();

const studentToken = jwt.sign({ id: student.id, email: student.email, role: student.role }, JWT_SECRET, { expiresIn: '1d' });
const adminToken = jwt.sign({ id: admin.id, email: admin.email, role: admin.role }, JWT_SECRET, { expiresIn: '1d' });
const staffToken = jwt.sign({ id: staff.id, email: staff.email, role: staff.role }, JWT_SECRET, { expiresIn: '1d' });

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function captureWithCdp() {
  console.log('Starting Edge with remote debugging...');
  const edgeProcess = spawn(edgePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--user-data-dir=C:\\tmp\\edge_cdp_profile',
    '--window-size=1440,900',
    'http://localhost:5000'
  ]);

  // Wait 2s for Edge to start
  await new Promise((r) => setTimeout(r, 2000));

  try {
    const listRes = await fetch('http://127.0.0.1:9222/json/list');
    const tabs = await listRes.json();
    const wsUrl = tabs[0]?.webSocketDebuggerUrl;
    if (!wsUrl) throw new Error('No WebSocket URL from Edge');

    const ws = new WebSocket(wsUrl);

    let messageId = 1;
    const pending = new Map();

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (pending.has(data.id)) {
        const { resolve, reject } = pending.get(data.id);
        pending.delete(data.id);
        if (data.error) reject(data.error);
        else resolve(data.result);
      }
    };

    await new Promise((resolve) => ws.onopen = resolve);

    function sendCommand(method, params = {}) {
      return new Promise((resolve, reject) => {
        const id = messageId++;
        pending.set(id, { resolve, reject });
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    await sendCommand('Page.enable');
    await sendCommand('Runtime.enable');

    async function setTokenAndNavigate(url, token) {
      await sendCommand('Page.navigate', { url: 'http://localhost:5000/' });
      await new Promise((r) => setTimeout(r, 800));
      await sendCommand('Runtime.evaluate', {
        expression: `localStorage.setItem('scf_token', '${token}');`
      });
      await sendCommand('Page.navigate', { url });
      await new Promise((r) => setTimeout(r, 1500)); // wait for animations and render
    }

    async function takeScreenshot(filename) {
      const res = await sendCommand('Page.captureScreenshot', { format: 'png' });
      const buffer = Buffer.from(res.data, 'base64');
      const outPath = path.join(screenshotsDir, filename);
      fs.writeFileSync(outPath, buffer);
      console.log(`📸 Captured: ${filename}`);
    }

    // 1. Student Dashboard
    console.log('Capturing Student Dashboard...');
    await setTokenAndNavigate('http://localhost:5000/dashboard', studentToken);
    await takeScreenshot('03_student_dashboard.png');

    // 2. Report Issue Page
    console.log('Capturing Report Issue Page...');
    await setTokenAndNavigate('http://localhost:5000/report', studentToken);
    await takeScreenshot('04_report_issue_form.png');

    // 3. My Complaints
    console.log('Capturing My Complaints Page...');
    await setTokenAndNavigate('http://localhost:5000/my-complaints', studentToken);
    await takeScreenshot('05_my_complaints.png');

    // 4. Complaint Detail & Timeline
    console.log('Capturing Complaint Detail & Timeline...');
    await setTokenAndNavigate('http://localhost:5000/complaints/SCF-2026-1001', studentToken);
    await takeScreenshot('06_complaint_detail_timeline.png');

    // 5. Notifications Page
    console.log('Capturing Notifications Page...');
    await setTokenAndNavigate('http://localhost:5000/notifications', studentToken);
    await takeScreenshot('07_notifications.png');

    // 6. Admin Dashboard
    console.log('Capturing Admin Overview Dashboard...');
    await setTokenAndNavigate('http://localhost:5000/admin', adminToken);
    await takeScreenshot('08_admin_dashboard.png');

    // 7. Admin Review & Assignment Workspace
    console.log('Capturing Admin Review & Assign Workspace...');
    await setTokenAndNavigate('http://localhost:5000/admin/complaints', adminToken);
    await takeScreenshot('09_admin_assign_workspace.png');

    // 8. Staff Dashboard
    console.log('Capturing Staff Operations Desk...');
    await setTokenAndNavigate('http://localhost:5000/staff', staffToken);
    await takeScreenshot('10_staff_dashboard.png');

    ws.close();
    console.log('✅ All screenshots captured successfully!');
  } catch (err) {
    console.error('Error during capture:', err);
  } finally {
    edgeProcess.kill();
  }
}

captureWithCdp();
