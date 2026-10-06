# Presentation-III: User Interface Demonstration Guide

**Project Title:** Campus Facility Maintenance Request Management System  
**Serial No:** 41  
**Learner:** Mithi Jaiswal (25WU0102158) - AIML Panthers  
**Co-Presenter:** Soumya Purohit (25WU0102272) - AIML Whales  
**Database:** MySQL (`campus_facility_management`)  
**Technology Stack:** Next.js 16 (Turbopack, React 19), Prisma ORM 6.4, TypeScript, Tailwind CSS  

---

## Live UI Demonstration Checklist (5 Marks Criteria)

According to the course project instructions, the presentation requires demonstrating three primary database operations live with real-time MySQL reflection:

### 1. Viewing of Records (Read & Relational Joins)
- **Dashboard Table:** Navigate to `http://localhost:3000`. Show the interactive table listing all active campus maintenance tickets.
- **Filtering & Search:** 
  - Filter by status (`Pending`, `Assigned`, `In Progress`, `Completed`).
  - Filter by priority SLA (`Critical`, `High`, `Medium`, `Low`).
  - Search by ticket number, room number, or requester name.
- **Detailed Inspection Drawer:** Click on any ticket (e.g. `#5001` or `#5004`). Show:
  - Submitter profile (`USERS`).
  - Facility & room mapping (`ROOMS` & `BUILDINGS`).
  - Assigned technician card (`TECHNICIANS` & `ASSIGNMENT`).
  - Logged labor history with hours spent (`WORK_LOG`).
  - Materials and spare parts consumed (`REQUEST_MATERIALS` & `MATERIALS`).
  - Total itemized expenditures (`COST`).
  - User satisfaction star rating and comments (`FEEDBACK`).
  - Chronological audit trail (`STATUS_HISTORY`).

### 2. Insertion of Records (Create & Relational Integrity)
- Click the **"Log Maintenance Request"** button in the header.
- Select:
  - Requester: *Mithi Jaiswal (Student)*
  - Room: *Room A101 - Academic Block A*
  - Category: *Electrical*
  - Priority: *Critical (4 Hours SLA)*
  - Description: *Emergency breaker sparking in Lab A101 during practical exam*
- Click **"Save Maintenance Ticket"**.
- Point out the success banner and note the newly created ticket at the top of the table.
- Demonstrate that the new record is immediately inserted into MySQL and the initial `STATUS_HISTORY` audit log entry is created.

### 3. Deletion of Records (Cascading Relational Cleanup)
- Select the newly created ticket or click the red trash icon on any test ticket.
- A confirmation dialog appears explaining the relational foreign key cascading cleanup.
- Click **"Confirm Delete (Live MySQL)"**.
- Show the success notification and the table updating in real time.
- Verify in MySQL terminal:
  ```sql
  SELECT * FROM REQUESTS WHERE Description LIKE '%emergency breaker%';
  ```
  The row and all dependent foreign key rows in child tables have been cleanly removed!

### 4. Demonstrating the 6 Analytical Reports
Navigate to the **"Analytics & Reports"** tab:
1. **Report 1 (Pending Ageing):** Displays aging buckets ($\le 3$ days, $4-7$ days, $>7$ days) and tickets approaching or exceeding SLA.
2. **Report 2 (SLA Compliance):** Shows resolution percentage per priority level.
3. **Report 3 (Technician Workload):** Ranks field technicians by active jobs and total hours logged.
4. **Report 4 (Building Maintenance Costs):** Visualizes maintenance expenditure by campus facility block in INR.
5. **Report 5 (Material Depletion):** Shows stock in hand and triggers low-stock warnings for inventory $< 40$ units.
6. **Report 6 (User Feedback):** Displays average rating (out of 5.0) and star distribution.

### 5. Demonstrating the Presentation-II Query Solution
Navigate to the **"Presentation-II SQL Console"** tab:
- Click **"Run Presentation-II Query"**.
- Show the execution timing ($<1\text{ ms}$) and the exact result for Ananya Rao:
  ```
  Category: Furniture | Priority: Medium | ResponseTime: 24 Hours | Status: Completed
  ```
- Use the interactive SQL textarea to run any live query requested by the faculty evaluators.
