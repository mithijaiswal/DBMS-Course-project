import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PATCH /api/requests/[id] - Update request status, description, or priority
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const requestId = parseInt(id, 10);
    const body = await req.json();
    const { CurrentStatus, PriorityID, Description } = body;

    const currentRequest = await prisma.rEQUESTS.findUnique({
      where: { RequestID: requestId },
      include: {
        ASSIGNMENT: true,
      },
    });

    if (!currentRequest) {
      return NextResponse.json({ success: false, error: 'Request not found' }, { status: 404 });
    }

    const today = new Date();
    const updateData: any = {};

    if (PriorityID) {
      updateData.PriorityID = Number(PriorityID);
    }
    if (Description) {
      updateData.Description = Description.trim();
    }

    // Status transition tracking
    if (CurrentStatus && CurrentStatus !== currentRequest.CurrentStatus) {
      updateData.CurrentStatus = CurrentStatus;

      await prisma.$transaction(async (tx) => {
        // Update request
        await tx.rEQUESTS.update({
          where: { RequestID: requestId },
          data: updateData,
        });

        // Insert into STATUS_HISTORY
        await tx.sTATUS_HISTORY.create({
          data: {
            RequestID: requestId,
            StatusChangeDate: today,
            PreviousStatus: currentRequest.CurrentStatus,
            NewStatus: CurrentStatus,
          },
        });

        // If status changed to Completed or Closed:
        if (CurrentStatus === 'Completed' || CurrentStatus === 'Closed') {
          // Set completion date on assignments
          for (const asgn of currentRequest.ASSIGNMENT) {
            if (!asgn.CompletionDate) {
              await tx.aSSIGNMENT.update({
                where: { AssignmentID: asgn.AssignmentID },
                data: { CompletionDate: today },
              });
            }
            // Release technician
            await tx.tECHNICIANS.update({
              where: { TechnicianID: asgn.TechnicianID },
              data: { AvailabilityStatus: 'Available' },
            });
          }
        }
      });
    } else {
      // Just updating priority or description
      await prisma.rEQUESTS.update({
        where: { RequestID: requestId },
        data: updateData,
      });
    }

    const updated = await prisma.rEQUESTS.findUnique({
      where: { RequestID: requestId },
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
        STATUS_HISTORY: true,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Error updating request:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update request' },
      { status: 500 }
    );
  }
}
