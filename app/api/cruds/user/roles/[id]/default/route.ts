import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { getClientIP } from '@/lib/api';
import { getDemoUser } from '@/lib/db';
import { prisma } from '@/lib/prisma';
import { systemLog } from '@/services/system-log';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Check if the user is authenticated
    const currentUser = await getDemoUser();
    if (!currentUser) {
      return NextResponse.json(
        { message: 'Unauthorized action.' },
        { status: 401 }, // Access denied
      );
    }

    const clientIp = getClientIP(request);
    const { id } = await params;

    // Validate the input
    if (!id) {
      return NextResponse.json(
        { message: 'Role ID is required.' },
        { status: 400 },
      );
    }

    // Check if the role exists
    const role = await prisma.userRole.findUnique({
      where: { id },
    });

    if (!role) {
      return NextResponse.json(
        { message: `Role with ID ${id} not found.` },
        { status: 404 },
      );
    }

    // Reset all other roles to isDefault = false and set the specified role to isDefault = true in a transaction
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Set all roles' isDefault to false
      await tx.userRole.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });

      // Set the specified role to isDefault = true
      await tx.userRole.update({
        where: { id },
        data: { isDefault: true },
      });

      // Log the event
      await systemLog(
        {
          event: 'update',
          userId: currentUser.id,
          entityId: id,
          entityType: 'user.role',
          description: 'User role set default.',
          ipAddress: clientIp,
        },
        tx,
      );
    });

    return NextResponse.json({
      message: `Role successfully set as the default.`,
    });
  } catch {
    return NextResponse.json(
      { message: 'Oops! Something went wrong. Please try again in a moment.' },
      { status: 500 },
    );
  }
}
