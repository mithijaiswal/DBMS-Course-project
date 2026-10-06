-- ============================================================================
-- CAMPUS FACILITY MAINTENANCE REQUEST MANAGEMENT SYSTEM
-- DBMS Course Project: PBL Review II & III
-- Database Implementation: MySQL 8.x / 9.x
-- Author: Mithi Jaiswal (25WU0102158) - AIML Panthers
-- Institution: Woxsen University
-- ============================================================================

CREATE DATABASE IF NOT EXISTS campus_facility_management;
USE campus_facility_management;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS WORK_LOG;
DROP TABLE IF EXISTS ASSIGNMENT;
DROP TABLE IF EXISTS REQUEST_MATERIALS;
DROP TABLE IF EXISTS COST;
DROP TABLE IF EXISTS FEEDBACK;
DROP TABLE IF EXISTS STATUS_HISTORY;
DROP TABLE IF EXISTS REQUESTS;
DROP TABLE IF EXISTS ASSETS;
DROP TABLE IF EXISTS ROOMS;
DROP TABLE IF EXISTS BUILDINGS;
DROP TABLE IF EXISTS USERS;
DROP TABLE IF EXISTS TECHNICIANS;
DROP TABLE IF EXISTS MATERIALS;
DROP TABLE IF EXISTS CATEGORIES;
DROP TABLE IF EXISTS PRIORITY;
SET FOREIGN_KEY_CHECKS = 1;

