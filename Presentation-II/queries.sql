-- ============================================================================
-- CAMPUS FACILITY MAINTENANCE REQUEST MANAGEMENT SYSTEM
-- DBMS Course Project: PBL Review II
-- Database: MySQL (campus_facility_management)
-- Author: Mithi Jaiswal (25WU0102158) - AIML Panthers
-- Institution: Woxsen University
-- ============================================================================

USE campus_facility_management;

-- ============================================================================
-- SECTION 1: PRESENTATION-II EVALUATION QUERY
-- ============================================================================
-- Specification:
-- Retrieve the category, priority level name, response time SLA, and
-- current status for all maintenance complaints logged by student 'Ananya Rao'.

SELECT 
  c.CategoryName AS Category, 
  p.LevelName AS Priority, 
  p.ResponseTime AS SLAResponseTime, 
  r.CurrentStatus AS Status
FROM REQUESTS r
JOIN USERS u ON r.UserID = u.UserID
JOIN CATEGORIES c ON r.CategoryID = c.CategoryID
JOIN PRIORITY p ON r.PriorityID = p.PriorityID
WHERE u.FirstName = 'Ananya' AND u.LastName = 'Rao';


-- ============================================================================
-- SECTION 2: BASIC & FILTERED QUERIES (WHERE, ORDER BY, LIKE, IN)
-- ============================================================================

-- Query 2.1: Retrieve all active (unresolved) maintenance requests in FIFO order
SELECT 
  RequestID, 
  UserID, 
  RoomID, 
  Description, 
  DateSubmitted, 
  CurrentStatus
FROM REQUESTS
WHERE CurrentStatus IN ('Pending', 'Assigned', 'In Progress')
ORDER BY DateSubmitted ASC;

-- Query 2.2: Retrieve all Critical & High priority tickets requiring urgent SLA response
SELECT 
  r.RequestID, 
  r.Description, 
  p.LevelName AS Priority, 
  p.ResponseTime AS SLA, 
  r.CurrentStatus
FROM REQUESTS r
JOIN PRIORITY p ON r.PriorityID = p.PriorityID
WHERE p.LevelName IN ('Critical', 'High')
ORDER BY p.PriorityID ASC, r.DateSubmitted ASC;

-- Query 2.3: List all available technicians by specialization
SELECT 
  TechnicianID, 
  FirstName, 
  LastName, 
  Specialization, 
  AvailabilityStatus
FROM TECHNICIANS
WHERE AvailabilityStatus = 'Available'
ORDER BY Specialization ASC;

-- Query 2.4: Keyword search for plumbing / water leakage issues
SELECT 
  RequestID, 
  Description, 
  CurrentStatus, 
  DateSubmitted
FROM REQUESTS
WHERE Description LIKE '%leak%' 
   OR Description LIKE '%water%' 
   OR Description LIKE '%drain%' 
   OR Description LIKE '%choked%';


-- ============================================================================
-- SECTION 3: MULTI-TABLE RELATIONAL JOINS
-- ============================================================================

-- Query 3.1: Full Ticket Inspection (5-Table Join)
-- Displays requester info, physical building location, room, category, and priority
SELECT 
  r.RequestID,
  CONCAT(u.FirstName, ' ', u.LastName) AS RequesterName,
  u.Email AS RequesterEmail,
  b.Name AS BuildingName,
  b.CampusLocation,
  rm.RoomNumber,
  rm.FloorLevel,
  c.CategoryName AS Category,
  p.LevelName AS Priority,
  r.CurrentStatus AS Status,
  r.DateSubmitted
FROM REQUESTS r
JOIN USERS u ON r.UserID = u.UserID
JOIN ROOMS rm ON r.RoomID = rm.RoomID
JOIN BUILDINGS b ON rm.BuildingID = b.BuildingID
JOIN CATEGORIES c ON r.CategoryID = c.CategoryID
JOIN PRIORITY p ON r.PriorityID = p.PriorityID
ORDER BY r.RequestID DESC;

-- Query 3.2: Active Technician Work Orders & Assignments
-- Maps technician details to specific requests and assignment dates
SELECT 
  a.AssignmentID,
  a.RequestID,
  CONCAT(t.FirstName, ' ', t.LastName) AS AssignedTechnician,
  t.Specialization,
  r.CurrentStatus AS TicketStatus,
  r.Description AS ProblemSummary,
  a.AssignmentDate,
  a.CompletionDate
