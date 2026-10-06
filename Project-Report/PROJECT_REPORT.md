# DBMS COURSE PROJECT REPORT

## Design and Implementation of a Database Management System for Campus Facility Maintenance Request Management System

---

### 1. Cover Page Details
- **Project Title:** Design and Implementation of a Database Management System for Campus Facility Maintenance Request Management System
- **Project Serial Number:** 41
- **Student Name:** Mithi Jaiswal
- **Roll Number:** 25WU0102158
- **Section:** AIML Panthers
- **Course:** Database Management Systems (DBMS PBL)
- **Academic Year:** 2026–2027
- **Institution:** Woxsen University

---

### 2. Abstract
Managing infrastructure and facility maintenance requests in large university campuses poses complex operational hurdles. Traditional manual registers and ad-hoc communication cause slow response times, lost tickets, weak technician accountability, and inventory leakage. This project presents a relational Database Management System (RDBMS) paired with an industry-grade web application to modernize campus facility maintenance. The relational schema is modeled using Entity-Relationship (ER) diagrams and strictly normalized up to Third Normal Form (3NF). Built on MySQL with Prisma ORM and Next.js (TypeScript), the system supports comprehensive lifecycle tracking: multi-role user requests, automated SLA priority response mapping, technician load balancing, granular work logging, bill of materials tracking with stock reduction, financial cost accounting, user satisfaction feedback, and an audit trail via status history. The project demonstrates full relational data integrity, ACID transaction awareness, multi-table joins, analytical aggregate reporting, and an interactive SQL evaluation sandbox.

---

### 3. Introduction and Problem Statement
#### 3.1 Background
Educational institutions and residential campuses operate hundreds of classrooms, laboratories, sports facilities, auditoriums, and hostel blocks. Daily operations generate electrical, plumbing, HVAC, furniture, networking, and civil maintenance complaints.

#### 3.2 Problem Statement
Manual logbooks and fragmented spreadsheets fail to provide:
1. Unique, verifiable tracking of complaints.
2. Clear assignment and workload balancing for maintenance technicians.
3. Spare parts and inventory control, resulting in unchecked material costs.
4. SLA tracking and delay prevention.
5. Systematic data for preventative maintenance and campus facility budget planning.

The goal is to design, normalize (up to 3NF), and implement a relational database in MySQL that guarantees referential integrity, enforces business rules, supports analytical decision reports, and interfaces with a responsive, minimal user interface.

---

### 4. Objectives and Scope
#### 4.1 Objectives
- Design an Entity-Relationship (ER) model capturing 15 core entities.
- Convert the ER diagram into a relational database schema normalized to 3NF.
- Enforce primary keys, foreign keys, UNIQUE, NOT NULL, CHECK, and DEFAULT constraints.
- Implement business logic: unique request IDs, non-negative costs/materials, automated status history auditing, technician availability toggling, and stock deductions.
- Generate six meaningful analytical reports: Pending Ageing, SLA Compliance, Technician Load, Building Expenditure, Inventory Depletion, and User Satisfaction.
- Deliver an industry-grade web UI supporting insertion, deletion, viewing, and live SQL execution against the MySQL database.

#### 4.2 Scope
- Covered: Campus buildings, rooms, equipment assets, user roles (Student, Faculty, Staff, Admin), categories, SLA priorities, technicians, work assignments, labor logs, spare materials, cost accounting, status audit histories, and feedback ratings.
- Excluded: Long-term third-party vendor procurement contracts and external utility payments.

---

### 5. Software and Hardware Requirements
- **Database Engine:** MySQL 9.7 (InnoDB storage engine, UTF-8 unicode encoding)
- **ORM / Database Layer:** Prisma ORM 6.4 (Type-safe query engine and schema migrations)
- **Frontend / Fullstack Framework:** Next.js 16 (Turbopack, App Router, React 19)
- **Language / Runtime:** TypeScript 5.x, Bun runtime 1.4
- **Styling:** Vanilla CSS & Tailwind CSS (Custom warm pastel minimalist design palette)
- **Hardware Environment:** Apple Silicon M-Series / Any Modern POSIX/Windows machine (8 GB+ RAM, 2 GHz+ CPU)

