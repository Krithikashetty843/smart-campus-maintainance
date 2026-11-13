# EduFix — Smart Campus Maintenance System

A modern, responsive, and fully functional **Smart Campus Maintenance & Incident Response System** engineered for colleges and universities. EduFix streamlines fault reporting for students, empowers faculty with departmental oversight, dispatches specialized maintenance technicians, and provides campus administrators with real-time operational analytics and QR-based facility management.

---

## 🛠️ Technology Stack

- **Frontend Framework:** React 18 with Vite
- **Styling:** Tailwind CSS with custom campus color palette
- **Routing & Role Protection:** React Router DOM v6
- **Icons:** Lucide React
- **Analytics & Visualizations:** Recharts (Category Bar Charts, Status Donut Charts, Building Hotspot Visualizers)
- **QR Code Engine:** `qrcode.react` (Placard Generation) & `html5-qrcode` (Live Camera Stream Scanning + Image Upload & Hackathon Simulator)
- **Data Persistence:** Browser `localStorage` with automated pre-seeded campus master data

---

## 🔑 Demo Accounts & Credentials

EduFix supports four distinct campus roles with role-based dashboard redirection and route protection:

| Role | Email | Password | Primary Capabilities |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@campus.edu` | `Admin@123` | Campus overview analytics, dispatch technician, manage tickets, provision users, manage QR codes, export CSV |
| **Student** | `student@campus.edu` | `Student@123` | File maintenance complaints, scan room QR codes, track tickets & audit logs, rate completed repairs |
| **Faculty** | `faculty.cs@campus.edu` | `Faculty@123` | Departmental facility oversight, log high-priority classroom/lab faults, generate room QR placards |
| **Staff (Electrician)** | `electrician@campus.edu` | `Staff@123` | View assigned electrical tasks, advance work status, log parts & time, upload completion photos |
| **Staff (Plumber)** | `plumber@campus.edu` | `Staff@123` | Plumbing & sanitary work orders, pipe repairs, leak isolation logs |
| **Staff (Network)** | `network@campus.edu` | `Staff@123` | Access points, switches, server room cabling, Wi-Fi maintenance |
| **Staff (General)** | `facilities@campus.edu` | `Staff@123` | Classroom furniture, doors, windows, housekeeping |

> **Tip for Hackathon Evaluators:** On the Login page, click any of the **"1-Click Hackathon Evaluator Login"** buttons to log in instantly without typing credentials!

---

## 🚀 Key Functional Modules

### 1. Multi-Role Authentication & Security
- **Role-Based Routing:** Protected routes prevent cross-role access (e.g., students cannot access `/admin` or `/staff`).
- **Student Registration:** Public registration is available for students with roll number, institutional email, and department.
- **Admin Provisioning:** Faculty and maintenance technician accounts cannot self-register; they are created and managed by Campus Administration in the User Accounts portal.
- **Prototype Guidance:** Transparent prototype disclaimer noting LocalStorage storage, with password recovery guidance modal.

### 2. Student Maintenance Portal
- **Complaint Submission:**
  - Category selection: *Electrical, Plumbing, Furniture, Cleaning, Laboratory Equipment, Classroom Maintenance, Internet and Network, Other*.
  - Campus location hierarchy: Building, Floor, Room Number (auto-fills when scanning QR).
  - Detailed description with evidence photo upload (JPG, PNG, JPEG validation, max 5MB, live preview).
  - **Automated Smart Priority Engine:** Evaluates category severity, hazard keywords (*fire, spark, smoke, burst, leak, short circuit*), and location criticality to compute priority (*Critical, High, Medium, Low*).
  - Generates unique complaint ticket IDs (e.g., `CMP-2026-XXXX`).
- **Ticket Tracking & Lifecycle Audit Log:**
  - Interactive status stepper: *Submitted → Assigned → In Progress → Resolved*.
  - Full audit trail with timestamps and technician remarks.
  - View technician contact details and work summary.
  - **5-Star Resolution Feedback:** Students can rate the resolution quality and submit comments once work is completed.

### 3. QR Code Reporting System
- **Central QR Registry (Admin & Faculty):**
  - Select Department, Building/Block, Floor, and Classroom/Lab.
  - Generates high-density QR code cards with campus branding and location details.
  - **Download PNG** or **Print Placards** directly for affixing outside classroom doors.
- **QR Code Scanner:**
  - Live device camera scanning with `html5-qrcode`.
  - Image file upload for photos of room placards.
  - **Hackathon Quick-Simulator:** 1-click preset buttons to simulate scanning different campus rooms (Lecture Hall A1, VLSI Design Lab, CNC Workshop, Library).
  - Automatically launches the complaint form with the room and building pre-selected.

### 4. Technician Field Operations Console
- **Personalized Work Orders Queue:**
  - Filter by status (*Assigned, In Progress, Resolved*).
  - Highlighting matching trade specialties (e.g., Electrician, Plumber).
- **Work Execution & Closure:**
  - Single-click action to transition ticket from *Assigned* to *In Progress*.
  - Add technician diagnosis notes and remarks.
  - Record materials/parts replaced and estimated repair time.
  - **Upload Work Completion Proof Photo** before marking resolved.

### 5. Campus Administration Operations Center
- **Executive Analytics (Recharts):**
  - Complaints by Category bar chart.
  - Status Distribution donut chart.
  - Campus Building Hotspots chart.
  - Resolution rate (%) and active workload counters.
- **Ticket Management:**
  - Filter by Status, Category, Priority, and Building.
  - Real-time search across ticket IDs, rooms, and student names.
  - Technician dispatch dropdown matching technicians by trade specialization.
  - **Export to CSV:** Download campus maintenance incident reports for spreadsheet analysis.
- **User Management:**
  - Provision new Faculty and Technician accounts with department, trade, and initial credentials.

---

## 🏃 Local Development & Execution

```bash
# 1. Navigate to the project directory
cd C:\Users\Krithika\.gemini\antigravity\scratch\smart-campus-maintenance

# 2. Install dependencies (already installed)
npm install

# 3. Start the local development server
npm run dev

# 4. Compile production build
npm run build
```

---

## 🔄 Prototype Reset Utility

To return the entire system to its initial factory seed data at any time:
1. Click the **Reset Demo Data** icon (↻) in the top navigation bar.
2. Confirm the reset prompt. All complaints, QR codes, and default users will be restored.
