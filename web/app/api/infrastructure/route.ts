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

// POST /api/infrastructure - Add a new room or asset
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type } = body;

    if (type === 'asset') {
      const { RoomID, AssetName, Type, Status } = body;
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
          PurchaseDate: new Date(),
          Status: Status || 'Working',
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
    }

    return NextResponse.json({ success: false, error: 'Invalid entity type' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
