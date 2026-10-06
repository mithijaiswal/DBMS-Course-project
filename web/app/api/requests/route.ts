import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/requests - List requests with full relational data
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    const where: any = {};

    if (status && status !== 'all') {
      where.CurrentStatus = status;
    }
    if (priority && priority !== 'all') {
      where.PriorityID = parseInt(priority, 10);
    }
    if (category && category !== 'all') {
      where.CategoryID = parseInt(category, 10);
    }
    if (search) {
      where.OR = [
        { Description: { contains: search } },
        { USERS: { FirstName: { contains: search } } },
        { USERS: { LastName: { contains: search } } },
        { ROOMS: { RoomNumber: { contains: search } } },
      ];
    }

    const requests = await prisma.rEQUESTS.findMany({
      where,
      orderBy: { RequestID: 'desc' },
      include: {
        USERS: true,
        ROOMS: {
          include: {
            BUILDINGS: true,
          },
        },
        CATEGORIES: true,
        PRIORITY: true,
        ASSIGNMENT: {
          include: {
            TECHNICIANS: true,
            WORK_LOG: {
              orderBy: { LogID: 'desc' },
            },
          },
        },
        REQUEST_MATERIALS: {
          include: {
            MATERIALS: true,
          },
        },
        COST: {
          orderBy: { CostID: 'desc' },
        },
        FEEDBACK: true,
        STATUS_HISTORY: {
          orderBy: { StatusLogID: 'asc' },
        },
      },
    });

    return NextResponse.json({ success: true, data: requests });
  } catch (error: any) {
    console.error('Error fetching requests:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch requests' },
      { status: 500 }
    );
  }
}

// POST /api/requests - Create a new maintenance request
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { UserID, RoomID, CategoryID, PriorityID, Description } = body;

    if (!UserID || !RoomID || !CategoryID || !PriorityID || !Description?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Please provide all required fields: User, Room, Category, Priority, and Description' },
        { status: 400 }
      );
    }

    const today = new Date();

    // Atomic transaction: Insert request & log status history
    const newRequest = await prisma.$transaction(async (tx) => {
      const created = await tx.rEQUESTS.create({
        data: {
          UserID: Number(UserID),
          RoomID: Number(RoomID),
          CategoryID: Number(CategoryID),
          PriorityID: Number(PriorityID),
          Description: Description.trim(),
          DateSubmitted: today,
          CurrentStatus: 'Pending',
        },
      });

      await tx.sTATUS_HISTORY.create({
        data: {
          RequestID: created.RequestID,
          StatusChangeDate: today,
          PreviousStatus: null,
          NewStatus: 'Pending',
        },
      });

      return created;
    });

    // Fetch full created record with relations
    const fullRecord = await prisma.rEQUESTS.findUnique({
      where: { RequestID: newRequest.RequestID },
      include: {
        USERS: true,
        ROOMS: { include: { BUILDINGS: true } },
        CATEGORIES: true,
        PRIORITY: true,
      },
    });

    return NextResponse.json({ success: true, data: fullRecord }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating request:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create request' },
      { status: 500 }
    );
  }
}

// DELETE /api/requests - Delete a request with cascading cleanup across relational tables
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get('id');

    if (!idParam) {
      return NextResponse.json({ success: false, error: 'Missing request id' }, { status: 400 });
    }

    const requestId = parseInt(idParam, 10);

    const existing = await prisma.rEQUESTS.findUnique({
      where: { RequestID: requestId },
      include: {
        ASSIGNMENT: true,
      },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Request not found' }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      // Find all assignment IDs for this request
      const assignmentIds = existing.ASSIGNMENT.map((a) => a.AssignmentID);

      // 1. Delete WORK_LOG for these assignments
      if (assignmentIds.length > 0) {
        await tx.wORK_LOG.deleteMany({
          where: { AssignmentID: { in: assignmentIds } },
        });
      }

      // 2. Free up assigned technicians to 'Available'
      for (const asgn of existing.ASSIGNMENT) {
        await tx.tECHNICIANS.update({
          where: { TechnicianID: asgn.TechnicianID },
          data: { AvailabilityStatus: 'Available' },
        });
      }

      // 3. Delete assignments
      await tx.aSSIGNMENT.deleteMany({
        where: { RequestID: requestId },
      });

      // 4. Delete request materials
      await tx.rEQUEST_MATERIALS.deleteMany({
        where: { RequestID: requestId },
      });

      // 5. Delete cost
      await tx.cOST.deleteMany({
        where: { RequestID: requestId },
      });

      // 6. Delete feedback
      await tx.fEEDBACK.deleteMany({
        where: { RequestID: requestId },
      });

      // 7. Delete status history
      await tx.sTATUS_HISTORY.deleteMany({
        where: { RequestID: requestId },
      });

      // 8. Delete request itself
      await tx.rEQUESTS.delete({
        where: { RequestID: requestId },
      });
    });

    return NextResponse.json({
      success: true,
      message: `Request #${requestId} and all related records deleted successfully`,
      deletedId: requestId,
    });
  } catch (error: any) {
    console.error('Error deleting request:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete request' },
      { status: 500 }
    );
  }
}