---

### 6. Entity-Relationship (ER) Model
The conceptual schema comprises 15 relational entities:
- `BUILDINGS`: Campus infrastructure blocks.
- `ROOMS`: Rooms within buildings (`has` relationship).
- `ASSETS`: Fixed equipment located in rooms (`contains` relationship).
- `USERS`: Campus members filing maintenance complaints (`creates` relationship).
- `CATEGORIES`: Functional maintenance domains (`classifies` relationship).
- `PRIORITY`: Response time SLA tiers (`assigned to` relationship).
- `REQUESTS`: Central complaint entity (`hosts`, `creates`, `classifies`, `assigned to`).
- `TECHNICIANS`: Maintenance workforce.
- `ASSIGNMENT`: Dispatches technician to request (`assigned through`, `executed by`).
- `WORK_LOG`: Detailed labor hours logged (`generates` relationship).
- `MATERIALS`: Spare parts and inventory catalog.
- `REQUEST_MATERIALS`: Bill of materials consumed by tickets (`includes`, `uses`).
- `COST`: Financial vouchers incurred (`incurs` relationship).
- `FEEDBACK`: User ratings and comments (`receives` relationship).
- `STATUS_HISTORY`: Audit trail capturing every lifecycle state change.

---

### 7. Relational Schema & Normalization Analysis (Up to 3NF)

#### 7.1 First Normal Form (1NF)
A relation is in 1NF if all attribute values are atomic and there are no repeating groups.
- All column attributes contain scalar, indivisible data (e.g., `FirstName`, `LastName`, `Amount`, `DateSubmitted`).
- Repeating materials consumed for a request are decoupled into the associative entity `REQUEST_MATERIALS(RequestID, MaterialID, QuantityUsed)`.

#### 7.2 Second Normal Form (2NF)
A relation is in 2NF if it is in 1NF and every non-prime attribute is fully functionally dependent on the entire primary key.
- In `REQUEST_MATERIALS`, the primary key is composite: `(RequestID, MaterialID)`. The non-key attribute `QuantityUsed` depends on both `RequestID` and `MaterialID`. Material descriptive properties (`MaterialName`, `UnitCost`) do not depend on `RequestID` and are correctly isolated in the `MATERIALS` relation.
- All other relations use single-attribute surrogate primary keys, thus eliminating partial dependencies by definition.

#### 7.3 Third Normal Form (3NF)
A relation is in 3NF if it is in 2NF and no non-prime attribute is transitively dependent on the primary key ($X \rightarrow Y \rightarrow Z$).
- Location Normalization: `RoomID` determines `BuildingID`, which in turn determines `BuildingName` and `CampusLocation`. Moving `BuildingName` and `Address` into `BUILDINGS` eliminates the transitive dependency: $\text{RoomID} \rightarrow \text{BuildingID} \rightarrow \text{BuildingName}$.
- Request Normalization: `RequestID` determines `UserID`, `CategoryID`, and `PriorityID`. Requester attributes, category names, and SLA hours are maintained in their respective tables (`USERS`, `CATEGORIES`, `PRIORITY`), preventing transitive leakage into `REQUESTS`.
- Technician Normalization: Technician specialization and contact details reside in `TECHNICIANS`, not `ASSIGNMENT`.

---

### 8. Data Dictionary

