import { NextRequest, NextResponse } from 'next/server';
import { getClientIP } from '@/lib/api';
import { getDemoUser } from '@/lib/db';
import { prisma } from '@/lib/prisma';
import { deleteFromS3, uploadToS3 } from '@/lib/s3-upload';
import { systemLog } from '@/services/system-log';
import { GeneralSettingsSchema } from '@/app/cruds/system/settings/forms/general-settings-schema';

export async function POST(request: NextRequest) {
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
    const settings = await prisma.systemSetting.findFirst();
    if (!settings) {
      return NextResponse.json(
        { message: 'Settings not found.' },
        { status: 404 },
      );
    }

    // Parse the form data
    const formData = await request.formData();

    // Extract form data directly without casting all fields
    const parsedData = {
      name: formData.get('name'),
      logoFile: formData.get('logoFile'),
      logoAction: formData.get('logoAction'),
      active: formData.get('active') === 'true', // Convert to boolean
      address: formData.get('address'),
      websiteURL: formData.get('websiteURL'),
      supportEmail: formData.get('supportEmail'),
      supportPhone: formData.get('supportPhone'),
      language: formData.get('language'),
      timezone: formData.get('timezone'),
      currency: formData.get('currency'),
      currencyFormat: formData.get('currencyFormat'),
      defaultUserRoleId: formData.get('defaultUserRoleId'),
    };

    // Validate the input using Zod schema
    const validationResult = GeneralSettingsSchema.safeParse(parsedData);
    if (!validationResult.success) {
      return NextResponse.json(
        { message: 'Invalid input. Please check your data and try again.' },
        { status: 400 },
      );
    }

    const {
      name,
      logoFile,
      logoAction,
      active,
      address,
      websiteURL,
      supportEmail,
      supportPhone,
      language,
      timezone,
      currency,
      currencyFormat,
    } = validationResult.data;

    // Fetch the current settings from the database
    const currentSettings = await prisma.systemSetting.findUnique({
      where: { id: settings.id },
    });

    // Handle logo removal
    if (logoAction === 'remove' && currentSettings?.logo) {
      try {
        await deleteFromS3(currentSettings.logo);
      } catch (error) {
        console.error('Failed to remove logo from S3:', error);
      }
    }

    // Handle new logo upload
    let logoUrl = currentSettings?.logo || null;
    if (
      logoAction === 'save' &&
      logoFile &&
      logoFile instanceof File &&
      logoFile.size > 0
    ) {
      try {
        // Create a new File from the existing one
        const fileCompatible: File = new File(
          [await logoFile.arrayBuffer()],
          logoFile.name,
          { type: logoFile.type },
        );

        logoUrl = await uploadToS3(fileCompatible, 'misc');
      } catch {
        return NextResponse.json(
          { message: 'Failed to upload logo.' },
          { status: 500 },
        );
      }
    }

    // Save or update the settings in the database
    await prisma.systemSetting.update({
      where: { id: settings.id },
      data: {
        name,
        active,
        address,
        websiteURL,
        supportEmail,
        supportPhone,
        language,
        timezone,
        currency,
        currencyFormat,
        logo:
          logoAction === 'remove'
            ? null
            : logoAction === 'save'
              ? logoUrl
              : undefined,
      },
    });

    // Log the event
    await systemLog({
      event: 'update',
      userId: currentUser.id,
      entityId: currentUser.id,
      entityType: 'system.settings',
      description: 'System settings updated.',
      ipAddress: clientIp,
    });

    // Return success response
    return NextResponse.json(
      { message: 'Settings updated successfully' },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message:
          "Oops! Something didn't go as planned. Please try again in a moment." +
          error,
      },
      { status: 500 },
    );
  }
}
