import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/requests/[id]/worklog - Log technician work hours
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const requestId = parseInt(id, 10);
    const body = await req.json();
    const { AssignmentID, Description, HoursSpent } = body;

    if (!Description?.trim() || !HoursSpent) {
      return NextResponse.json(
        { success: false, error: 'Please provide work description and hours spent' },
        { status: 400 }
      );
    }

    const hours = parseFloat(HoursSpent);
    if (isNaN(hours) || hours <= 0) {
      return NextResponse.json({ success: false, error: 'Hours spent must be greater than 0' }, { status: 400 });
    }

    // Find assignment for this request
    let assignmentId = AssignmentID ? parseInt(AssignmentID, 10) : null;
    if (!assignmentId) {
      const latestAssignment = await prisma.aSSIGNMENT.findFirst({
        where: { RequestID: requestId },
        orderBy: { AssignmentID: 'desc' },
      });
      if (!latestAssignment) {
        return NextResponse.json(
          { success: false, error: 'No active assignment found for this request. Assign a technician first.' },
          { status: 400 }
        );
      }
      assignmentId = latestAssignment.AssignmentID;
    }

    const today = new Date();

    const result = await prisma.$transaction(async (tx) => {
      const log = await tx.wORK_LOG.create({
        data: {
          AssignmentID: assignmentId,
          LogEntryDate: today,
          Description: Description.trim(),
          HoursSpent: hours,
        },
      });

      // Update request status to 'In Progress' if it was 'Assigned'
      const request = await tx.rEQUESTS.findUnique({
        where: { RequestID: requestId },
      });

      if (request && request.CurrentStatus === 'Assigned') {
        await tx.rEQUESTS.update({
          where: { RequestID: requestId },
          data: { CurrentStatus: 'In Progress' },
        });

        await tx.sTATUS_HISTORY.create({
          data: {
            RequestID: requestId,
            StatusChangeDate: today,
            PreviousStatus: 'Assigned',
            NewStatus: 'In Progress',
          },
        });
      }

      return log;
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Error adding work log:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to add work log' },
      { status: 500 }
    );
  }
}
