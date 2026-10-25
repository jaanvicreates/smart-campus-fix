# Smart Campus Fix (SCF)
### AI-Based Campus Issue Reporting and Management System
**Final Review — Complete University Capstone Implementation**

---

## 🏛️ System Overview

**Smart Campus Fix** is an enterprise-grade university issue-reporting and facilities management platform. It bridges campus students, facility administrators, and maintenance engineers into a synchronized operational ecosystem.

### Core Architecture Highlights
- **13 Fixed Official User Stories (US01–US13)**: Every user story is implemented, traceable, and verified.
- **AI-Powered Campus Triage**: Real-time NLP heuristics classify campus complaints into appropriate facility domains, assess urgency, calculate confidence scores, and recommend specialized maintenance crews.
- **AI Duplicate Detection**: Proactively detects existing active tickets in the same campus building and room before submission.
- **Persistent ACID Database**: Powered by native `node:sqlite` (SQLite 3.53.1) with full relational integrity, foreign keys, and persistent disk storage (`server/data/smart_campus.db`).
- **Complete Audit Trail**: Every status transition, priority change, assignment, and resolution note is immutably preserved in the audit timeline (`complaint_history` table).
- **University Visual Identity**: Deep navy (`#0b132b`), cobalt (`#1e3a8a`), electric blue (`#2563eb`), and luminous cyan (`#06b6d4`) styling with responsive layouts for mobile, tablet, and desktop displays.

---

## 👥 Evaluation Demo Accounts (1-Click Fast Access)

For evaluation during faculty reviews, the system provides **1-Click Quick Login** buttons on the login page and navigation bar.

| Role | Name | Campus Email | Password | Department / Clearance |
| :--- | :--- | :--- | :--- | :--- |
| **Student** | Alex Rivera | `alex.student@campus.edu` | `Student123!` | Computer Science & Engineering |
| **Admin** | Dr. Evelyn Patel | `dr.patel@campus.edu` | `Admin123!` | Facilities & Campus Infrastructure |
| **Staff (Electrical)** | Marcus Vance | `marcus.elec@campus.edu` | `Staff123!` | Electrical Maintenance |
| **Staff (Plumbing)** | Sarah Jenkins | `sarah.plumb@campus.edu` | `Staff123!` | Plumbing & Hydraulics |

> **Direct URL Role Switchers:**  
> You can also open any page directly with a query role switcher:  
> - Student: `http://localhost:5000/dashboard?role=student`  
> - Admin: `http://localhost:5000/admin?role=admin`  
> - Staff: `http://localhost:5000/staff?role=staff`

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v20+ or v26+)
- npm (v10+ or v11+)

### 1. Installation
Clone the repository and install dependencies:
```bash
npm install
```

### 2. Database Initialization & Seeding
Populate the database with campus users, technician profiles, realistic complaint scenarios across varied statuses, and audit histories:
```bash
npm run seed
```

### 3. Run Automated Tests
Execute the automated test suite verifying all user stories and AI triage endpoints:
```bash
npm test
```

### 4. Build Production Frontend
Compile optimized React 19 assets via Vite:
```bash
npm run build
```