FROM ASSIGNMENT a
JOIN TECHNICIANS t ON a.TechnicianID = t.TechnicianID
JOIN REQUESTS r ON a.RequestID = r.RequestID
ORDER BY a.AssignmentDate DESC;

-- Query 3.3: Technician Labor Work Log with Ticket & Location Context
SELECT 
  wl.LogID,
  wl.AssignmentID,
  CONCAT(t.FirstName, ' ', t.LastName) AS Technician,
  b.Name AS Building,
  rm.RoomNumber,
  wl.Description AS LaborDetails,
  wl.HoursSpent,
  wl.LogEntryDate
FROM WORK_LOG wl
JOIN ASSIGNMENT a ON wl.AssignmentID = a.AssignmentID
JOIN TECHNICIANS t ON a.TechnicianID = t.TechnicianID
JOIN REQUESTS r ON a.RequestID = r.RequestID
JOIN ROOMS rm ON r.RoomID = rm.RoomID
JOIN BUILDINGS b ON rm.BuildingID = b.BuildingID
ORDER BY wl.LogEntryDate DESC;

-- Query 3.4: Fixed Asset Registry with Building and Room Location
SELECT 
  ast.AssetID,
  ast.AssetName,
  ast.Type AS AssetCategory,
  ast.Status AS OperationalStatus,
  rm.RoomNumber,
  b.Name AS BuildingName,
  b.CampusLocation,
  ast.PurchaseDate
FROM ASSETS ast
JOIN ROOMS rm ON ast.RoomID = rm.RoomID
JOIN BUILDINGS b ON rm.BuildingID = b.BuildingID
ORDER BY b.Name ASC, rm.RoomNumber ASC;

-- Query 3.5: Spare Material Usage Per Ticket with Financial Costs
SELECT 
  rm.RequestID,
  m.MaterialName,
  rm.QuantityUsed,
  m.UnitCost,
  (rm.QuantityUsed * m.UnitCost) AS TotalLineCost,
  r.CurrentStatus AS TicketStatus
FROM REQUEST_MATERIALS rm
JOIN MATERIALS m ON rm.MaterialID = m.MaterialID
JOIN REQUESTS r ON rm.RequestID = r.RequestID
ORDER BY rm.RequestID ASC;


-- ============================================================================
-- SECTION 4: AGGREGATE QUERIES & GROUP BY SUMMARIES
-- ============================================================================

-- Query 4.1: Building-wise Ticket Volume and Total Maintenance Expenditure
SELECT 
  b.BuildingID,
  b.Name AS BuildingName,
  b.CampusLocation,
  COUNT(DISTINCT r.RequestID) AS TotalComplaints,
  COALESCE(SUM(co.Amount), 0) AS TotalExpenditure_INR
FROM BUILDINGS b
LEFT JOIN ROOMS rm ON b.BuildingID = rm.BuildingID
LEFT JOIN REQUESTS r ON rm.RoomID = r.RoomID
LEFT JOIN COST co ON r.RequestID = co.RequestID
GROUP BY b.BuildingID, b.Name, b.CampusLocation
ORDER BY TotalExpenditure_INR DESC;

-- Query 4.2: Technician Performance Workload (Total Jobs & Hours Logged)
SELECT 
  t.TechnicianID,
  CONCAT(t.FirstName, ' ', t.LastName) AS TechnicianName,
  t.Specialization,
  t.AvailabilityStatus,
  COUNT(DISTINCT a.AssignmentID) AS AssignedTickets,
  COALESCE(SUM(wl.HoursSpent), 0) AS TotalHoursLogged,
  ROUND(COALESCE(AVG(wl.HoursSpent), 0), 2) AS AvgHoursPerLog
FROM TECHNICIANS t
LEFT JOIN ASSIGNMENT a ON t.TechnicianID = a.TechnicianID
LEFT JOIN WORK_LOG wl ON a.AssignmentID = wl.AssignmentID
GROUP BY t.TechnicianID, t.FirstName, t.LastName, t.Specialization, t.AvailabilityStatus
ORDER BY TotalHoursLogged DESC;

