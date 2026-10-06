import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/technicians
export async function GET() {
  try {
    const technicians = await prisma.tECHNICIANS.findMany({
      include: {
        ASSIGNMENT: {
          include: {
            REQUESTS: true,
            WORK_LOG: true,
          },
        },
      },
      orderBy: { TechnicianID: 'asc' },
    });
    return NextResponse.json({ success: true, data: technicians });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/technicians - Add new technician
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { FirstName, LastName, Specialization } = body;

    if (!FirstName || !LastName || !Specialization) {
      return NextResponse.json(
        { success: false, error: 'FirstName, LastName, and Specialization are required' },
        { status: 400 }
      );
    }

    const created = await prisma.tECHNICIANS.create({
      data: {
        FirstName: FirstName.trim(),
        LastName: LastName.trim(),
        Specialization: Specialization.trim(),
        AvailabilityStatus: 'Available',
      },
    });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PATCH /api/technicians - Update status
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { TechnicianID, AvailabilityStatus } = body;

    if (!TechnicianID || !AvailabilityStatus) {
      return NextResponse.json(
        { success: false, error: 'TechnicianID and AvailabilityStatus required' },
        { status: 400 }
      );
    }

    const updated = await prisma.tECHNICIANS.update({
      where: { TechnicianID: Number(TechnicianID) },
      data: { AvailabilityStatus },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE /api/technicians?id=<TechnicianID>
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'TechnicianID is required' }, { status: 400 });
    }

    const techId = Number(id);

    // Cascade: delete work logs, then assignments, then the technician
    const assignments = await prisma.aSSIGNMENT.findMany({ where: { TechnicianID: techId } });
    for (const a of assignments) {
      await prisma.wORK_LOG.deleteMany({ where: { AssignmentID: a.AssignmentID } });
    }
    await prisma.aSSIGNMENT.deleteMany({ where: { TechnicianID: techId } });
    await prisma.tECHNICIANS.delete({ where: { TechnicianID: techId } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