| Table Name | Attribute | Data Type | Constraints | Description |
|---|---|---|---|---|
| **BUILDINGS** | BuildingID | INT | PRIMARY KEY, AUTO_INCREMENT | Unique building identifier |
| | Name | VARCHAR(100) | NOT NULL | Building name |
| | Address | VARCHAR(200) | NOT NULL | Physical street/campus address |
| | CampusLocation | VARCHAR(100) | NOT NULL | Campus geographical zone |
| **ROOMS** | RoomID | INT | PRIMARY KEY, AUTO_INCREMENT | Unique room identifier |
| | BuildingID | INT | NOT NULL, FK → BUILDINGS | Associated building |
| | RoomNumber | VARCHAR(20) | NOT NULL | Room code/number |
| | FloorLevel | INT | NOT NULL | Floor number |
| **USERS** | UserID | INT | PRIMARY KEY, AUTO_INCREMENT | Unique user identifier |
| | FirstName | VARCHAR(50) | NOT NULL | User first name |
| | LastName | VARCHAR(50) | NOT NULL | User last name |
| | Email | VARCHAR(100) | NOT NULL, UNIQUE | University email |
| | PhoneNumber | VARCHAR(15) | NULLABLE | Contact telephone |
| | UserRole | VARCHAR(30) | NOT NULL | Student, Faculty, Staff, Admin |
| **CATEGORIES**| CategoryID | INT | PRIMARY KEY, AUTO_INCREMENT | Unique category code |
| | CategoryName | VARCHAR(50) | NOT NULL, UNIQUE | Electrical, Plumbing, HVAC, etc. |
| **PRIORITY** | PriorityID | INT | PRIMARY KEY, AUTO_INCREMENT | Unique priority code |
| | LevelName | VARCHAR(30) | NOT NULL, UNIQUE | Low, Medium, High, Critical |
| | ResponseTime | VARCHAR(50) | NOT NULL | SLA target (e.g., 4 Hours, 24 Hours) |
| **ASSETS** | AssetID | INT | PRIMARY KEY, AUTO_INCREMENT | Equipment identifier |
| | RoomID | INT | NOT NULL, FK → ROOMS | Installed room location |
| | AssetName | VARCHAR(100) | NOT NULL | Equipment designation |
| | Type | VARCHAR(50) | NOT NULL | Electronics, Appliance, Hardware |
| | PurchaseDate | DATE | NULLABLE | Procurement date |
| | Status | VARCHAR(30) | NOT NULL, DEFAULT 'Working' | Working, Needs Repair |
| **TECHNICIANS**| TechnicianID | INT | PRIMARY KEY, AUTO_INCREMENT | Technician identifier |
| | FirstName | VARCHAR(50) | NOT NULL | First name |
| | LastName | VARCHAR(50) | NOT NULL | Last name |
| | Specialization | VARCHAR(50) | NOT NULL | Electrical, Plumbing, Networking, etc. |
| | AvailabilityStatus | VARCHAR(30) | NOT NULL, DEFAULT 'Available' | Available, Busy, On Leave |
| **MATERIALS** | MaterialID | INT | PRIMARY KEY, AUTO_INCREMENT | Inventory item SKU |
| | MaterialName | VARCHAR(100) | NOT NULL | Spare part name |
| | UnitCost | DECIMAL(10,2)| NOT NULL, CHECK (UnitCost >= 0) | Unit price in INR |
| | QuantityInStock | INT | NOT NULL, CHECK (Quantity >= 0) | Inventory stock on hand |
| **REQUESTS** | RequestID | INT | PRIMARY KEY, AUTO_INCREMENT | Unique maintenance ticket number |
| | UserID | INT | NOT NULL, FK → USERS | Ticket creator |
| | RoomID | INT | NOT NULL, FK → ROOMS | Incident location |
| | CategoryID | INT | NOT NULL, FK → CATEGORIES | Maintenance domain |
| | PriorityID | INT | NOT NULL, FK → PRIORITY | Assigned SLA priority |
| | Description | VARCHAR(500) | NOT NULL | Problem explanation |
| | DateSubmitted | DATE | NOT NULL | Complaint timestamp |
| | CurrentStatus | VARCHAR(30) | NOT NULL, DEFAULT 'Pending' | Pending, Assigned, In Progress, Completed |
| **ASSIGNMENT** | AssignmentID | INT | PRIMARY KEY, AUTO_INCREMENT | Work order identifier |
| | RequestID | INT | NOT NULL, FK → REQUESTS | Linked maintenance ticket |
| | TechnicianID | INT | NOT NULL, FK → TECHNICIANS | Assigned technician |
| | AssignmentDate| DATE | NOT NULL | Date work assigned |
| | CompletionDate| DATE | NULLABLE | Date completed |
| **WORK_LOG** | LogID | INT | PRIMARY KEY, AUTO_INCREMENT | Labor entry identifier |
| | AssignmentID | INT | NOT NULL, FK → ASSIGNMENT | Associated job assignment |
| | LogEntryDate | DATE | NOT NULL | Date labor executed |
| | Description | VARCHAR(500) | NOT NULL | Work actions carried out |
| | HoursSpent | DECIMAL(5,2) | NOT NULL, CHECK (HoursSpent >= 0) | Time spent in hours |
| **REQUEST_MATERIALS** | RequestID | INT | NOT NULL, PK, FK → REQUESTS | Associated ticket |
| | MaterialID | INT | NOT NULL, PK, FK → MATERIALS | Spare part used |
| | QuantityUsed | INT | NOT NULL, CHECK (QuantityUsed > 0) | Units consumed |
| **COST** | CostID | INT | PRIMARY KEY, AUTO_INCREMENT | Cost voucher identifier |
| | RequestID | INT | NOT NULL, FK → REQUESTS | Associated ticket |
| | CostType | VARCHAR(50) | NOT NULL | Material, Labor, Contractor |
| | Amount | DECIMAL(10,2)| NOT NULL, CHECK (Amount >= 0) | Voucher expenditure |
| | IncurredDate | DATE | NOT NULL | Date incurred |
| **FEEDBACK** | FeedbackID | INT | PRIMARY KEY, AUTO_INCREMENT | Feedback record identifier |
| | RequestID | INT | NOT NULL, FK → REQUESTS | Associated ticket |
| | Rating | INT | NOT NULL, CHECK (Rating BETWEEN 1 AND 5) | Star rating (1-5) |
| | Comments | VARCHAR(500) | NULLABLE | User remarks |
| | SubmissionDate| DATE | NOT NULL | Submission timestamp |
| **STATUS_HISTORY** | StatusLogID | INT | PRIMARY KEY, AUTO_INCREMENT | Audit row identifier |
| | RequestID | INT | NOT NULL, FK → REQUESTS | Associated ticket |
| | StatusChangeDate | DATE | NOT NULL | Date of transition |
| | PreviousStatus| VARCHAR(30) | NULLABLE | Prior state (NULL on creation) |
| | NewStatus | VARCHAR(30) | NOT NULL | Resulting state |

