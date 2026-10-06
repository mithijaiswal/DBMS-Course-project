import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/requests/[id]/feedback - Submit feedback for completed request
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const requestId = parseInt(id, 10);
    const body = await req.json();
    const { Rating, Comments } = body;

    const ratingNum = parseInt(Rating, 10);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return NextResponse.json(
        { success: false, error: 'Rating must be an integer between 1 and 5' },
        { status: 400 }
      );
    }

    const request = await prisma.rEQUESTS.findUnique({
      where: { RequestID: requestId },
    });

    if (!request) {
      return NextResponse.json({ success: false, error: 'Request not found' }, { status: 404 });
    }

    const feedback = await prisma.fEEDBACK.create({
      data: {
        RequestID: requestId,
        Rating: ratingNum,
        Comments: Comments ? Comments.trim() : null,
        SubmissionDate: new Date(),
      },
    });

    return NextResponse.json({ success: true, data: feedback });
  } catch (error: any) {
    console.error('Error submitting feedback:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to submit feedback' },
      { status: 500 }
    );
  }
}
