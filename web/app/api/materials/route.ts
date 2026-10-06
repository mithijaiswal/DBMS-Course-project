import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/materials
export async function GET() {
  try {
    const materials = await prisma.mATERIALS.findMany({
      include: {
        REQUEST_MATERIALS: {
          include: {
            REQUESTS: true,
          },
        },
      },
      orderBy: { MaterialID: 'asc' },
    });
    return NextResponse.json({ success: true, data: materials });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/materials - Add new material item
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { MaterialName, UnitCost, QuantityInStock } = body;

    if (!MaterialName || UnitCost === undefined || QuantityInStock === undefined) {
      return NextResponse.json(
        { success: false, error: 'MaterialName, UnitCost, and QuantityInStock are required' },
        { status: 400 }
      );
    }

    const created = await prisma.mATERIALS.create({
      data: {
        MaterialName: MaterialName.trim(),
        UnitCost: parseFloat(UnitCost),
        QuantityInStock: parseInt(QuantityInStock, 10),
      },
    });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PATCH /api/materials - Restock or adjust quantity
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { MaterialID, AddQuantity, QuantityInStock, UnitCost } = body;

    if (!MaterialID) {
      return NextResponse.json({ success: false, error: 'MaterialID is required' }, { status: 400 });
    }

    const matId = Number(MaterialID);
    const existing = await prisma.mATERIALS.findUnique({ where: { MaterialID: matId } });

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Material not found' }, { status: 404 });
    }

    const updateData: any = {};
    if (AddQuantity !== undefined) {
      updateData.QuantityInStock = existing.QuantityInStock + parseInt(AddQuantity, 10);
    } else if (QuantityInStock !== undefined) {
      updateData.QuantityInStock = parseInt(QuantityInStock, 10);
    }

    if (UnitCost !== undefined) {
      updateData.UnitCost = parseFloat(UnitCost);
    }

    const updated = await prisma.mATERIALS.update({
      where: { MaterialID: matId },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
