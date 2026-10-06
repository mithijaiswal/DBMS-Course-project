import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedDatabase() {
  console.log('--- Starting Database Seeding ---');

  // Disable FK checks to safely clean existing records
  await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 0;');

  await prisma.wORK_LOG.deleteMany({});
  await prisma.aSSIGNMENT.deleteMany({});
  await prisma.rEQUEST_MATERIALS.deleteMany({});
  await prisma.cOST.deleteMany({});
  await prisma.fEEDBACK.deleteMany({});
  await prisma.sTATUS_HISTORY.deleteMany({});
  await prisma.rEQUESTS.deleteMany({});
  await prisma.aSSETS.deleteMany({});
  await prisma.rOOMS.deleteMany({});
  await prisma.bUILDINGS.deleteMany({});
  await prisma.uSERS.deleteMany({});
  await prisma.tECHNICIANS.deleteMany({});
  await prisma.mATERIALS.deleteMany({});
  await prisma.cATEGORIES.deleteMany({});
  await prisma.pRIORITY.deleteMany({});

  await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 1;');

  // 1. BUILDINGS
  const buildingsData = [
    { BuildingID: 1, Name: 'Academic Block A', Address: 'Woxsen University Campus', CampusLocation: 'Main Campus' },
    { BuildingID: 2, Name: 'Hostel Block B', Address: 'Woxsen University Campus', CampusLocation: 'Residential Area' },
    { BuildingID: 3, Name: 'Library Block', Address: 'Woxsen University Campus', CampusLocation: 'Central Campus' },
    { BuildingID: 4, Name: 'Sports Complex', Address: 'Woxsen University Campus', CampusLocation: 'Sports Area' },
    { BuildingID: 5, Name: 'Science & Innovation Complex', Address: 'Woxsen University Campus', CampusLocation: 'North Campus' },
    { BuildingID: 6, Name: 'Student Activity Hub', Address: 'Woxsen University Campus', CampusLocation: 'Central Campus' },
    { BuildingID: 7, Name: 'Executive Residences Block C', Address: 'Woxsen University Campus', CampusLocation: 'Residential Area' },
  ];
  for (const b of buildingsData) {
    await prisma.bUILDINGS.create({ data: b });
  }

  // 2. ROOMS
  const roomsData = [
    { RoomID: 101, BuildingID: 1, RoomNumber: 'A101', FloorLevel: 1 },
    { RoomID: 102, BuildingID: 1, RoomNumber: 'A202', FloorLevel: 2 },
    { RoomID: 103, BuildingID: 2, RoomNumber: 'B105', FloorLevel: 1 },
    { RoomID: 104, BuildingID: 3, RoomNumber: 'L201', FloorLevel: 2 },
    { RoomID: 105, BuildingID: 4, RoomNumber: 'S101', FloorLevel: 1 },
    { RoomID: 106, BuildingID: 1, RoomNumber: 'A305', FloorLevel: 3 },
    { RoomID: 107, BuildingID: 2, RoomNumber: 'B204', FloorLevel: 2 },
    { RoomID: 108, BuildingID: 3, RoomNumber: 'L102', FloorLevel: 1 },
    { RoomID: 109, BuildingID: 5, RoomNumber: 'S201', FloorLevel: 2 },
    { RoomID: 110, BuildingID: 5, RoomNumber: 'S304', FloorLevel: 3 },
    { RoomID: 111, BuildingID: 6, RoomNumber: 'H101', FloorLevel: 1 },
    { RoomID: 112, BuildingID: 7, RoomNumber: 'C102', FloorLevel: 1 },
  ];
  for (const r of roomsData) {
    await prisma.rOOMS.create({ data: r });
  }

  // 3. USERS (including Mithi Jaiswal, Riya Sharma, Arjun Mehta, Ananya Rao, Rahul Verma + extra)
  const usersData = [
    { UserID: 1, FirstName: 'Mithi', LastName: 'Jaiswal', Email: 'mithi@woxsen.edu.in', PhoneNumber: '9876543210', UserRole: 'Student' },
    { UserID: 2, FirstName: 'Riya', LastName: 'Sharma', Email: 'riya@woxsen.edu.in', PhoneNumber: '9876543211', UserRole: 'Student' },
    { UserID: 3, FirstName: 'Arjun', LastName: 'Mehta', Email: 'arjun@woxsen.edu.in', PhoneNumber: '9876543212', UserRole: 'Faculty' },
    { UserID: 4, FirstName: 'Ananya', LastName: 'Rao', Email: 'ananya@woxsen.edu.in', PhoneNumber: '9876543213', UserRole: 'Student' },
    { UserID: 5, FirstName: 'Rahul', LastName: 'Verma', Email: 'rahul@woxsen.edu.in', PhoneNumber: '9876543214', UserRole: 'Faculty' },
    { UserID: 6, FirstName: 'Soumya', LastName: 'Purohit', Email: 'soumya@woxsen.edu.in', PhoneNumber: '9876543215', UserRole: 'Student' },
    { UserID: 7, FirstName: 'Priya', LastName: 'Nair', Email: 'priya@woxsen.edu.in', PhoneNumber: '9876543216', UserRole: 'Staff' },
    { UserID: 8, FirstName: 'Dr. Ramesh', LastName: 'K', Email: 'ramesh@woxsen.edu.in', PhoneNumber: '9876543217', UserRole: 'Faculty' },
    { UserID: 9, FirstName: 'Sneha', LastName: 'Iyer', Email: 'sneha@woxsen.edu.in', PhoneNumber: '9876543218', UserRole: 'Student' },
    { UserID: 10, FirstName: 'Vikram', LastName: 'Aditya', Email: 'vikram.a@woxsen.edu.in', PhoneNumber: '9876543219', UserRole: 'Facility Manager' },
  ];
  for (const u of usersData) {
    await prisma.uSERS.create({ data: u });
  }

  // 4. CATEGORIES
  const categoriesData = [
    { CategoryID: 1, CategoryName: 'Electrical' },
    { CategoryID: 2, CategoryName: 'Plumbing' },
    { CategoryID: 3, CategoryName: 'Furniture' },
    { CategoryID: 4, CategoryName: 'Internet' },
    { CategoryID: 5, CategoryName: 'Cleaning' },
    { CategoryID: 6, CategoryName: 'HVAC & Cooling' },
    { CategoryID: 7, CategoryName: 'Civil & Carpentry' },
    { CategoryID: 8, CategoryName: 'Audio-Visual' },
  ];
  for (const c of categoriesData) {
    await prisma.cATEGORIES.create({ data: c });
  }

  // 5. PRIORITY
  const prioritiesData = [
    { PriorityID: 1, LevelName: 'Low', ResponseTime: '48 Hours' },
    { PriorityID: 2, LevelName: 'Medium', ResponseTime: '24 Hours' },
    { PriorityID: 3, LevelName: 'High', ResponseTime: '12 Hours' },
    { PriorityID: 4, LevelName: 'Critical', ResponseTime: '4 Hours' },
  ];
  for (const p of prioritiesData) {
    await prisma.pRIORITY.create({ data: p });
  }

  // 6. ASSETS
  const assetsData = [
    { AssetID: 1001, RoomID: 101, AssetName: 'Air Conditioner', Type: 'Electrical', PurchaseDate: new Date('2024-06-15'), Status: 'Working' },
    { AssetID: 1002, RoomID: 101, AssetName: 'Projector', Type: 'Electronic', PurchaseDate: new Date('2024-07-10'), Status: 'Needs Repair' },
    { AssetID: 1003, RoomID: 102, AssetName: 'Ceiling Fan', Type: 'Electrical', PurchaseDate: new Date('2023-05-20'), Status: 'Working' },
    { AssetID: 1004, RoomID: 103, AssetName: 'Water Cooler', Type: 'Appliance', PurchaseDate: new Date('2024-01-12'), Status: 'Working' },
    { AssetID: 1005, RoomID: 104, AssetName: 'Printer', Type: 'Electronic', PurchaseDate: new Date('2023-11-05'), Status: 'Needs Repair' },
    { AssetID: 1006, RoomID: 106, AssetName: 'High-Output HVAC Chiller', Type: 'Mechanical', PurchaseDate: new Date('2023-08-10'), Status: 'Working' },
    { AssetID: 1007, RoomID: 109, AssetName: 'Digital Podium & Touchscreen', Type: 'Audio-Visual', PurchaseDate: new Date('2024-02-14'), Status: 'Working' },
    { AssetID: 1008, RoomID: 110, AssetName: 'Server Rack 42U', Type: 'IT Infrastructure', PurchaseDate: new Date('2023-11-20'), Status: 'Working' },
    { AssetID: 1009, RoomID: 111, AssetName: 'Heavy Duty Door Closer', Type: 'Hardware', PurchaseDate: new Date('2022-09-15'), Status: 'Needs Repair' },
    { AssetID: 1010, RoomID: 112, AssetName: 'Solar Water Heater 300L', Type: 'Heating', PurchaseDate: new Date('2024-03-01'), Status: 'Working' },
  ];
  for (const a of assetsData) {
    await prisma.aSSETS.create({ data: a });
  }

  // 7. TECHNICIANS
  const techniciansData = [
    { TechnicianID: 201, FirstName: 'Amit', LastName: 'Kumar', Specialization: 'Electrical', AvailabilityStatus: 'Available' },
    { TechnicianID: 202, FirstName: 'Suresh', LastName: 'Reddy', Specialization: 'Plumbing', AvailabilityStatus: 'Busy' },
    { TechnicianID: 203, FirstName: 'Neeraj', LastName: 'Sharma', Specialization: 'Networking', AvailabilityStatus: 'Available' },
    { TechnicianID: 204, FirstName: 'Karan', LastName: 'Singh', Specialization: 'Furniture', AvailabilityStatus: 'Available' },
    { TechnicianID: 205, FirstName: 'Vikram', LastName: 'Patel', Specialization: 'General Maintenance', AvailabilityStatus: 'Busy' },
    { TechnicianID: 206, FirstName: 'Rajesh', LastName: 'Goud', Specialization: 'Civil & Carpentry', AvailabilityStatus: 'Available' },
    { TechnicianID: 207, FirstName: 'Deepa', LastName: 'Sen', Specialization: 'HVAC Specialist', AvailabilityStatus: 'Available' },
    { TechnicianID: 208, FirstName: 'Sunil', LastName: 'Rao', Specialization: 'Audio-Visual', AvailabilityStatus: 'Busy' },
  ];
  for (const t of techniciansData) {
    await prisma.tECHNICIANS.create({ data: t });
  }

  // 8. MATERIALS
  const materialsData = [
    { MaterialID: 301, MaterialName: 'Copper Wire', UnitCost: 250.00, QuantityInStock: 50 },
    { MaterialID: 302, MaterialName: 'PVC Pipe', UnitCost: 120.00, QuantityInStock: 80 },
    { MaterialID: 303, MaterialName: 'LED Bulb', UnitCost: 180.00, QuantityInStock: 100 },
    { MaterialID: 304, MaterialName: 'Network Cable', UnitCost: 75.00, QuantityInStock: 150 },
    { MaterialID: 305, MaterialName: 'Chair Wheel', UnitCost: 90.00, QuantityInStock: 60 },
    { MaterialID: 306, MaterialName: 'Heavy Door Latch & Lockset', UnitCost: 320.00, QuantityInStock: 45 },
    { MaterialID: 307, MaterialName: 'Cat6 Shielded RJ45 Jack', UnitCost: 45.00, QuantityInStock: 220 },
    { MaterialID: 308, MaterialName: '32A Industrial MCB Switch', UnitCost: 420.00, QuantityInStock: 35 },
    { MaterialID: 309, MaterialName: 'Brass Ball Valve 1-inch', UnitCost: 310.00, QuantityInStock: 40 },
    { MaterialID: 310, MaterialName: 'Refrigerant Gas R410A (kg)', UnitCost: 850.00, QuantityInStock: 25 },
  ];
  for (const m of materialsData) {
    await prisma.mATERIALS.create({ data: m });
  }

  // 9. REQUESTS (5001-5005 are EXACT presentation 2 data; 5006-5015 are realistic campus additions)
  const requestsData = [
    { RequestID: 5001, UserID: 1, RoomID: 101, CategoryID: 1, PriorityID: 3, Description: 'Air conditioner is not cooling properly', DateSubmitted: new Date('2026-09-01'), CurrentStatus: 'Pending' },
    { RequestID: 5002, UserID: 2, RoomID: 102, CategoryID: 4, PriorityID: 2, Description: 'Internet connection is unavailable', DateSubmitted: new Date('2026-09-02'), CurrentStatus: 'Assigned' },
    { RequestID: 5003, UserID: 3, RoomID: 103, CategoryID: 2, PriorityID: 4, Description: 'Water leakage near washroom', DateSubmitted: new Date('2026-09-03'), CurrentStatus: 'In Progress' },
    { RequestID: 5004, UserID: 4, RoomID: 104, CategoryID: 3, PriorityID: 2, Description: 'Broken chair needs replacement', DateSubmitted: new Date('2026-09-04'), CurrentStatus: 'Completed' },
    { RequestID: 5005, UserID: 5, RoomID: 105, CategoryID: 1, PriorityID: 1, Description: 'Printer power issue', DateSubmitted: new Date('2026-09-05'), CurrentStatus: 'Pending' },
    // Additional realistic requests
    { RequestID: 5006, UserID: 6, RoomID: 109, CategoryID: 8, PriorityID: 3, Description: 'Interactive touch podium screen unresponsive during lecture', DateSubmitted: new Date('2026-09-08'), CurrentStatus: 'Assigned' },
    { RequestID: 5007, UserID: 7, RoomID: 107, CategoryID: 2, PriorityID: 2, Description: 'Bathroom flush tank valve stuck causing water overflow', DateSubmitted: new Date('2026-09-09'), CurrentStatus: 'In Progress' },
    { RequestID: 5008, UserID: 8, RoomID: 106, CategoryID: 6, PriorityID: 4, Description: 'Chiller sensor tripped causing overheating in server annex', DateSubmitted: new Date('2026-09-10'), CurrentStatus: 'Completed' },
    { RequestID: 5009, UserID: 9, RoomID: 111, CategoryID: 3, PriorityID: 1, Description: 'Activity room bench leg loose and wobbling', DateSubmitted: new Date('2026-09-11'), CurrentStatus: 'Pending' },
    { RequestID: 5010, UserID: 10, RoomID: 108, CategoryID: 4, PriorityID: 3, Description: 'Library 1st floor fiber link packet drop detected', DateSubmitted: new Date('2026-09-12'), CurrentStatus: 'Completed' },
    { RequestID: 5011, UserID: 1, RoomID: 101, CategoryID: 7, PriorityID: 2, Description: 'Door latch alignment defect preventing secure room closure', DateSubmitted: new Date('2026-09-13'), CurrentStatus: 'In Progress' },
    { RequestID: 5012, UserID: 3, RoomID: 110, CategoryID: 1, PriorityID: 4, Description: 'Laboratory 3-phase outlet sparking on load activation', DateSubmitted: new Date('2026-09-14'), CurrentStatus: 'Completed' },
    { RequestID: 5013, UserID: 4, RoomID: 102, CategoryID: 5, PriorityID: 1, Description: 'Spilled chemical stain requires deep floor buffing', DateSubmitted: new Date('2026-09-15'), CurrentStatus: 'Pending' },
    { RequestID: 5014, UserID: 6, RoomID: 104, CategoryID: 8, PriorityID: 2, Description: 'Ceiling speaker wire crackling during auditorium announcements', DateSubmitted: new Date('2026-09-16'), CurrentStatus: 'Completed' },
    { RequestID: 5015, UserID: 2, RoomID: 103, CategoryID: 2, PriorityID: 3, Description: 'Main corridor drinking water fountain drain choked', DateSubmitted: new Date('2026-09-17'), CurrentStatus: 'Assigned' },
  ];
  for (const req of requestsData) {
    await prisma.rEQUESTS.create({ data: req });
  }

  // 10. ASSIGNMENTS
  const assignmentsData = [
    { AssignmentID: 401, RequestID: 5001, TechnicianID: 201, AssignmentDate: new Date('2026-09-02'), CompletionDate: null },
    { AssignmentID: 402, RequestID: 5002, TechnicianID: 203, AssignmentDate: new Date('2026-09-02'), CompletionDate: null },
    { AssignmentID: 403, RequestID: 5003, TechnicianID: 202, AssignmentDate: new Date('2026-09-03'), CompletionDate: null },
    { AssignmentID: 404, RequestID: 5004, TechnicianID: 204, AssignmentDate: new Date('2026-09-04'), CompletionDate: new Date('2026-09-05') },
    { AssignmentID: 405, RequestID: 5005, TechnicianID: 201, AssignmentDate: new Date('2026-09-06'), CompletionDate: null },
    // Additional assignments
    { AssignmentID: 406, RequestID: 5006, TechnicianID: 208, AssignmentDate: new Date('2026-09-08'), CompletionDate: null },
    { AssignmentID: 407, RequestID: 5007, TechnicianID: 202, AssignmentDate: new Date('2026-09-09'), CompletionDate: null },
    { AssignmentID: 408, RequestID: 5008, TechnicianID: 207, AssignmentDate: new Date('2026-09-10'), CompletionDate: new Date('2026-09-11') },
    { AssignmentID: 409, RequestID: 5010, TechnicianID: 203, AssignmentDate: new Date('2026-09-12'), CompletionDate: new Date('2026-09-13') },
    { AssignmentID: 410, RequestID: 5011, TechnicianID: 206, AssignmentDate: new Date('2026-09-13'), CompletionDate: null },
    { AssignmentID: 411, RequestID: 5012, TechnicianID: 201, AssignmentDate: new Date('2026-09-14'), CompletionDate: new Date('2026-09-15') },
    { AssignmentID: 412, RequestID: 5014, TechnicianID: 208, AssignmentDate: new Date('2026-09-16'), CompletionDate: new Date('2026-09-17') },
    { AssignmentID: 413, RequestID: 5015, TechnicianID: 205, AssignmentDate: new Date('2026-09-17'), CompletionDate: null },
  ];
  for (const asgn of assignmentsData) {
    await prisma.aSSIGNMENT.create({ data: asgn });
  }

  // 11. WORK_LOG
  const workLogsData = [
    { LogID: 601, AssignmentID: 401, LogEntryDate: new Date('2026-09-02'), Description: 'Inspected air conditioner and identified cooling issue', HoursSpent: 1.50 },
    { LogID: 602, AssignmentID: 402, LogEntryDate: new Date('2026-09-03'), Description: 'Checked network connection and replaced damaged cable', HoursSpent: 2.00 },
    { LogID: 603, AssignmentID: 403, LogEntryDate: new Date('2026-09-03'), Description: 'Inspected water leakage and replaced damaged pipe', HoursSpent: 2.50 },
    { LogID: 604, AssignmentID: 404, LogEntryDate: new Date('2026-09-04'), Description: 'Removed broken chair and installed replacement', HoursSpent: 1.00 },
    { LogID: 605, AssignmentID: 405, LogEntryDate: new Date('2026-09-06'), Description: 'Checked printer power connection', HoursSpent: 1.50 },
    { LogID: 606, AssignmentID: 406, LogEntryDate: new Date('2026-09-08'), Description: 'Diagnostic check on touchscreen controller board', HoursSpent: 1.75 },
    { LogID: 607, AssignmentID: 407, LogEntryDate: new Date('2026-09-09'), Description: 'Dismantled cistern flush assembly and replaced ball valve', HoursSpent: 2.25 },
    { LogID: 608, AssignmentID: 408, LogEntryDate: new Date('2026-09-10'), Description: 'Recharged refrigerant gas and recalibrated compressor safety relay', HoursSpent: 3.50 },
    { LogID: 609, AssignmentID: 409, LogEntryDate: new Date('2026-09-12'), Description: 'Spliced optical patch cord and tested 10G link throughput', HoursSpent: 2.00 },
    { LogID: 610, AssignmentID: 410, LogEntryDate: new Date('2026-09-13'), Description: 'Chiseled door frame recess and mounted new heavy latch', HoursSpent: 1.50 },
    { LogID: 611, AssignmentID: 411, LogEntryDate: new Date('2026-09-14'), Description: 'Isolated 3-phase distribution box and replaced burnt circuit breaker', HoursSpent: 3.00 },
    { LogID: 612, AssignmentID: 412, LogEntryDate: new Date('2026-09-16'), Description: 'Soldered audio snake line shield and eliminated line hum', HoursSpent: 1.25 },
  ];
  for (const wl of workLogsData) {
    await prisma.wORK_LOG.create({ data: wl });
  }

  // 12. REQUEST_MATERIALS
  const reqMaterialsData = [
    { RequestID: 5001, MaterialID: 303, QuantityUsed: 2 },
    { RequestID: 5002, MaterialID: 304, QuantityUsed: 10 },
    { RequestID: 5003, MaterialID: 302, QuantityUsed: 5 },
    { RequestID: 5004, MaterialID: 305, QuantityUsed: 4 },
    { RequestID: 5005, MaterialID: 301, QuantityUsed: 3 },
    { RequestID: 5007, MaterialID: 309, QuantityUsed: 1 },
    { RequestID: 5008, MaterialID: 310, QuantityUsed: 2 },
    { RequestID: 5010, MaterialID: 307, QuantityUsed: 4 },
    { RequestID: 5011, MaterialID: 306, QuantityUsed: 1 },
    { RequestID: 5012, MaterialID: 308, QuantityUsed: 2 },
  ];
  for (const rm of reqMaterialsData) {
    await prisma.rEQUEST_MATERIALS.create({ data: rm });
  }

  // 13. COST
  const costData = [
    { CostID: 701, RequestID: 5001, CostType: 'Material', Amount: 360.00, IncurredDate: new Date('2026-09-02') },
    { CostID: 702, RequestID: 5002, CostType: 'Material', Amount: 750.00, IncurredDate: new Date('2026-09-03') },
    { CostID: 703, RequestID: 5003, CostType: 'Material', Amount: 600.00, IncurredDate: new Date('2026-09-03') },
    { CostID: 704, RequestID: 5004, CostType: 'Material', Amount: 360.00, IncurredDate: new Date('2026-09-04') },
    { CostID: 705, RequestID: 5005, CostType: 'Material', Amount: 750.00, IncurredDate: new Date('2026-09-06') },
    { CostID: 706, RequestID: 5007, CostType: 'Material', Amount: 310.00, IncurredDate: new Date('2026-09-09') },
    { CostID: 707, RequestID: 5008, CostType: 'Equipment & Material', Amount: 1700.00, IncurredDate: new Date('2026-09-10') },
    { CostID: 708, RequestID: 5010, CostType: 'Networking', Amount: 180.00, IncurredDate: new Date('2026-09-12') },
    { CostID: 709, RequestID: 5011, CostType: 'Hardware', Amount: 320.00, IncurredDate: new Date('2026-09-13') },
    { CostID: 710, RequestID: 5012, CostType: 'Electrical Component', Amount: 840.00, IncurredDate: new Date('2026-09-14') },
  ];
  for (const cs of costData) {
    await prisma.cOST.create({ data: cs });
  }

  // 14. FEEDBACK
  const feedbackData = [
    { FeedbackID: 801, RequestID: 5004, Rating: 5, Comments: 'Issue was resolved quickly.', SubmissionDate: new Date('2026-09-06') },
    { FeedbackID: 802, RequestID: 5002, Rating: 4, Comments: 'Technician was helpful.', SubmissionDate: new Date('2026-09-07') },
    { FeedbackID: 803, RequestID: 5003, Rating: 5, Comments: 'Leakage was handled properly.', SubmissionDate: new Date('2026-09-07') },
    { FeedbackID: 804, RequestID: 5008, Rating: 5, Comments: 'Server annex temperatures normalized immediately. Outstanding response!', SubmissionDate: new Date('2026-09-11') },
    { FeedbackID: 805, RequestID: 5010, Rating: 4, Comments: 'Network connectivity is rock solid now. Thank you.', SubmissionDate: new Date('2026-09-13') },
    { FeedbackID: 806, RequestID: 5012, Rating: 5, Comments: 'Safety risk averted rapidly. Great professionalism.', SubmissionDate: new Date('2026-09-15') },
    { FeedbackID: 807, RequestID: 5014, Rating: 4, Comments: 'Audio interference resolved before guest lecture.', SubmissionDate: new Date('2026-09-17') },
  ];
  for (const fb of feedbackData) {
    await prisma.fEEDBACK.create({ data: fb });
  }

  // 15. STATUS_HISTORY
  const statusHistoryData = [
    { StatusLogID: 1, RequestID: 5001, StatusChangeDate: new Date('2026-09-01'), PreviousStatus: null, NewStatus: 'Pending' },
    { StatusLogID: 2, RequestID: 5002, StatusChangeDate: new Date('2026-09-02'), PreviousStatus: 'Pending', NewStatus: 'Assigned' },
    { StatusLogID: 3, RequestID: 5003, StatusChangeDate: new Date('2026-09-03'), PreviousStatus: 'Assigned', NewStatus: 'In Progress' },
    { StatusLogID: 4, RequestID: 5004, StatusChangeDate: new Date('2026-09-04'), PreviousStatus: 'In Progress', NewStatus: 'Completed' },
    { StatusLogID: 5, RequestID: 5005, StatusChangeDate: new Date('2026-09-05'), PreviousStatus: null, NewStatus: 'Pending' },
    { StatusLogID: 6, RequestID: 5006, StatusChangeDate: new Date('2026-09-08'), PreviousStatus: 'Pending', NewStatus: 'Assigned' },
    { StatusLogID: 7, RequestID: 5007, StatusChangeDate: new Date('2026-09-09'), PreviousStatus: 'Assigned', NewStatus: 'In Progress' },
    { StatusLogID: 8, RequestID: 5008, StatusChangeDate: new Date('2026-09-10'), PreviousStatus: 'In Progress', NewStatus: 'Completed' },
    { StatusLogID: 9, RequestID: 5009, StatusChangeDate: new Date('2026-09-11'), PreviousStatus: null, NewStatus: 'Pending' },
    { StatusLogID: 10, RequestID: 5010, StatusChangeDate: new Date('2026-09-12'), PreviousStatus: 'In Progress', NewStatus: 'Completed' },
    { StatusLogID: 11, RequestID: 5011, StatusChangeDate: new Date('2026-09-13'), PreviousStatus: 'Assigned', NewStatus: 'In Progress' },
    { StatusLogID: 12, RequestID: 5012, StatusChangeDate: new Date('2026-09-14'), PreviousStatus: 'In Progress', NewStatus: 'Completed' },
    { StatusLogID: 13, RequestID: 5013, StatusChangeDate: new Date('2026-09-15'), PreviousStatus: null, NewStatus: 'Pending' },
    { StatusLogID: 14, RequestID: 5014, StatusChangeDate: new Date('2026-09-16'), PreviousStatus: 'In Progress', NewStatus: 'Completed' },
    { StatusLogID: 15, RequestID: 5015, StatusChangeDate: new Date('2026-09-17'), PreviousStatus: 'Pending', NewStatus: 'Assigned' },
  ];
  for (const sh of statusHistoryData) {
    await prisma.sTATUS_HISTORY.create({ data: sh });
  }

  console.log('--- Successfully Seeded All 15 Tables! ---');
}

if (process.argv[1]?.endsWith('seed.ts')) {
  seedDatabase()
    .then(async () => {
      await prisma.$disconnect();
    })
    .catch(async (e) => {
      console.error(e);
      await prisma.$disconnect();
      process.exit(1);
    });
}
