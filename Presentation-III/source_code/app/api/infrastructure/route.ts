import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/infrastructure - Return Buildings, Rooms with Assets
export async function GET() {
  try {
    const buildings = await prisma.bUILDINGS.findMany({
      include: {
        ROOMS: {
          include: {
            ASSETS: true,
            REQUESTS: {
              select: {
                RequestID: true,
                CurrentStatus: true,
              },
            },
          },
        },
      },
      orderBy: { BuildingID: 'asc' },
    });

    const assets = await prisma.aSSETS.findMany({
      include: {
        ROOMS: {
          include: {
            BUILDINGS: true,
          },
        },
      },
      orderBy: { AssetID: 'asc' },
    });

    return NextResponse.json({ success: true, data: { buildings, assets } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/infrastructure - Add a new building, room, or asset
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type } = body;

    if (type === 'building') {
      const { Name, Address, CampusLocation } = body;
      if (!Name || !CampusLocation) {
        return NextResponse.json(
          { success: false, error: 'Name and CampusLocation are required for building' },
          { status: 400 }
        );
      }

      const created = await prisma.bUILDINGS.create({
        data: {
          Name: Name.trim(),
          Address: Address ? Address.trim() : '',
          CampusLocation: CampusLocation.trim(),
        },
      });
      return NextResponse.json({ success: true, data: created }, { status: 201 });
    } else if (type === 'room') {
      const { BuildingID, RoomNumber, FloorLevel } = body;
      if (!BuildingID || !RoomNumber || FloorLevel === undefined) {
        return NextResponse.json(
          { success: false, error: 'BuildingID, RoomNumber, and FloorLevel are required for room' },
          { status: 400 }
        );
      }

      const created = await prisma.rOOMS.create({
        data: {
          BuildingID: Number(BuildingID),
          RoomNumber: RoomNumber.trim(),
          FloorLevel: parseInt(FloorLevel, 10),
        },
      });
      return NextResponse.json({ success: true, data: created }, { status: 201 });
    } else if (type === 'asset') {
      const { RoomID, AssetName, Type, Status, PurchaseDate } = body;
      if (!RoomID || !AssetName || !Type) {
        return NextResponse.json(
          { success: false, error: 'RoomID, AssetName, and Type are required for asset' },
          { status: 400 }
        );
      }

      const created = await prisma.aSSETS.create({
        data: {
          RoomID: Number(RoomID),
          AssetName: AssetName.trim(),
          Type: Type.trim(),
          PurchaseDate: PurchaseDate ? new Date(PurchaseDate) : new Date(),
          Status: Status || 'Working',
        },
      });
      return NextResponse.json({ success: true, data: created }, { status: 201 });
    }

    return NextResponse.json({ success: false, error: 'Invalid entity type' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PATCH /api/infrastructure - Update building, room, or asset
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { type } = body;

    if (type === 'building') {
      const { BuildingID, Name, Address, CampusLocation } = body;
      if (!BuildingID) {
        return NextResponse.json({ success: false, error: 'BuildingID is required' }, { status: 400 });
      }

      const updateData: any = {};
      if (Name !== undefined) updateData.Name = Name.trim();
      if (Address !== undefined) updateData.Address = Address.trim();
      if (CampusLocation !== undefined) updateData.CampusLocation = CampusLocation.trim();

      const updated = await prisma.bUILDINGS.update({
        where: { BuildingID: Number(BuildingID) },
        data: updateData,
      });
      return NextResponse.json({ success: true, data: updated });
    } else if (type === 'room') {
      const { RoomID, BuildingID, RoomNumber, FloorLevel } = body;
      if (!RoomID) {
        return NextResponse.json({ success: false, error: 'RoomID is required' }, { status: 400 });
      }

      const updateData: any = {};
      if (BuildingID !== undefined) updateData.BuildingID = Number(BuildingID);
      if (RoomNumber !== undefined) updateData.RoomNumber = RoomNumber.trim();
      if (FloorLevel !== undefined) updateData.FloorLevel = parseInt(FloorLevel, 10);

      const updated = await prisma.rOOMS.update({
        where: { RoomID: Number(RoomID) },
        data: updateData,
      });
      return NextResponse.json({ success: true, data: updated });
    } else if (type === 'asset') {
      const { AssetID, RoomID, AssetName, Type, Status, PurchaseDate } = body;
      if (!AssetID) {
        return NextResponse.json({ success: false, error: 'AssetID is required' }, { status: 400 });
      }

      const updateData: any = {};
      if (RoomID !== undefined) updateData.RoomID = Number(RoomID);
      if (AssetName !== undefined) updateData.AssetName = AssetName.trim();
      if (Type !== undefined) updateData.Type = Type.trim();
      if (Status !== undefined) updateData.Status = Status.trim();
      if (PurchaseDate !== undefined) {
        updateData.PurchaseDate = PurchaseDate ? new Date(PurchaseDate) : null;
      }

      const updated = await prisma.aSSETS.update({
        where: { AssetID: Number(AssetID) },
        data: updateData,
      });
      return NextResponse.json({ success: true, data: updated });
    }

    return NextResponse.json({ success: false, error: 'Invalid entity type' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE /api/infrastructure?type=<building|room|asset>&id=<ID>
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    if (!type || !id) {
      return NextResponse.json(
        { success: false, error: 'Both type and id query parameters are required' },
        { status: 400 }
      );
    }

    const numId = Number(id);

    if (type === 'asset') {
      await prisma.aSSETS.delete({ where: { AssetID: numId } });
      return NextResponse.json({ success: true });
    }

    if (type === 'room') {
      // Cascade delete all requests in this room
      const requests = await prisma.rEQUESTS.findMany({
        where: { RoomID: numId },
        select: { RequestID: true },
      });
      const requestIds = requests.map((r) => r.RequestID);

      if (requestIds.length > 0) {
        const assignments = await prisma.aSSIGNMENT.findMany({
          where: { RequestID: { in: requestIds } },
          select: { AssignmentID: true },
        });
        const assignmentIds = assignments.map((a) => a.AssignmentID);

        if (assignmentIds.length > 0) {
          await prisma.wORK_LOG.deleteMany({
            where: { AssignmentID: { in: assignmentIds } },
          });
        }
        await prisma.aSSIGNMENT.deleteMany({ where: { RequestID: { in: requestIds } } });
        await prisma.cOST.deleteMany({ where: { RequestID: { in: requestIds } } });
        await prisma.fEEDBACK.deleteMany({ where: { RequestID: { in: requestIds } } });
        await prisma.rEQUEST_MATERIALS.deleteMany({ where: { RequestID: { in: requestIds } } });
        await prisma.sTATUS_HISTORY.deleteMany({ where: { RequestID: { in: requestIds } } });
        await prisma.rEQUESTS.deleteMany({ where: { RequestID: { in: requestIds } } });
      }

      // Delete assets in this room
      await prisma.aSSETS.deleteMany({ where: { RoomID: numId } });

      // Delete the room
      await prisma.rOOMS.delete({ where: { RoomID: numId } });

      return NextResponse.json({ success: true });
    }

    if (type === 'building') {
      // Find all rooms in this building
      const rooms = await prisma.rOOMS.findMany({
        where: { BuildingID: numId },
        select: { RoomID: true },
      });
      const roomIds = rooms.map((r) => r.RoomID);

      if (roomIds.length > 0) {
        const requests = await prisma.rEQUESTS.findMany({
          where: { RoomID: { in: roomIds } },
          select: { RequestID: true },
        });
        const requestIds = requests.map((r) => r.RequestID);

        if (requestIds.length > 0) {
          const assignments = await prisma.aSSIGNMENT.findMany({
            where: { RequestID: { in: requestIds } },
            select: { AssignmentID: true },
          });
          const assignmentIds = assignments.map((a) => a.AssignmentID);

          if (assignmentIds.length > 0) {
            await prisma.wORK_LOG.deleteMany({
              where: { AssignmentID: { in: assignmentIds } },
            });
          }
          await prisma.aSSIGNMENT.deleteMany({ where: { RequestID: { in: requestIds } } });
          await prisma.cOST.deleteMany({ where: { RequestID: { in: requestIds } } });
          await prisma.fEEDBACK.deleteMany({ where: { RequestID: { in: requestIds } } });
          await prisma.rEQUEST_MATERIALS.deleteMany({ where: { RequestID: { in: requestIds } } });
          await prisma.sTATUS_HISTORY.deleteMany({ where: { RequestID: { in: requestIds } } });
          await prisma.rEQUESTS.deleteMany({ where: { RequestID: { in: requestIds } } });
        }

        // Delete all assets in these rooms
        await prisma.aSSETS.deleteMany({ where: { RoomID: { in: roomIds } } });

        // Delete all rooms
        await prisma.rOOMS.deleteMany({ where: { RoomID: { in: roomIds } } });
      }

      // Finally delete the building
      await prisma.bUILDINGS.delete({ where: { BuildingID: numId } });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: 'Invalid entity type' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