-- Query 4.3: Category-wise Ticket Breakdown & Average User Feedback Rating
SELECT 
  c.CategoryID,
  c.CategoryName,
  COUNT(r.RequestID) AS TotalTickets,
  ROUND(AVG(f.Rating), 2) AS AvgSatisfactionRating,
  COUNT(f.FeedbackID) AS TotalFeedbackCount
FROM CATEGORIES c
LEFT JOIN REQUESTS r ON c.CategoryID = r.CategoryID
LEFT JOIN FEEDBACK f ON r.RequestID = f.RequestID
GROUP BY c.CategoryID, c.CategoryName
ORDER BY TotalTickets DESC;

-- Query 4.4: Spare Material Stock Consumption & Inventory Depletion
SELECT 
  m.MaterialID,
  m.MaterialName,
  m.UnitCost,
  m.QuantityInStock AS CurrentStock,
  COALESCE(SUM(rm.QuantityUsed), 0) AS TotalUnitsConsumed,
  COALESCE(SUM(rm.QuantityUsed * m.UnitCost), 0) AS TotalMaterialSpent_INR
FROM MATERIALS m
LEFT JOIN REQUEST_MATERIALS rm ON m.MaterialID = rm.MaterialID
GROUP BY m.MaterialID, m.MaterialName, m.UnitCost, m.QuantityInStock
ORDER BY TotalUnitsConsumed DESC;

-- Query 4.5: Request Volume and Resolution Summary by Current Status
SELECT 
  CurrentStatus,
  COUNT(*) AS TicketCount,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM REQUESTS), 1) AS PercentageOfTotal
FROM REQUESTS
GROUP BY CurrentStatus
ORDER BY TicketCount DESC;


-- ============================================================================
-- SECTION 5: SUBQUERIES & NESTED QUERIES
-- ============================================================================

-- Query 5.1: Technicians who have worked more hours than the campus average
SELECT 
  t.TechnicianID,
  CONCAT(t.FirstName, ' ', t.LastName) AS TechnicianName,
  t.Specialization,
  SUM(wl.HoursSpent) AS TotalHoursWorked
FROM TECHNICIANS t
JOIN ASSIGNMENT a ON t.TechnicianID = a.TechnicianID
JOIN WORK_LOG wl ON a.AssignmentID = wl.AssignmentID
GROUP BY t.TechnicianID, t.FirstName, t.LastName, t.Specialization
HAVING SUM(wl.HoursSpent) > (
  SELECT AVG(TechTotal) FROM (
    SELECT SUM(wl2.HoursSpent) AS TechTotal
    FROM ASSIGNMENT a2
    JOIN WORK_LOG wl2 ON a2.AssignmentID = wl2.AssignmentID
    GROUP BY a2.TechnicianID
  ) AS AvgSub
);

-- Query 5.2: Tickets whose total maintenance cost exceeds the average ticket cost
SELECT 
  r.RequestID,
  r.Description,
  r.CurrentStatus,
  SUM(co.Amount) AS TicketCost
FROM REQUESTS r
JOIN COST co ON r.RequestID = co.RequestID
GROUP BY r.RequestID, r.Description, r.CurrentStatus
HAVING SUM(co.Amount) > (
  SELECT AVG(TotalReqCost) FROM (
    SELECT SUM(Amount) AS TotalReqCost 
    FROM COST 
    GROUP BY RequestID
  ) AS CostSub
)
ORDER BY TicketCost DESC;

-- Query 5.3: Campus rooms that have registered repeated maintenance issues (>1 complaint)
SELECT 
  rm.RoomID,
  rm.RoomNumber,
  b.Name AS BuildingName,
  COUNT(r.RequestID) AS ComplaintCount
FROM ROOMS rm
JOIN BUILDINGS b ON rm.BuildingID = b.BuildingID
JOIN REQUESTS r ON rm.RoomID = r.RoomID
GROUP BY rm.RoomID, rm.RoomNumber, b.Name
HAVING COUNT(r.RequestID) > 1
ORDER BY ComplaintCount DESC;

