import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/query - Interactive SQL Console & Presentation-II Query Runner
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, isPreset } = body;

    if (!query || typeof query !== 'string' || !query.trim()) {
      return NextResponse.json({ success: false, error: 'SQL Query cannot be empty' }, { status: 400 });
    }

    const trimmed = query.trim();

    // Safety filter: ensure non-destructive queries or provide clear warnings
    const upper = trimmed.toUpperCase();
    if (
      upper.startsWith('DROP DATABASE') ||
      upper.startsWith('SHUTDOWN')
    ) {
      return NextResponse.json(
        { success: false, error: 'Database drop operations are restricted in this console.' },
        { status: 403 }
      );
    }

    const startTime = performance.now();

    // Execute raw SQL directly against MySQL
    const result: any = await prisma.$queryRawUnsafe(trimmed);

    const executionTimeMs = (performance.now() - startTime).toFixed(2);

    // Determine columns and format rows (handle BigInt / Decimal serialization)
    let rows: any[] = [];
    let columns: string[] = [];

    if (Array.isArray(result)) {
      rows = result.map((row) => {
        const sanitized: any = {};
        for (const [key, val] of Object.entries(row)) {
          if (typeof val === 'bigint') {
            sanitized[key] = val.toString();
          } else if (val instanceof Date) {
            sanitized[key] = val.toISOString().split('T')[0];
          } else {
            sanitized[key] = val;
          }
        }
        return sanitized;
      });

      if (rows.length > 0) {
        columns = Object.keys(rows[0]);
      }
    }

    return NextResponse.json({
      success: true,
      columns,
      rows,
      rowCount: rows.length,
      executionTimeMs,
      executedQuery: trimmed,
    });
  } catch (error: any) {
    console.error('SQL Execution error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'SQL Execution error',
        rawError: String(error),
      },
      { status: 400 }
    );
  }
}
