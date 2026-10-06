import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/requests/[id]/materials - Add material used for maintenance and update inventory & cost
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const requestId = parseInt(id, 10);
    const body = await req.json();
    const { MaterialID, QuantityUsed } = body;

    if (!MaterialID || !QuantityUsed) {
      return NextResponse.json(
        { success: false, error: 'Material and QuantityUsed are required' },
        { status: 400 }
      );
    }

    const matId = parseInt(MaterialID, 10);
    const qty = parseInt(QuantityUsed, 10);

    if (isNaN(qty) || qty <= 0) {
      return NextResponse.json(
        { success: false, error: 'Quantity must be a positive integer' },
        { status: 400 }
      );
    }

    const material = await prisma.mATERIALS.findUnique({
      where: { MaterialID: matId },
    });

    if (!material) {
      return NextResponse.json({ success: false, error: 'Material not found' }, { status: 404 });
    }

    if (material.QuantityInStock < qty) {
      return NextResponse.json(
        {
          success: false,
          error: `Insufficient stock: Requested ${qty}, but only ${material.QuantityInStock} ${material.MaterialName} available`,
        },
        { status: 400 }
      );
    }

    const totalCost = Number(material.UnitCost) * qty;
    const today = new Date();

    const result = await prisma.$transaction(async (tx) => {
      // 1. Check if record in REQUEST_MATERIALS already exists
      const existingReqMat = await tx.rEQUEST_MATERIALS.findUnique({
        where: {
          RequestID_MaterialID: {
            RequestID: requestId,
            MaterialID: matId,
          },
        },
      });

      if (existingReqMat) {
        await tx.rEQUEST_MATERIALS.update({
          where: {
            RequestID_MaterialID: {
              RequestID: requestId,
              MaterialID: matId,
            },
          },
          data: {
            QuantityUsed: existingReqMat.QuantityUsed + qty,
          },
        });
      } else {
        await tx.rEQUEST_MATERIALS.create({
          data: {
            RequestID: requestId,
            MaterialID: matId,
            QuantityUsed: qty,
          },
        });
      }

      // 2. Deduct from stock
      await tx.mATERIALS.update({
        where: { MaterialID: matId },
        data: {
          QuantityInStock: material.QuantityInStock - qty,
        },
      });

      // 3. Add to COST
      const costEntry = await tx.cOST.create({
        data: {
          RequestID: requestId,
          CostType: `Material: ${material.MaterialName}`,
          Amount: totalCost,
          IncurredDate: today,
        },
      });

      return {
        materialName: material.MaterialName,
        quantityUsed: qty,
        totalCost,
        costEntry,
      };
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Error adding material:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to add material' },
      { status: 500 }
    );
  }
}