---

### 9. SQL Commands Used (DDL & DML)
Refer to `Presentation-II/database_setup.sql` for complete SQL commands including schema creation, foreign key constraints, and seed data.

---

### 10. Presentation-II Query Solution

#### 10.1 Query Specification
Retrieve the category, priority level name, response time SLA, and current status for all maintenance complaints logged by student **Ananya Rao**.

#### 10.2 SQL Query Statement
```sql
SELECT 
  c.CategoryName AS Category, 
  p.LevelName AS Priority, 
  p.ResponseTime, 
  r.CurrentStatus AS Status
FROM REQUESTS r
JOIN USERS u ON r.UserID = u.UserID
JOIN CATEGORIES c ON r.CategoryID = c.CategoryID
JOIN PRIORITY p ON r.PriorityID = p.PriorityID
WHERE u.FirstName = 'Ananya' AND u.LastName = 'Rao';
```

#### 10.3 Sample Output
```
+-----------+----------+--------------+-----------+
| Category  | Priority | ResponseTime | Status    |
+-----------+----------+--------------+-----------+
| Furniture | Medium   | 24 Hours     | Completed |
| Cleaning  | Low      | 48 Hours     | Pending   |
+-----------+----------+--------------+-----------+
```

---

### 11. UI Design & Features
The user interface was built using a minimal, warm pastel aesthetic:
1. **Maintenance Requests Dashboard:** Real-time searchable table with category, priority, and status filter pills, plus inline action triggers.
2. **Interactive Ticket Details & Audit Drawer:** Displays requester details, facility asset info, technician card, logged labor hours, spare materials consumed, itemized financial costs, and the complete audit timeline from `STATUS_HISTORY`.
3. **Log Maintenance Ticket Modal (Insertion of Records):** Inserts into `REQUESTS` and records the initial state in `STATUS_HISTORY`.
4. **Cascading Relational Delete (Deletion of Records):** Allows deleting a ticket while executing an atomic transaction that removes related work logs, assignments, costs, materials, and status histories.
5. **Technicians Roster & Workload Control:** Shows active assignments, logged hours, and availability status toggles.
6. **Spare Parts Inventory & Restocking:** Real-time stock counts, unit costs, and restock actions.
7. **Six Mandatory PBL Analytical Reports:**
   - Report 1: Pending Requests & Ageing Analysis.
   - Report 2: Response Time & Priority SLA Targets.
   - Report 3: Technician Workload & Assigned Hours.
   - Report 4: Building-wise Maintenance Expenditure.
   - Report 5: Material Usage & Inventory Depletion.
   - Report 6: User Feedback & Service Satisfaction.
