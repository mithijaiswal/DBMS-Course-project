import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/requests/[id]/assign - Assign a technician to a request
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const requestId = parseInt(id, 10);
    const body = await req.json();
    const { TechnicianID } = body;

    if (!TechnicianID) {
      return NextResponse.json({ success: false, error: 'TechnicianID is required' }, { status: 400 });
    }

    const techId = parseInt(TechnicianID, 10);
    const request = await prisma.rEQUESTS.findUnique({
      where: { RequestID: requestId },
      include: { ASSIGNMENT: true },
    });

    if (!request) {
      return NextResponse.json({ success: false, error: 'Request not found' }, { status: 404 });
    }

    const technician = await prisma.tECHNICIANS.findUnique({
      where: { TechnicianID: techId },
    });

    if (!technician) {
      return NextResponse.json({ success: false, error: 'Technician not found' }, { status: 404 });
    }

    const today = new Date();

    await prisma.$transaction(async (tx) => {
      // 1. Create assignment record
      await tx.aSSIGNMENT.create({
        data: {
          RequestID: requestId,
          TechnicianID: techId,
          AssignmentDate: today,
          CompletionDate: null,
        },
      });

      // 2. Update technician status to 'Busy'
      await tx.tECHNICIANS.update({
        where: { TechnicianID: techId },
        data: { AvailabilityStatus: 'Busy' },
      });

      // 3. Update request status to 'Assigned' if it was 'Pending'
      if (request.CurrentStatus === 'Pending') {
        await tx.rEQUESTS.update({
          where: { RequestID: requestId },
          data: { CurrentStatus: 'Assigned' },
        });

        await tx.sTATUS_HISTORY.create({
          data: {
            RequestID: requestId,
            StatusChangeDate: today,
            PreviousStatus: 'Pending',
            NewStatus: 'Assigned',
          },
        });
      }
    });

    return NextResponse.json({
      success: true,
      message: `Technician ${technician.FirstName} ${technician.LastName} assigned successfully`,
    });
  } catch (error: any) {
    console.error('Error assigning technician:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to assign technician' },
      { status: 500 }
    );
  }
}
