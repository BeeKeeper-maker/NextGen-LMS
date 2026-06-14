import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

// GET /api/admin/users - List all users across the platform
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized. Super-Admin role required.' }, { status: 401 });
    }

    const users = await db.user.findMany({
      include: {
        tenant: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(users);
  } catch (error: any) {
    console.error('Failed to fetch global users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

// PUT /api/admin/users - Update a user's role globally
export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized. Super-Admin role required.' }, { status: 401 });
    }

    const body = await request.json();
    const { userId, role } = body;

    if (!userId || !role) {
      return NextResponse.json({ error: 'Missing required fields: userId, role' }, { status: 400 });
    }

    const validRoles = ['super_admin', 'tenant_admin', 'instructor', 'content_creator', 'learner'];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: `Invalid role specified. Must be one of: ${validRoles.join(', ')}` }, { status: 400 });
    }

    const updated = await db.user.update({
      where: { id: userId },
      data: { role },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Failed to update user role:', error);
    return NextResponse.json({ error: 'Failed to update user role' }, { status: 500 });
  }
}

// DELETE /api/admin/users - Delete a user globally
export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized. Super-Admin role required.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Missing required query parameter: userId' }, { status: 400 });
    }

    // Do not allow deleting yourself!
    if (userId === (session.user as any).id) {
      return NextResponse.json({ error: 'You cannot delete your own account from the admin dashboard.' }, { status: 400 });
    }

    await db.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ success: true, message: 'User deleted successfully.' });
  } catch (error: any) {
    console.error('Failed to delete user account:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
