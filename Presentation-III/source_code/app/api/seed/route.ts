import { NextResponse } from 'next/server';
import { seedDatabase } from '@/prisma/seed';

// POST /api/seed - Trigger database re-seed and reset
export async function POST() {
  try {
    await seedDatabase();
    return NextResponse.json({
      success: true,
      message: 'Database successfully re-seeded with Presentation-II baseline + extended campus dataset.',
    });
  } catch (error: any) {
    console.error('Seeding error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to reseed database' },
      { status: 500 }
    );
  }
}
