import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/meta - Lookup references for forms and dropdowns
export async function GET() {
  try {
    const [users, buildings, rooms, categories, priorities, technicians, materials, assets] =
      await Promise.all([
        prisma.uSERS.findMany({
          orderBy: { FirstName: 'asc' },
        }),
        prisma.bUILDINGS.findMany({
          orderBy: { BuildingID: 'asc' },
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
        }),
        prisma.rOOMS.findMany({
          orderBy: { RoomNumber: 'asc' },
          include: { BUILDINGS: true, ASSETS: true },
        }),
        prisma.cATEGORIES.findMany({
          orderBy: { CategoryName: 'asc' },
        }),
        prisma.pRIORITY.findMany({
          orderBy: { PriorityID: 'asc' },
        }),
        prisma.tECHNICIANS.findMany({
          orderBy: { FirstName: 'asc' },
        }),
        prisma.mATERIALS.findMany({
          orderBy: { MaterialName: 'asc' },
        }),
        prisma.aSSETS.findMany({
          orderBy: { AssetID: 'asc' },
          include: {
            ROOMS: {
              include: {
                BUILDINGS: true,
              },
            },
          },
        }),
      ]);

    return NextResponse.json({
      success: true,
      data: {
        users,
        buildings,
        rooms,
        categories,
        priorities,
        technicians,
        materials,
        assets,
      },
    });
  } catch (error: any) {
    console.error('Error fetching meta data:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch metadata' },
      { status: 500 }
    );
  }
}
