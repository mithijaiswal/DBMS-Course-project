# Campus Facility Maintenance Request Management System

**Author:** Mithi Jaiswal  
**Roll Number:** 25WU0102158  
**Section:** AIML Panthers  
**Project Serial Number:** 41  
**Course:** Database Management Systems (DBMS Course Project)  
**Institution:** Woxsen University  

> **Project Description:**  
> A relational database management system normalized up to 3NF and fullstack web application for logging, assigning, tracking, and resolving campus facility maintenance requests across university infrastructure.

---

## Repository Structure (Per Course Project Guidelines)

```
DBMS-Course-Project/
├── Presentation-I/          # Problem Description presentation materials
│   └── DBMS review1.key
├── Presentation-II/         # ER diagram, SQL commands, terminal screenshots & Presentation-II query solution
│   ├── database_setup.sql   # Complete SQL DDL, DML, constraints & seed queries
│   ├── er diagram.png       # High-resolution conceptual ER diagram
│   ├── terminal ss1.png     # Database tables and SELECT verification
│   ├── terminal ss2.png     # Presentation-II query verification
│   └── terminal ss3.png     # SQL query output for Ananya Rao
├── Presentation-III/        # Fullstack User Interface demo, guide, and screen captures
│   └── README.md
├── Project-Report/          # Complete 16-section formal project report
│   └── PROJECT_REPORT.md
├── web/                     # Fullstack Next.js (TypeScript) + Prisma ORM + Tailwind web application
│   ├── app/                 # Next.js App Router (pages and API routes)
│   ├── components/          # Minimalist warm-pastel UI components
│   ├── prisma/              # Prisma schema definition & database seeder
│   └── lib/                 # Database client singleton
└── README.md                # Project metadata and quickstart instructions
```

---

## Technology Stack

- **Database:** MySQL 9.x / 8.x (InnoDB engine with referential integrity)
- **Object-Relational Mapping (ORM):** Prisma ORM 6.4
- **Web Framework:** Next.js 16 (Turbopack, App Router, React 19)
- **Language / Runtime:** TypeScript 5.x, Bun runtime 1.4 / Node.js
- **Styling:** Minimalist Warm Pastel Design System (Vanilla CSS + Tailwind CSS)

---

## Relational Database Architecture (15 Normalized Tables)

1. `BUILDINGS` — Campus physical infrastructure blocks.
2. `ROOMS` — Specific facilities and classrooms within buildings.
3. `ASSETS` — Fixed appliances, electronics, and furniture in rooms.
4. `USERS` — Students, faculty, and campus administrators.
5. `CATEGORIES` — Complaint domains (Electrical, Plumbing, HVAC, Furniture, etc.).
6. `PRIORITY` — SLA response time tiers (Low: 48h, Medium: 24h, High: 12h, Critical: 4h).
7. `REQUESTS` — Central maintenance ticket lifecycle entity.
8. `TECHNICIANS` — Field service workforce and specialization roster.
9. `ASSIGNMENT` — Work orders linking requests to technicians.
10. `WORK_LOG` — Itemized labor hours recorded by technicians.
11. `MATERIALS` — Master inventory catalog and unit pricing.
12. `REQUEST_MATERIALS` — Bill of materials consumed per maintenance ticket.
13. `COST` — Financial vouchers incurred for materials and service.
14. `FEEDBACK` — User satisfaction star rating (1–5) and remarks upon resolution.
15. `STATUS_HISTORY` — Chronological audit trail logging every lifecycle transition.

---

## Key Features & Business Rules Enforced

- **ACID Transaction Awareness:** Stock count decrements in `MATERIALS` while simultaneously recording in `REQUEST_MATERIALS` and logging itemized expenses in `COST`.
- **Status Audit Trail:** Automated entry in `STATUS_HISTORY` on every status transition (`Pending` → `Assigned` → `In Progress` → `Completed`).
- **Cascading Deletion:** Relational deletion cleans up associated work logs, assignments, materials, costs, and audit logs without foreign key violations.
- **6 Mandatory PBL Reports:**
  1. *Pending Requests & Ageing Analysis* (days elapsed calculation).
  2. *Response Time & Priority SLA Compliance*.
  3. *Technician Workload Analysis* (assigned tasks vs. logged hours).
  4. *Building-wise Maintenance Expenditure* (campus zone financial breakdown).
  5. *Material Utilization & Depletion Alerts* (low stock warnings).
  6. *User Feedback & Satisfaction Ratings*.
- **Presentation-II Query Verifier:** One-click execution and interactive SQL sandbox for testing queries live during evaluation.

---

## Quickstart Guide

### 1. Database Setup (MySQL)
Ensure MySQL is running on port 3306. Run the script:
```bash
mysql -u root < Presentation-II/database_setup.sql
```

### 2. Install Dependencies & Start Web Application
```bash
cd Presentation-III/source_code
bun install        # or npm install
bun run dev        # starts development server on http://localhost:3000
```

### 3. Re-seed Database
You can re-populate the database with the Presentation-II baseline and extended dataset anytime:
```bash
bun run prisma/seed.ts
# or click "Reset & Seed DB" in the web interface
```