-- Query 5.4: Spare parts with low inventory stock (below overall average stock level)
SELECT 
  MaterialID, 
  MaterialName, 
  QuantityInStock, 
  UnitCost
FROM MATERIALS
WHERE QuantityInStock < (SELECT AVG(QuantityInStock) FROM MATERIALS)
ORDER BY QuantityInStock ASC;

-- Query 5.5: Users who have NOT logged any maintenance requests (Clean track record)
SELECT 
  u.UserID, 
  CONCAT(u.FirstName, ' ', u.LastName) AS UserName, 
  u.Email, 
  u.UserRole
FROM USERS u
WHERE NOT EXISTS (
  SELECT 1 FROM REQUESTS r WHERE r.UserID = u.UserID
);


-- ============================================================================
-- SECTION 6: MANDATORY PBL COURSE PROJECT ANALYTICAL REPORTS
-- ============================================================================

-- Report 1: Pending Requests & Ageing Analysis
-- Calculates overdue days from submission date to current date
SELECT 
  r.RequestID,
  CONCAT(u.FirstName, ' ', u.LastName) AS Submitter,
  b.Name AS Building,
  rm.RoomNumber,
  c.CategoryName AS Category,
  p.LevelName AS Priority,
  r.CurrentStatus,
  r.DateSubmitted,
  DATEDIFF(CURRENT_DATE, r.DateSubmitted) AS AgeDays,
  CASE 
    WHEN DATEDIFF(CURRENT_DATE, r.DateSubmitted) > 7 THEN 'Critical Overdue (>7 days)'
    WHEN DATEDIFF(CURRENT_DATE, r.DateSubmitted) > 3 THEN 'Medium Aging (3-7 days)'
    ELSE 'Recent (<=3 days)'
  END AS UrgencyClassification
FROM REQUESTS r
JOIN USERS u ON r.UserID = u.UserID
JOIN ROOMS rm ON r.RoomID = rm.RoomID
JOIN BUILDINGS b ON rm.BuildingID = b.BuildingID
JOIN CATEGORIES c ON r.CategoryID = c.CategoryID
JOIN PRIORITY p ON r.PriorityID = p.PriorityID
WHERE r.CurrentStatus IN ('Pending', 'Assigned', 'In Progress')
ORDER BY AgeDays DESC;

-- Report 2: Priority SLA Compliance and Resolution Performance
SELECT 
  p.PriorityID,
  p.LevelName AS PriorityLevel,
  p.ResponseTime AS SLATarget,
  COUNT(r.RequestID) AS TotalTickets,
  SUM(CASE WHEN r.CurrentStatus = 'Completed' THEN 1 ELSE 0 END) AS ResolvedTickets,
  SUM(CASE WHEN r.CurrentStatus <> 'Completed' THEN 1 ELSE 0 END) AS OpenTickets,
  ROUND(
    (SUM(CASE WHEN r.CurrentStatus = 'Completed' THEN 1 ELSE 0 END) * 100.0) / 
    NULLIF(COUNT(r.RequestID), 0), 1
  ) AS ResolutionRate_Pct
FROM PRIORITY p
LEFT JOIN REQUESTS r ON p.PriorityID = r.PriorityID
GROUP BY p.PriorityID, p.LevelName, p.ResponseTime
ORDER BY p.PriorityID ASC;

-- Report 3: Technician Utilization & Logged Labor Cost Analysis
SELECT 
  t.TechnicianID,
  CONCAT(t.FirstName, ' ', t.LastName) AS Technician,
  t.Specialization,
  COUNT(DISTINCT a.AssignmentID) AS CompletedJobs,
  COALESCE(SUM(wl.HoursSpent), 0) AS TotalHours,
  COALESCE(SUM(wl.HoursSpent * 200.00), 0) AS EstLaborValue_INR
FROM TECHNICIANS t
LEFT JOIN ASSIGNMENT a ON t.TechnicianID = a.TechnicianID
LEFT JOIN WORK_LOG wl ON a.AssignmentID = wl.AssignmentID
GROUP BY t.TechnicianID, t.FirstName, t.LastName, t.Specialization
ORDER BY TotalHours DESC;

