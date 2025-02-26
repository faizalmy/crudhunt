import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { getDemoUser } from '@/lib/db';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  // Check if the user is authenticated
  const currentUser = await getDemoUser();
  if (!currentUser) {
    return NextResponse.json(
      { message: 'Unauthorized action.' },
      { status: 401 }, // Access denied
    );
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const query = searchParams.get('query') || '';
  const sortField = searchParams.get('sort') || 'createdAt';
  const sortDirection = searchParams.get('dir') === 'desc' ? 'desc' : 'asc';
  const createdAtFrom = searchParams.get('createdAtFrom');
  const createdAtTo = searchParams.get('createdAtTo');
  const userId = currentUser.id;

  try {
    // Count total activity logs for the current user with filters
    const totalCount = await prisma.systemLog.count({
      where: {
        userId, // Filter by current user's ID
        ...(createdAtFrom || createdAtTo
          ? {
              createdAt: {
                ...(createdAtFrom ? { gte: new Date(createdAtFrom) } : {}),
                ...(createdAtTo ? { lte: new Date(createdAtTo) } : {}),
              },
            }
          : {}),
        OR: [
          { event: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { entityId: { contains: query, mode: 'insensitive' } },
          { entityType: { contains: query, mode: 'insensitive' } },
        ],
      },
    });

    // Handle sorting logic
    const orderBy = { [sortField]: sortDirection as Prisma.SortOrder };

    // Fetch activity logs for the current user with filters, pagination, and sorting
    const logs = await prisma.systemLog.findMany({
      where: {
        userId, // Filter by current user's ID
        ...(createdAtFrom || createdAtTo
          ? {
              createdAt: {
                ...(createdAtFrom ? { gte: new Date(createdAtFrom) } : {}),
                ...(createdAtTo ? { lte: new Date(createdAtTo) } : {}),
              },
            }
          : {}),
        OR: [
          { event: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { entityId: { contains: query, mode: 'insensitive' } },
          { entityType: { contains: query, mode: 'insensitive' } },
        ],
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy,
      select: {
        id: true,
        event: true,
        entityId: true,
        entityType: true,
        description: true,
        ipAddress: true,
        createdAt: true,
      },
    });

    // Return response
    return NextResponse.json({
      data: logs,
      pagination: {
        total: totalCount,
        page,
        limit,
      },
    });
  } catch {
    return NextResponse.json(
      { message: 'Oops! Something went wrong. Please try again in a moment.' },
      { status: 500 },
    );
  }
}
