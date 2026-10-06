import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/analytics - All 6 mandatory DBMS course project reports
export async function GET() {
  try {
    const today = new Date();

    // 1. All requests with relations
    const allRequests = await prisma.rEQUESTS.findMany({
      include: {
        USERS: true,
        ROOMS: { include: { BUILDINGS: true } },
        CATEGORIES: true,
        PRIORITY: true,
        ASSIGNMENT: {
          include: {
            TECHNICIANS: true,
            WORK_LOG: true,
          },
        },
        REQUEST_MATERIALS: {
          include: { MATERIALS: true },
        },
        COST: true,
        FEEDBACK: true,
      },
    });

    // 2. High-level KPI counts
    const totalRequests = allRequests.length;
    const pendingCount = allRequests.filter((r) => r.CurrentStatus === 'Pending').length;
    const assignedCount = allRequests.filter((r) => r.CurrentStatus === 'Assigned').length;
    const inProgressCount = allRequests.filter((r) => r.CurrentStatus === 'In Progress').length;
    const completedCount = allRequests.filter(
      (r) => r.CurrentStatus === 'Completed' || r.CurrentStatus === 'Closed'
    ).length;

    // Total expenditure
    const allCosts = await prisma.cOST.findMany();
    const totalCost = allCosts.reduce((acc, c) => acc + Number(c.Amount), 0);

    // Total hours logged
    const allLogs = await prisma.wORK_LOG.findMany();
    const totalHoursLogged = allLogs.reduce((acc, l) => acc + Number(l.HoursSpent), 0);

    // --- REPORT 1: Pending Requests & Ageing ---
    const activeRequests = allRequests.filter(
      (r) => r.CurrentStatus !== 'Completed' && r.CurrentStatus !== 'Closed' && r.CurrentStatus !== 'Cancelled'
    );

    const pendingWithAgeing = activeRequests.map((r) => {
      const submitted = new Date(r.DateSubmitted);
      const diffTime = Math.abs(today.getTime() - submitted.getTime());
      const ageDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return {
        requestId: r.RequestID,
        user: `${r.USERS.FirstName} ${r.USERS.LastName}`,
        room: r.ROOMS.RoomNumber,
        building: r.ROOMS.BUILDINGS.Name,
        category: r.CATEGORIES.CategoryName,
        priority: r.PRIORITY.LevelName,
        status: r.CurrentStatus,
        dateSubmitted: r.DateSubmitted,
        ageDays,
        urgency: ageDays > 7 ? 'High Overdue' : ageDays > 3 ? 'Medium Aging' : 'Normal',
      };
    });

    const agingBuckets = {
      under3Days: pendingWithAgeing.filter((r) => r.ageDays <= 3).length,
      threeToSevenDays: pendingWithAgeing.filter((r) => r.ageDays > 3 && r.ageDays <= 7).length,
      over7Days: pendingWithAgeing.filter((r) => r.ageDays > 7).length,
    };

    // --- REPORT 2: Response Time & Priority SLA Performance ---
    const priorities = await prisma.pRIORITY.findMany();
    const priorityReport = priorities.map((p) => {
      const matchingReqs = allRequests.filter((r) => r.PriorityID === p.PriorityID);
      const completedInPriority = matchingReqs.filter(
        (r) => r.CurrentStatus === 'Completed' || r.CurrentStatus === 'Closed'
      );
      return {
        priorityId: p.PriorityID,
        levelName: p.LevelName,
        slaTarget: p.ResponseTime,
        totalTickets: matchingReqs.length,
        completedTickets: completedInPriority.length,
        completionRate: matchingReqs.length > 0
          ? Math.round((completedInPriority.length / matchingReqs.length) * 100)
          : 0,
      };
    });

    // --- REPORT 3: Technician Workload Analysis ---
    const technicians = await prisma.tECHNICIANS.findMany({
      include: {
        ASSIGNMENT: {
          include: {
            REQUESTS: true,
            WORK_LOG: true,
          },
        },
      },
    });

    const technicianReport = technicians.map((tech) => {
      const activeAssignments = tech.ASSIGNMENT.filter(
        (a) => !a.CompletionDate && a.REQUESTS.CurrentStatus !== 'Completed'
      );
      const completedAssignments = tech.ASSIGNMENT.filter(
        (a) => a.CompletionDate || a.REQUESTS.CurrentStatus === 'Completed'
      );
      const totalHours = tech.ASSIGNMENT.flatMap((a) => a.WORK_LOG).reduce(
        (acc, l) => acc + Number(l.HoursSpent),
        0
      );

      return {
        technicianId: tech.TechnicianID,
        name: `${tech.FirstName} ${tech.LastName}`,
        specialization: tech.Specialization,
        status: tech.AvailabilityStatus,
        activeTasks: activeAssignments.length,
        completedTasks: completedAssignments.length,
        totalHours: Math.round(totalHours * 10) / 10,
        workloadLevel:
          activeAssignments.length >= 2 ? 'Heavy' : activeAssignments.length === 1 ? 'Moderate' : 'Optimal',
      };
    });

    // --- REPORT 4: Building-wise Maintenance Costs ---
    const buildings = await prisma.bUILDINGS.findMany({
      include: {
        ROOMS: {
          include: {
            REQUESTS: {
              include: {
                COST: true,
              },
            },
          },
        },
      },
    });

    const buildingCostReport = buildings.map((b) => {
      let bTotalCost = 0;
      let bReqCount = 0;
      b.ROOMS.forEach((room) => {
        bReqCount += room.REQUESTS.length;
        room.REQUESTS.forEach((req) => {
          req.COST.forEach((c) => {
            bTotalCost += Number(c.Amount);
          });
        });
      });

      return {
        buildingId: b.BuildingID,
        buildingName: b.Name,
        campusLocation: b.CampusLocation,
        roomsCount: b.ROOMS.length,
        requestCount: bReqCount,
        totalCost: bTotalCost,
      };
    });

    // --- REPORT 5: Material Usage & Inventory Depletion ---
    const materials = await prisma.mATERIALS.findMany({
      include: {
        REQUEST_MATERIALS: true,
      },
    });

    const materialReport = materials.map((m) => {
      const totalUsed = m.REQUEST_MATERIALS.reduce((acc, rm) => acc + rm.QuantityUsed, 0);
      const totalValueConsumed = totalUsed * Number(m.UnitCost);
      return {
        materialId: m.MaterialID,
        materialName: m.MaterialName,
        unitCost: Number(m.UnitCost),
        quantityInStock: m.QuantityInStock,
        totalQuantityUsed: totalUsed,
        totalValueConsumed,
        isLowStock: m.QuantityInStock < 40,
      };
    });

    // --- REPORT 6: User Feedback & Satisfaction ---
    const feedbacks = await prisma.fEEDBACK.findMany({
      include: {
        REQUESTS: {
          include: {
            CATEGORIES: true,
          },
        },
      },
      orderBy: { FeedbackID: 'desc' },
    });

    const avgRating =
      feedbacks.length > 0
        ? (feedbacks.reduce((acc, f) => acc + f.Rating, 0) / feedbacks.length).toFixed(1)
        : '0.0';

    const ratingDistribution = {
      5: feedbacks.filter((f) => f.Rating === 5).length,
      4: feedbacks.filter((f) => f.Rating === 4).length,
      3: feedbacks.filter((f) => f.Rating === 3).length,
      2: feedbacks.filter((f) => f.Rating === 2).length,
      1: feedbacks.filter((f) => f.Rating === 1).length,
    };

    return NextResponse.json({
      success: true,
      data: {
        kpis: {
          totalRequests,
          pendingCount,
          assignedCount,
          inProgressCount,
          completedCount,
          totalCost,
          totalHoursLogged,
          avgRating,
          feedbackCount: feedbacks.length,
        },
        reports: {
          pendingAgeing: {
            list: pendingWithAgeing,
            buckets: agingBuckets,
          },
          prioritySLA: priorityReport,
          technicianLoad: technicianReport,
          buildingCost: buildingCostReport,
          materialUsage: materialReport,
          feedbackAnalysis: {
            average: avgRating,
            totalCount: feedbacks.length,
            distribution: ratingDistribution,
            feedbacks,
          },
        },
      },
    });
  } catch (error: any) {
    console.error('Error generating analytics:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate analytics' },
      { status: 500 }
    );
  }
}