-- ----------------------------------------------------------------------------
-- 1. BUILDINGS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE BUILDINGS (
  BuildingID INT NOT NULL AUTO_INCREMENT,
  Name VARCHAR(100) NOT NULL,
  Address VARCHAR(200) NOT NULL,
  CampusLocation VARCHAR(100) NOT NULL,
  PRIMARY KEY (BuildingID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- 2. ROOMS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE ROOMS (
  RoomID INT NOT NULL AUTO_INCREMENT,
  BuildingID INT NOT NULL,
  RoomNumber VARCHAR(20) NOT NULL,
  FloorLevel INT NOT NULL,
  PRIMARY KEY (RoomID),
  KEY (BuildingID),
  CONSTRAINT fk_rooms_building FOREIGN KEY (BuildingID) REFERENCES BUILDINGS (BuildingID) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- 3. USERS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE USERS (
  UserID INT NOT NULL AUTO_INCREMENT,
  FirstName VARCHAR(50) NOT NULL,
  LastName VARCHAR(50) NOT NULL,
  Email VARCHAR(100) NOT NULL UNIQUE,
  PhoneNumber VARCHAR(15) DEFAULT NULL,
  UserRole VARCHAR(30) NOT NULL,
  PRIMARY KEY (UserID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- 4. CATEGORIES TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE CATEGORIES (
  CategoryID INT NOT NULL AUTO_INCREMENT,
  CategoryName VARCHAR(50) NOT NULL UNIQUE,
  PRIMARY KEY (CategoryID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- 5. PRIORITY TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE PRIORITY (
  PriorityID INT NOT NULL AUTO_INCREMENT,
  LevelName VARCHAR(30) NOT NULL UNIQUE,
  ResponseTime VARCHAR(50) NOT NULL,
  PRIMARY KEY (PriorityID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- 6. ASSETS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE ASSETS (
  AssetID INT NOT NULL AUTO_INCREMENT,
  RoomID INT NOT NULL,
  AssetName VARCHAR(100) NOT NULL,
  Type VARCHAR(50) NOT NULL,
  PurchaseDate DATE DEFAULT NULL,
  Status VARCHAR(30) NOT NULL DEFAULT 'Working',
  PRIMARY KEY (AssetID),
  KEY (RoomID),
  CONSTRAINT fk_assets_room FOREIGN KEY (RoomID) REFERENCES ROOMS (RoomID) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- 7. TECHNICIANS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE TECHNICIANS (
  TechnicianID INT NOT NULL AUTO_INCREMENT,
  FirstName VARCHAR(50) NOT NULL,
  LastName VARCHAR(50) NOT NULL,
  Specialization VARCHAR(50) NOT NULL,
  AvailabilityStatus VARCHAR(30) NOT NULL DEFAULT 'Available',
  PRIMARY KEY (TechnicianID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- 8. MATERIALS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE MATERIALS (
  MaterialID INT NOT NULL AUTO_INCREMENT,
  MaterialName VARCHAR(100) NOT NULL,
  UnitCost DECIMAL(10, 2) NOT NULL CHECK (UnitCost >= 0),
  QuantityInStock INT NOT NULL CHECK (QuantityInStock >= 0),
  PRIMARY KEY (MaterialID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- 9. REQUESTS TABLE (Central Entity)
-- ----------------------------------------------------------------------------
CREATE TABLE REQUESTS (
  RequestID INT NOT NULL AUTO_INCREMENT,
  UserID INT NOT NULL,
  RoomID INT NOT NULL,
  CategoryID INT NOT NULL,
  PriorityID INT NOT NULL,
  Description VARCHAR(500) NOT NULL,
  DateSubmitted DATE NOT NULL,
  CurrentStatus VARCHAR(30) NOT NULL DEFAULT 'Pending',
  PRIMARY KEY (RequestID),
  KEY (UserID),
  KEY (RoomID),
  KEY (CategoryID),
  KEY (PriorityID),
  CONSTRAINT fk_requests_user FOREIGN KEY (UserID) REFERENCES USERS (UserID),
  CONSTRAINT fk_requests_room FOREIGN KEY (RoomID) REFERENCES ROOMS (RoomID),
  CONSTRAINT fk_requests_category FOREIGN KEY (CategoryID) REFERENCES CATEGORIES (CategoryID),
  CONSTRAINT fk_requests_priority FOREIGN KEY (PriorityID) REFERENCES PRIORITY (PriorityID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- 10. ASSIGNMENT TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE ASSIGNMENT (
  AssignmentID INT NOT NULL AUTO_INCREMENT,
  RequestID INT NOT NULL,
  TechnicianID INT NOT NULL,
  AssignmentDate DATE NOT NULL,
  CompletionDate DATE DEFAULT NULL,
  PRIMARY KEY (AssignmentID),
  KEY (RequestID),
  KEY (TechnicianID),
  CONSTRAINT fk_assignment_request FOREIGN KEY (RequestID) REFERENCES REQUESTS (RequestID) ON DELETE CASCADE,
  CONSTRAINT fk_assignment_technician FOREIGN KEY (TechnicianID) REFERENCES TECHNICIANS (TechnicianID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- 11. WORK_LOG TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE WORK_LOG (
  LogID INT NOT NULL AUTO_INCREMENT,
  AssignmentID INT NOT NULL,
  LogEntryDate DATE NOT NULL,
  Description VARCHAR(500) NOT NULL,
  HoursSpent DECIMAL(5, 2) NOT NULL CHECK (HoursSpent >= 0),
  PRIMARY KEY (LogID),
  KEY (AssignmentID),
  CONSTRAINT fk_worklog_assignment FOREIGN KEY (AssignmentID) REFERENCES ASSIGNMENT (AssignmentID) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- 12. REQUEST_MATERIALS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE REQUEST_MATERIALS (
  RequestID INT NOT NULL,
  MaterialID INT NOT NULL,
  QuantityUsed INT NOT NULL CHECK (QuantityUsed > 0),
  PRIMARY KEY (RequestID, MaterialID),
  KEY (MaterialID),
  CONSTRAINT fk_reqmat_request FOREIGN KEY (RequestID) REFERENCES REQUESTS (RequestID) ON DELETE CASCADE,
  CONSTRAINT fk_reqmat_material FOREIGN KEY (MaterialID) REFERENCES MATERIALS (MaterialID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- 13. COST TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE COST (
  CostID INT NOT NULL AUTO_INCREMENT,
  RequestID INT NOT NULL,
  CostType VARCHAR(50) NOT NULL,
  Amount DECIMAL(10, 2) NOT NULL CHECK (Amount >= 0),
  IncurredDate DATE NOT NULL,
  PRIMARY KEY (CostID),
  KEY (RequestID),
  CONSTRAINT fk_cost_request FOREIGN KEY (RequestID) REFERENCES REQUESTS (RequestID) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- 14. FEEDBACK TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE FEEDBACK (
  FeedbackID INT NOT NULL AUTO_INCREMENT,
  RequestID INT NOT NULL,
  Rating INT NOT NULL CHECK (Rating BETWEEN 1 AND 5),
  Comments VARCHAR(500) DEFAULT NULL,
  SubmissionDate DATE NOT NULL,
  PRIMARY KEY (FeedbackID),
  KEY (RequestID),
  CONSTRAINT fk_feedback_request FOREIGN KEY (RequestID) REFERENCES REQUESTS (RequestID) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- 15. STATUS_HISTORY TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE STATUS_HISTORY (
  StatusLogID INT NOT NULL AUTO_INCREMENT,
  RequestID INT NOT NULL,
  StatusChangeDate DATE NOT NULL,
  PreviousStatus VARCHAR(30) DEFAULT NULL,
  NewStatus VARCHAR(30) NOT NULL,
  PRIMARY KEY (StatusLogID),
  KEY (RequestID),
  CONSTRAINT fk_history_request FOREIGN KEY (RequestID) REFERENCES REQUESTS (RequestID) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- DATA INSERTION (Presentation-II Baseline + Campus Expansion)
-- ============================================================================

INSERT INTO BUILDINGS (BuildingID, Name, Address, CampusLocation) VALUES
(1, 'Academic Block A', 'Woxsen University Campus', 'Main Campus'),
(2, 'Hostel Block B', 'Woxsen University Campus', 'Residential Area'),
(3, 'Library Block', 'Woxsen University Campus', 'Central Campus'),
(4, 'Sports Complex', 'Woxsen University Campus', 'Sports Area'),
(5, 'Science & Innovation Complex', 'Woxsen University Campus', 'North Campus'),
(6, 'Student Activity Hub', 'Woxsen University Campus', 'Central Campus'),
(7, 'Executive Residences Block C', 'Woxsen University Campus', 'Residential Area');

INSERT INTO ROOMS (RoomID, BuildingID, RoomNumber, FloorLevel) VALUES
(101, 1, 'A101', 1),
(102, 1, 'A202', 2),
(103, 2, 'B105', 1),
(104, 3, 'L201', 2),
(105, 4, 'S101', 1),
(106, 1, 'A305', 3),
(107, 2, 'B204', 2),
(108, 3, 'L102', 1),
(109, 5, 'S201', 2),
(110, 5, 'S304', 3),
(111, 6, 'H101', 1),
(112, 7, 'C102', 1);

INSERT INTO USERS (UserID, FirstName, LastName, Email, PhoneNumber, UserRole) VALUES
(1, 'Mithi', 'Jaiswal', 'mithi@woxsen.edu.in', '9876543210', 'Student'),
(2, 'Riya', 'Sharma', 'riya@woxsen.edu.in', '9876543211', 'Student'),
(3, 'Arjun', 'Mehta', 'arjun@woxsen.edu.in', '9876543212', 'Faculty'),
(4, 'Ananya', 'Rao', 'ananya@woxsen.edu.in', '9876543213', 'Student'),
(5, 'Rahul', 'Verma', 'rahul@woxsen.edu.in', '9876543214', 'Faculty'),
(6, 'Siddharth', 'Sen', 'siddharth@woxsen.edu.in', '9876543215', 'Student'),
(7, 'Priya', 'Nair', 'priya@woxsen.edu.in', '9876543216', 'Staff'),
(8, 'Dr. Ramesh', 'K', 'ramesh@woxsen.edu.in', '9876543217', 'Faculty'),
(9, 'Sneha', 'Iyer', 'sneha@woxsen.edu.in', '9876543218', 'Student'),
(10, 'Vikram', 'Aditya', 'vikram.a@woxsen.edu.in', '9876543219', 'Facility Manager');

INSERT INTO CATEGORIES (CategoryID, CategoryName) VALUES
(1, 'Electrical'),
(2, 'Plumbing'),
(3, 'Furniture'),
(4, 'Internet'),
(5, 'Cleaning'),
(6, 'HVAC & Cooling'),
(7, 'Civil & Carpentry'),
(8, 'Audio-Visual');

INSERT INTO PRIORITY (PriorityID, LevelName, ResponseTime) VALUES
(1, 'Low', '48 Hours'),
(2, 'Medium', '24 Hours'),
(3, 'High', '12 Hours'),
(4, 'Critical', '4 Hours');

INSERT INTO ASSETS (AssetID, RoomID, AssetName, Type, PurchaseDate, Status) VALUES
(1001, 101, 'Air Conditioner', 'Electrical', '2024-06-15', 'Working'),
(1002, 101, 'Projector', 'Electronic', '2024-07-10', 'Needs Repair'),
(1003, 102, 'Ceiling Fan', 'Electrical', '2023-05-20', 'Working'),
(1004, 103, 'Water Cooler', 'Appliance', '2024-01-12', 'Working'),
(1005, 104, 'Printer', 'Electronic', '2023-11-05', 'Needs Repair'),
(1006, 106, 'High-Output HVAC Chiller', 'Mechanical', '2023-08-10', 'Working'),
(1007, 109, 'Digital Podium & Touchscreen', 'Audio-Visual', '2024-02-14', 'Working'),
(1008, 110, 'Server Rack 42U', 'IT Infrastructure', '2023-11-20', 'Working'),
(1009, 111, 'Heavy Duty Door Closer', 'Hardware', '2022-09-15', 'Needs Repair'),
(1010, 112, 'Solar Water Heater 300L', 'Heating', '2024-03-01', 'Working');

INSERT INTO TECHNICIANS (TechnicianID, FirstName, LastName, Specialization, AvailabilityStatus) VALUES
(201, 'Amit', 'Kumar', 'Electrical', 'Available'),
(202, 'Suresh', 'Reddy', 'Plumbing', 'Busy'),
(203, 'Neeraj', 'Sharma', 'Networking', 'Available'),
(204, 'Karan', 'Singh', 'Furniture', 'Available'),
(205, 'Vikram', 'Patel', 'General Maintenance', 'Busy'),
(206, 'Rajesh', 'Goud', 'Civil & Carpentry', 'Available'),
(207, 'Deepa', 'Sen', 'HVAC Specialist', 'Available'),
(208, 'Sunil', 'Rao', 'Audio-Visual', 'Busy');

INSERT INTO MATERIALS (MaterialID, MaterialName, UnitCost, QuantityInStock) VALUES
(301, 'Copper Wire', 250.00, 50),
(302, 'PVC Pipe', 120.00, 80),
(303, 'LED Bulb', 180.00, 100),
(304, 'Network Cable', 75.00, 150),
(305, 'Chair Wheel', 90.00, 60),
(306, 'Heavy Door Latch & Lockset', 320.00, 45),
(307, 'Cat6 Shielded RJ45 Jack', 45.00, 220),
(308, '32A Industrial MCB Switch', 420.00, 35),
(309, 'Brass Ball Valve 1-inch', 310.00, 40),
(310, 'Refrigerant Gas R410A (kg)', 850.00, 25);

INSERT INTO REQUESTS (RequestID, UserID, RoomID, CategoryID, PriorityID, Description, DateSubmitted, CurrentStatus) VALUES
(5001, 1, 101, 1, 3, 'Air conditioner is not cooling properly', '2026-09-01', 'Pending'),
(5002, 2, 102, 4, 2, 'Internet connection is unavailable', '2026-09-02', 'Assigned'),
(5003, 3, 103, 2, 4, 'Water leakage near washroom', '2026-09-03', 'In Progress'),
(5004, 4, 104, 3, 2, 'Broken chair needs replacement', '2026-09-04', 'Completed'),
(5005, 5, 105, 1, 1, 'Printer power issue', '2026-09-05', 'Pending'),
(5006, 6, 109, 8, 3, 'Interactive touch podium screen unresponsive during lecture', '2026-09-08', 'Assigned'),
(5007, 7, 107, 2, 2, 'Bathroom flush tank valve stuck causing water overflow', '2026-09-09', 'In Progress'),
(5008, 8, 106, 6, 4, 'Chiller sensor tripped causing overheating in server annex', '2026-09-10', 'Completed'),
(5009, 9, 111, 3, 1, 'Activity room bench leg loose and wobbling', '2026-09-11', 'Pending'),
(5010, 10, 108, 4, 3, 'Library 1st floor fiber link packet drop detected', '2026-09-12', 'Completed'),
(5011, 1, 101, 7, 2, 'Door latch alignment defect preventing secure room closure', '2026-09-13', 'In Progress'),
(5012, 3, 110, 1, 4, 'Laboratory 3-phase outlet sparking on load activation', '2026-09-14', 'Completed'),
(5013, 4, 102, 5, 1, 'Spilled chemical stain requires deep floor buffing', '2026-09-15', 'Pending'),
(5014, 6, 104, 8, 2, 'Ceiling speaker wire crackling during auditorium announcements', '2026-09-16', 'Completed'),
(5015, 2, 103, 2, 3, 'Main corridor drinking water fountain drain choked', '2026-09-17', 'Assigned');

INSERT INTO ASSIGNMENT (AssignmentID, RequestID, TechnicianID, AssignmentDate, CompletionDate) VALUES
(401, 5001, 201, '2026-09-02', NULL),
(402, 5002, 203, '2026-09-02', NULL),
(403, 5003, 202, '2026-09-03', NULL),
(404, 5004, 204, '2026-09-04', '2026-09-05'),
(405, 5005, 201, '2026-09-06', NULL),
(406, 5006, 208, '2026-09-08', NULL),
(407, 5007, 202, '2026-09-09', NULL),
(408, 5008, 207, '2026-09-10', '2026-09-11'),
(409, 5010, 203, '2026-09-12', '2026-09-13'),
(410, 5011, 206, '2026-09-13', NULL),
(411, 5012, 201, '2026-09-14', '2026-09-15'),
(412, 5014, 208, '2026-09-16', '2026-09-17'),
(413, 5015, 205, '2026-09-17', NULL);

INSERT INTO WORK_LOG (LogID, AssignmentID, LogEntryDate, Description, HoursSpent) VALUES
(601, 401, '2026-09-02', 'Inspected air conditioner and identified cooling issue', 1.50),
(602, 402, '2026-09-03', 'Checked network connection and replaced damaged cable', 2.00),
(603, 403, '2026-09-03', 'Inspected water leakage and replaced damaged pipe', 2.50),
(604, 404, '2026-09-04', 'Removed broken chair and installed replacement', 1.00),
(605, 405, '2026-09-06', 'Checked printer power connection', 1.50),
(606, 406, '2026-09-08', 'Diagnostic check on touchscreen controller board', 1.75),
(607, 407, '2026-09-09', 'Dismantled cistern flush assembly and replaced ball valve', 2.25),
(608, 408, '2026-09-10', 'Recharged refrigerant gas and recalibrated compressor safety relay', 3.50),
(609, 409, '2026-09-12', 'Spliced optical patch cord and tested 10G link throughput', 2.00),
(610, 410, '2026-09-13', 'Chiseled door frame recess and mounted new heavy latch', 1.50),
(611, 411, '2026-09-14', 'Isolated 3-phase distribution box and replaced burnt circuit breaker', 3.00),
(612, 412, '2026-09-16', 'Soldered audio snake line shield and eliminated line hum', 1.25);

INSERT INTO REQUEST_MATERIALS (RequestID, MaterialID, QuantityUsed) VALUES
(5001, 303, 2),
(5002, 304, 10),
(5003, 302, 5),
(5004, 305, 4),
(5005, 301, 3),
(5007, 309, 1),
(5008, 310, 2),
(5010, 307, 4),
(5011, 306, 1),
(5012, 308, 2);

INSERT INTO COST (CostID, RequestID, CostType, Amount, IncurredDate) VALUES
(701, 5001, 'Material', 360.00, '2026-09-02'),
(702, 5002, 'Material', 750.00, '2026-09-03'),
(703, 5003, 'Material', 600.00, '2026-09-03'),
(704, 5004, 'Material', 360.00, '2026-09-04'),
(705, 5005, 'Material', 750.00, '2026-09-06'),
(706, 5007, 'Material', 310.00, '2026-09-09'),
(707, 5008, 'Equipment & Material', 1700.00, '2026-09-10'),
(708, 5010, 'Networking', 180.00, '2026-09-12'),
(709, 5011, 'Hardware', 320.00, '2026-09-13'),
(710, 5012, 'Electrical Component', 840.00, '2026-09-14');

INSERT INTO FEEDBACK (FeedbackID, RequestID, Rating, Comments, SubmissionDate) VALUES
(801, 5004, 5, 'Issue was resolved quickly.', '2026-09-06'),
(802, 5002, 4, 'Technician was helpful.', '2026-09-07'),
(803, 5003, 5, 'Leakage was handled properly.', '2026-09-07'),
(804, 5008, 5, 'Server annex temperatures normalized immediately. Outstanding response!', '2026-09-11'),
(805, 5010, 4, 'Network connectivity is rock solid now. Thank you.', '2026-09-13'),
(806, 5012, 5, 'Safety risk averted rapidly. Great professionalism.', '2026-09-15'),
(807, 5014, 4, 'Audio interference resolved before guest lecture.', '2026-09-17');

INSERT INTO STATUS_HISTORY (StatusLogID, RequestID, StatusChangeDate, PreviousStatus, NewStatus) VALUES
(1, 5001, '2026-09-01', NULL, 'Pending'),
(2, 5002, '2026-09-02', 'Pending', 'Assigned'),
(3, 5003, '2026-09-03', 'Assigned', 'In Progress'),
(4, 5004, '2026-09-04', 'In Progress', 'Completed'),
(5, 5005, '2026-09-05', NULL, 'Pending'),
(6, 5006, '2026-09-08', 'Pending', 'Assigned'),
(7, 5007, '2026-09-09', 'Assigned', 'In Progress'),
(8, 5008, '2026-09-10', 'In Progress', 'Completed'),
(9, 5009, '2026-09-11', NULL, 'Pending'),
(10, 5010, '2026-09-12', 'In Progress', 'Completed'),
(11, 5011, '2026-09-13', 'Assigned', 'In Progress'),
(12, 5012, '2026-09-14', 'In Progress', 'Completed'),
(13, 5013, '2026-09-15', NULL, 'Pending'),
(14, 5014, '2026-09-16', 'In Progress', 'Completed'),
(15, 5015, '2026-09-17', 'Pending', 'Assigned');

-- ============================================================================
-- PRESENTATION-II EVALUATION QUERY SOLUTION
-- ============================================================================
-- Given during Presentation-II:
-- Retrieve category, priority, SLA response time, and current status
-- for all maintenance requests logged by user 'Ananya Rao'.

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