### 5. Launch Application
Start the integrated production server:
```bash
npm start
```
Open **[http://localhost:5000](http://localhost:5000)** in your web browser.

*(For concurrent development with hot module reloading, run `npm run dev`)*.

---

## 📋 13 Fixed Official User Stories (Traceability Summary)

| Story | Title | Primary Files | Acceptance Result |
| :--- | :--- | :--- | :---: |
| **US01** | Registration & Login | `server/routes/auth.js`, `src/pages/LoginPage.jsx`, `src/context/AuthContext.jsx` | **PASSED** |
| **US02** | Report Campus Issue | `server/routes/complaints.js`, `src/pages/ReportIssuePage.jsx` | **PASSED** |
| **US03** | Select Issue Category | `src/pages/ReportIssuePage.jsx`, `src/data/categories.js` | **PASSED** |
| **US04** | Description & Location | `src/pages/ReportIssuePage.jsx`, `src/data/campusLocations.js` | **PASSED** |
| **US05** | Upload Complaint Photo | `server/routes/complaints.js`, `src/pages/ReportIssuePage.jsx`, `server/uploads/` | **PASSED** |
| **US06** | Select Priority | `src/pages/ReportIssuePage.jsx`, `src/components/PriorityBadge.jsx` | **PASSED** |
| **US07** | Track Complaint Status | `src/pages/ComplaintDetailPage.jsx`, `src/pages/MyComplaintsPage.jsx` | **PASSED** |
| **US08** | Admin View & Review | `src/pages/AdminDashboard.jsx`, `server/routes/stats.js` | **PASSED** |
| **US09** | Assign to Maintenance Staff | `src/pages/AdminComplaintsPage.jsx`, `server/routes/complaints.js` | **PASSED** |
| **US10** | Maintenance Update Status | `src/pages/StaffDashboard.jsx`, `src/pages/ComplaintDetailPage.jsx` | **PASSED** |
| **US11** | Resolve & Close Complaint | `src/pages/ComplaintDetailPage.jsx`, `server/routes/complaints.js` | **PASSED** |
| **US12** | Submission Confirmation | `src/pages/ConfirmationPage.jsx`, `src/pages/ReportIssuePage.jsx` | **PASSED** |
| **US13** | Notifications & History | `src/pages/NotificationsPage.jsx`, `src/pages/MyComplaintsPage.jsx` | **PASSED** |

*Complete acceptance checks and implementation details are documented in [USE_CASE_TRACEABILITY.md](./USE_CASE_TRACEABILITY.md).*

---

## 🔄 End-to-End Demonstration Walkthrough

Follow this 9-step sequence to demonstrate the entire lifecycle to examiners:

1. **Public Exploration**: Open `http://localhost:5000`. Test the interactive **AI Triage Playground** on the landing page (type *"Sparking breaker in robotics lab"*).
2. **Student Authentication**: Click **"Alex Rivera (Student)"** from the 1-click evaluation bar.
3. **Submit Campus Issue**:
   - Navigate to **"Report Issue"**.
   - Step 1: Select **"Electrical"** (or click *AI Auto-Detect*).
   - Step 2: Choose **Science Complex**, **Block B**, **1st Floor**, and room **Lab 104**. Enter detailed title and description.
   - Step 3: Select priority **Urgent** and optionally upload an image file.
   - Step 4: Review summary and click **Submit Official Report**.
4. **Instant Confirmation**: System renders the confirmation screen with the unique reference ID (e.g., `SCF-2026-1008`).
5. **Live Tracking**: Click **"Track Status & View Live Timeline"** to inspect the newly created complaint record and initial `Submitted` milestone.
6. **Admin Review & Triage**:
   - Use the navbar **Role Switcher** to switch to **"Dr. Evelyn Patel (Admin)"**.
   - Review live computed metrics on `/admin`.
   - Open **"Review & Assign"** workspace (`/admin/complaints`).
7. **Technician Dispatch**:
   - Find the newly reported issue and click **Assign**.
   - System presents the technician fleet with active workloads and specialty matches.
   - Select **Marcus Vance (Electrical Maintenance)** and confirm dispatch.
8. **Maintenance Execution & Status Update**:
   - Switch role to **"Marcus Vance (Staff)"**.
   - In `/staff`, observe the newly assigned task in the queue.
   - Open ticket details and click **"Begin Repair (Mark In Progress)"**.
   - Click **"Mark Work Completed & Resolved"** and submit technical resolution notes.
9. **Administrative Closure & History Verification**:
   - Switch back to Admin (or Student).
   - Click **"Confirm & Close Ticket"**.
   - Observe the complete, unbroken audit timeline showing every actor, role, timestamp, and remark.

---

## 🛠️ Technology Stack & Dependencies

- **Runtime**: Node.js v26.3.1 (ES Modules)
- **Database**: Native `node:sqlite` (SQLite 3.53.1)
- **Backend API**: Express 4.21, Multer 1.4 (file uploads), Bcryptjs 3.0 (password hashing), Jsonwebtoken 9.0 (session JWTs), Cors
- **Frontend SPA**: React 19, React Router DOM 7, Tailwind CSS 3.4, Lucide React icons
- **Build System**: Vite 6.2

---

## 📂 Project Directory Structure

```
Agile_project/
├── package.json               # Scripts, dependencies, and project metadata
├── vite.config.js             # Vite config with API & static proxy rules
├── tailwind.config.js         # Custom university palette and glow shadows
├── postcss.config.js          # Tailwind & Autoprefixer configuration
├── index.html                 # App shell with Plus Jakarta Sans typography
├── USE_CASE_TRACEABILITY.md   # Official US01–US13 matrix with verification status
├── README.md                  # Comprehensive implementation & evaluation guide
│
├── server/
│   ├── index.js               # Integrated server (Express REST API + static SPA)
│   ├── db.js                  # Native node:sqlite database & schema setup
│   ├── seed.js                # Realistic seed script for 5 users & 7 tickets
│   ├── middleware/
│   │   └── auth.js            # JWT verification & role clearance guards
│   ├── routes/
│   │   ├── auth.js            # Register, login, current profile, demo users
│   │   ├── complaints.js      # CRUD, assign, status update, resolve, close, duplicate
│   │   ├── staff.js           # Technician fleet list & availability toggle
│   │   ├── notifications.js   # Notification center endpoints (list, mark read)
│   │   ├── stats.js           # Real-time computed aggregations for dashboards
│   │   └── ai.js              # NLP heuristic triage & category/priority predictor
│   ├── data/
│   │   └── smart_campus.db    # Persistent SQLite database file
│   └── uploads/               # Persistent directory for complaint photos
│
├── src/
│   ├── main.jsx               # React DOM entrypoint
│   ├── App.jsx                # Route definitions & protected route guards
│   ├── index.css              # Custom styles, glassmorphism, scrollbars
│   ├── context/
│   │   ├── AuthContext.jsx    # Session management & 1-click demo accounts
│   │   └── ToastContext.jsx   # Toast notification alerts system
│   ├── data/
│   │   ├── categories.js      # 9 official categories & priority metadata
│   │   └── campusLocations.js # University buildings, blocks, and floors
│   ├── services/
│   │   └── api.js             # Centralized API client with JWT interception
│   ├── components/
│   │   ├── Navbar.jsx         # Role-aware responsive navigation with demo switcher
│   │   ├── Footer.jsx         # Campus emergency numbers & specifications
│   │   ├── ProtectedRoute.jsx # Role clearance verification guard
│   │   ├── StatusBadge.jsx    # Standardized color-coded status pills
│   │   ├── PriorityBadge.jsx  # Urgency labels & badges
│   │   └── Timeline.jsx       # Chronological vertical audit timeline
│   └── pages/
│       ├── LandingPage.jsx    # Hero, interactive AI playground, categories grid
│       ├── LoginPage.jsx      # Login form with 1-click evaluation cards
│       ├── RegisterPage.jsx   # Student & staff registration
│       ├── UserDashboard.jsx  # Student metrics, report CTA, recent reports
│       ├── ReportIssuePage.jsx# 4-step wizard with AI Triage & duplicate alerts
│       ├── ConfirmationPage.jsx # Success view with reference ID & actions
│       ├── MyComplaintsPage.jsx# Searchable, filterable list with table/card view
│       ├── ComplaintDetailPage.jsx # Full inspection, photo lightbox, action modals
│       ├── NotificationsPage.jsx # Live notification center
│       ├── AdminDashboard.jsx # Real computed facility metrics & fleet workload
│       ├── AdminComplaintsPage.jsx # Full complaint review & staff assignment
│       ├── StaffDashboard.jsx # Technician queue with duty availability toggle
│       ├── ProfilePage.jsx    # Profile settings & role switcher
│       └── NotFoundPage.jsx   # 404 recovery page
│
├── tests/
│   └── api.test.js            # Automated integration test suite
└── screenshots/               # Verified browser screenshots
    ├── 01_landing_desktop.png
    ├── 02_login_page.png
    ├── 03_student_dashboard.png
    ├── 04_report_form.png
    ├── 05_my_complaints.png
    ├── 06_complaint_detail.png
    ├── 07_notifications.png
    ├── 08_admin_dashboard.png
    ├── 09_admin_assign_workspace.png
    ├── 10_staff_dashboard.png
    └── mobile_landing.png
```

---

## 🔒 Security & Data Integrity

1. **Zero Plaintext Passwords**: All user passwords are encrypted using `bcryptjs` with salt rounds = 10.
2. **Server-Side Role Clearance**: Access to sensitive operations (`/api/complaints/:id/assign`, `/api/stats/admin`, etc.) is enforced via `requireRole(['admin'])` on the server.
3. **Data Isolation**: Campus students cannot access or inspect another student's private reports.
4. **Audit Trail Integrity**: When statuses transition or assignments change, past history records are preserved immutably.
5. **Disk File Validation**: File uploads are validated for MIME type (`image/jpeg`, `image/png`, `image/webp`) and capped at 5MB.

---

## 🎓 University Final Review Summary
- **Compliance**: 100% of the 13 fixed official user stories are implemented.
- **Runtimes & Verification**: All unit and API tests pass; UI has been visually verified across desktop and mobile screens.
- **Ready for Demo**: Live server is operational at `http://localhost:5000`.