8. **Interactive SQL Sandbox:** Allows professors to run custom SQL queries live against MySQL with execution timing and formatted tables.

---

### 12. Implementation Details
- **Architecture:** Client-Server model with Next.js App Router (Turbopack).
- **Backend API Routes:**
  - `/api/requests`: CRUD operations for requests.
  - `/api/requests/[id]/assign`: Technician assignment and status updates.
  - `/api/requests/[id]/worklog`: Labor entry logging in `WORK_LOG`.
  - `/api/requests/[id]/materials`: Stock deduction and automatic `COST` logging.
  - `/api/requests/[id]/feedback`: User feedback submission.
  - `/api/analytics`: Pre-aggregated SQL reports.
  - `/api/query`: Interactive raw SQL runner.
  - `/api/seed`: One-click database reseeding.
- **Data Integrity & Transactions:** Atomic operations using `prisma.$transaction` ensure consistency across multi-table updates.

---

### 13. Testing and Verification
| Test Case | Operation | Input | Expected Output | Status |
|---|---|---|---|---|
| TC-01 | Create Request | User: 1, Room: 101, Cat: 1, Prio: 3 | Record inserted into `REQUESTS`; initial status 'Pending' written to `STATUS_HISTORY` | PASSED |
| TC-02 | Assign Technician | Req: 5001, Tech: 201 | Row added to `ASSIGNMENT`; Tech set to 'Busy'; Ticket set to 'Assigned' | PASSED |
| TC-03 | Log Work Hours | Req: 5001, Hours: 2.5 | Entry written to `WORK_LOG`; Ticket updated to 'In Progress' | PASSED |
| TC-04 | Allocate Material | Req: 5001, Material: 301, Qty: 2 | Stock in `MATERIALS` decremented by 2; Cost added to `COST` | PASSED |
| TC-05 | Delete Request | Req: 5016 (Cascading) | Child rows in `WORK_LOG`, `ASSIGNMENT`, `COST`, `FEEDBACK`, `STATUS_HISTORY` deleted, then `REQUESTS` deleted | PASSED |
| TC-06 | Presentation-II Query | Filter: 'Ananya Rao' | Returns matching category, priority, response time, and status in <1ms | PASSED |

---

### 14. Conclusion & Future Enhancements
The Campus Facility Maintenance Request Management System provides an end-to-end database solution that replaces manual logs with structured relational tables normalized to 3NF. The application delivers real-time ticket tracking, automated status history auditing, inventory stock control, and executive analytics.

**Future Enhancements:**
- IoT sensor integration for automatic failure detection in HVAC and water supply lines.
- Mobile push notifications for field technicians.
- Predictive maintenance modeling based on historical asset breakdown frequencies.

---

### 15. References
- Elmasri, R., & Navathe, S. B. *Fundamentals of Database Systems*, 7th Edition. Pearson.
- Silberschatz, A., Korth, H. F., & Sudarshan, S. *Database System Concepts*, 7th Edition. McGraw-Hill.
- MySQL 9.x Reference Manual, Oracle Corporation.
- Prisma ORM Documentation (`https://www.prisma.io/docs`).

---

### 16. Appendix
- **GitHub Repository:** Public repository containing all presentations, SQL files, project report, and fullstack Next.js source code.