-- Report 4: Financial Expenditure Breakdown by Cost Type
SELECT 
  CostType,
  COUNT(*) AS VoucherCount,
  SUM(Amount) AS TotalAmount_INR,
  ROUND(AVG(Amount), 2) AS AvgCostPerVoucher_INR,
  ROUND(SUM(Amount) * 100.0 / (SELECT SUM(Amount) FROM COST), 1) AS PctOfTotalBudget
FROM COST
GROUP BY CostType
ORDER BY TotalAmount_INR DESC;

-- Report 5: Top 5 Most Frequently Maintained Campus Rooms
SELECT 
  b.Name AS BuildingName,
  rm.RoomNumber,
  COUNT(r.RequestID) AS TicketCount,
  COALESCE(SUM(co.Amount), 0) AS IncurredRepairCost_INR
FROM ROOMS rm
JOIN BUILDINGS b ON rm.BuildingID = b.BuildingID
JOIN REQUESTS r ON rm.RoomID = r.RoomID
LEFT JOIN COST co ON r.RequestID = co.RequestID
GROUP BY b.Name, rm.RoomNumber
ORDER BY TicketCount DESC, IncurredRepairCost_INR DESC
LIMIT 5;

-- Report 6: User Satisfaction and Feedback Distribution
SELECT 
  Rating,
  COUNT(*) AS FeedbackCount,
  REPEAT('★', Rating) AS Stars,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM FEEDBACK), 1) AS Percentage
FROM FEEDBACK
GROUP BY Rating
ORDER BY Rating DESC;


-- ============================================================================
-- SECTION 7: REPORTING DATABASE VIEWS (DDL)
-- ============================================================================

-- View 1: Active Maintenance Tickets Overview
CREATE OR REPLACE VIEW vw_ActiveTicketsSummary AS
SELECT 
  r.RequestID,
  CONCAT(u.FirstName, ' ', u.LastName) AS Requester,
  b.Name AS Building,
  rm.RoomNumber,
  c.CategoryName AS Category,
  p.LevelName AS Priority,
  r.CurrentStatus AS Status,
  r.DateSubmitted
FROM REQUESTS r
JOIN USERS u ON r.UserID = u.UserID
JOIN ROOMS rm ON r.RoomID = rm.RoomID
JOIN BUILDINGS b ON rm.BuildingID = b.BuildingID
JOIN CATEGORIES c ON r.CategoryID = c.CategoryID
JOIN PRIORITY p ON r.PriorityID = p.PriorityID
WHERE r.CurrentStatus IN ('Pending', 'Assigned', 'In Progress');

-- View 2: Technician Workload Snapshot
CREATE OR REPLACE VIEW vw_TechnicianWorkload AS
SELECT 
  t.TechnicianID,
  CONCAT(t.FirstName, ' ', t.LastName) AS Technician,
  t.Specialization,
  t.AvailabilityStatus,
  COUNT(DISTINCT a.AssignmentID) AS TotalAssignments,
  COALESCE(SUM(wl.HoursSpent), 0) AS TotalHoursSpent
FROM TECHNICIANS t
LEFT JOIN ASSIGNMENT a ON t.TechnicianID = a.TechnicianID
LEFT JOIN WORK_LOG wl ON a.AssignmentID = wl.AssignmentID
GROUP BY t.TechnicianID, t.FirstName, t.LastName, t.Specialization, t.AvailabilityStatus;

-- View 3: Building-wise Expenditure Overview
CREATE OR REPLACE VIEW vw_BuildingExpenditure AS
SELECT 
  b.BuildingID,
  b.Name AS BuildingName,
  b.CampusLocation,
  COUNT(DISTINCT r.RequestID) AS TotalRequests,
  COALESCE(SUM(co.Amount), 0) AS TotalCost_INR
FROM BUILDINGS b
LEFT JOIN ROOMS rm ON b.BuildingID = rm.BuildingID
LEFT JOIN REQUESTS r ON rm.RoomID = r.RoomID
LEFT JOIN COST co ON r.RequestID = co.RequestID
GROUP BY b.BuildingID, b.Name, b.CampusLocation;

-- Verification query on newly created views:
-- SELECT * FROM vw_ActiveTicketsSummary LIMIT 5;
-- SELECT * FROM vw_TechnicianWorkload;
-- SELECT * FROM vw_BuildingExpenditure;
