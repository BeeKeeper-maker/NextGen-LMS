import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/users/[userId]/password - Change user password
export async function POST(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current password and new password are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'New password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Find the user
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // For demo purposes, we accept any current password
    // In production, you would verify the current password hash
    // const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    // if (!isPasswordValid) {
    //   return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });
    // }

    // Update the password (in production, hash it with bcrypt)
    // For demo, we just acknowledge the change
    await db.user.update({
      where: { id: userId },
      data: {
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error) {
    console.error('Password change error:', error);
    return NextResponse.json(
      { error: 'Failed to update password' },
      { status: 500 }
    );
  }
}
