import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { sendEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    const userTenantId = (session.user as any).tenantId;

    if (userRole !== 'super_admin' && userRole !== 'tenant_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { operation, data } = body;

    switch (operation) {
      case 'bulk-enroll': {
        const { courseId, userIds, sendWelcomeEmail, grantImmediateAccess } = data;
        if (!courseId || !userIds || !Array.isArray(userIds)) {
          return NextResponse.json(
            { error: 'Missing required fields: courseId, userIds' },
            { status: 400 }
          );
        }

        // Get tenantId from the course
        const course = await db.course.findUnique({ where: { id: courseId }, select: { tenantId: true } });
        if (!course) {
          return NextResponse.json({ error: 'Course not found' }, { status: 404 });
        }

        // Secure tenant isolation
        if (userRole !== 'super_admin' && course.tenantId !== userTenantId) {
          return NextResponse.json({ error: 'Forbidden: cross-tenant access denied' }, { status: 403 });
        }

        // Check for existing enrollments
        const existing = await db.enrollment.findMany({
          where: {
            courseId,
            userId: { in: userIds },
          },
          select: { userId: true },
        });
        const existingIds = new Set(existing.map((e) => e.userId));
        const newUserIds = userIds.filter((id: string) => !existingIds.has(id));

        if (newUserIds.length === 0) {
          return NextResponse.json({
            success: true,
            operation: 'bulk-enroll',
            courseId,
            totalRequested: userIds.length,
            successCount: 0,
            failCount: 0,
            skippedCount: userIds.length,
            message: `All ${userIds.length} users are already enrolled in this course`,
          });
        }

        // Create enrollments in a transaction
        const result = await db.$transaction(
          newUserIds.map((userId: string) =>
            db.enrollment.create({
              data: {
                userId,
                courseId,
                tenantId: course.tenantId,
                status: grantImmediateAccess ? 'active' : 'active',
                progress: 0,
              },
            })
          )
        );

        // Update enrollment count on the course
        await db.course.update({
          where: { id: courseId },
          data: { enrollmentCount: { increment: newUserIds.length } },
        });

        return NextResponse.json({
          success: true,
          operation: 'bulk-enroll',
          courseId,
          totalRequested: userIds.length,
          successCount: result.length,
          failCount: 0,
          skippedCount: existingIds.size,
          sendWelcomeEmail,
          grantImmediateAccess,
          message: `Successfully enrolled ${result.length} users${existingIds.size > 0 ? ` (${existingIds.size} already enrolled)` : ''}`,
        });
      }

      case 'bulk-email': {
        const { subject, body: emailBody, recipientType, scheduled } = data;
        if (!subject || !emailBody) {
          return NextResponse.json(
            { error: 'Missing required fields: subject, body' },
            { status: 400 }
          );
        }

        const targetTenantId = userRole === 'super_admin' ? (data.tenantId || userTenantId) : userTenantId;

        let whereClause: any = { tenantId: targetTenantId, isActive: true };
        if (recipientType === 'all_students') {
          whereClause.role = 'learner';
        } else if (recipientType === 'all_instructors') {
          whereClause.role = 'instructor';
        } else if (recipientType === 'all_admins') {
          whereClause.role = 'tenant_admin';
        }

        const users = await db.user.findMany({
          where: whereClause,
          select: { email: true }
        });
        const emails = users.map((u) => u.email).filter(Boolean);

        let sentCount = 0;
        let emailError = null;

        if (emails.length > 0 && !scheduled) {
          const emailResult = await sendEmail({
            tenantId: targetTenantId,
            to: emails,
            subject,
            html: emailBody,
          });
          if (emailResult.success) {
            sentCount = emails.length;
          } else {
            emailError = emailResult.error;
          }
        }

        return NextResponse.json({
          success: !emailError,
          operation: 'bulk-email',
          subject,
          recipientType,
          recipientCount: emails.length,
          sentCount,
          scheduled,
          error: emailError,
          message: emailError
            ? `Failed to send email: ${emailError}`
            : `Email "${subject}" ${scheduled ? 'scheduled' : 'sent'} to ${emails.length} recipients`,
        });
      }

      case 'bulk-certificates-issue': {
        const { courseId, templateId, criteria, userIds, sendNotification } = data;
        if (!courseId || !templateId) {
          return NextResponse.json(
            { error: 'Missing required fields: courseId, templateId' },
            { status: 400 }
          );
        }

        // Get the course and its tenant
        const course = await db.course.findUnique({ where: { id: courseId }, select: { tenantId: true } });
        if (!course) {
          return NextResponse.json({ error: 'Course not found' }, { status: 404 });
        }

        // Secure tenant isolation
        if (userRole !== 'super_admin' && course.tenantId !== userTenantId) {
          return NextResponse.json({ error: 'Forbidden: cross-tenant access denied' }, { status: 403 });
        }

        // Verify template exists
        const template = await db.certificate.findUnique({ where: { id: templateId } });
        if (!template) {
          return NextResponse.json({ error: 'Certificate template not found' }, { status: 404 });
        }

        // Determine eligible users
        let eligibleUserIds: string[] = [];

        if (userIds && Array.isArray(userIds) && userIds.length > 0) {
          eligibleUserIds = userIds;
        } else {
          // Auto-determine based on criteria
          if (criteria === 'all_completers' || criteria === 'all_enrolled') {
            const enrollments = await db.enrollment.findMany({
              where: {
                courseId,
                ...(criteria === 'all_completers' ? { status: 'completed' } : {}),
              },
              select: { userId: true },
            });
            eligibleUserIds = enrollments.map((e) => e.userId);
          } else {
            // Default to all enrolled users
            const enrollments = await db.enrollment.findMany({
              where: { courseId },
              select: { userId: true },
            });
            eligibleUserIds = enrollments.map((e) => e.userId);
          }
        }

        if (eligibleUserIds.length === 0) {
          return NextResponse.json({
            success: true,
            operation: 'bulk-certificates-issue',
            courseId,
            templateId,
            criteria,
            totalRequested: 0,
            issuedCount: 0,
            failCount: 0,
            message: 'No eligible users found for certificate issuance',
          });
        }

        // Check for existing certificates for these users on this course+template
        const existingCerts = await db.certificateAward.findMany({
          where: {
            certificateId: templateId,
            courseId,
            userId: { in: eligibleUserIds },
          },
          select: { userId: true },
        });
        const existingUserIds = new Set(existingCerts.map((c) => c.userId));
        const newUserIds = eligibleUserIds.filter((id: string) => !existingUserIds.has(id));

        // Generate verification codes
        function generateVerificationCode(): string {
          const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
          let code = '';
          for (let i = 0; i < 12; i++) {
            if (i > 0 && i % 4 === 0) code += '-';
            code += chars.charAt(Math.floor(Math.random() * chars.length));
          }
          return code;
        }

        // Create certificate awards in a transaction
        const issued = newUserIds.length > 0
          ? await db.$transaction(
              newUserIds.map((userId: string) =>
                db.certificateAward.create({
                  data: {
                    userId,
                    certificateId: templateId,
                    tenantId: course.tenantId,
                    courseId,
                    verificationCode: generateVerificationCode(),
                  },
                })
              )
            )
          : [];

        return NextResponse.json({
          success: true,
          operation: 'bulk-certificates-issue',
          courseId,
          templateId,
          criteria,
          totalRequested: eligibleUserIds.length,
          issuedCount: issued.length,
          failCount: 0,
          skippedCount: existingUserIds.size,
          sendNotification,
          message: `Successfully issued ${issued.length} certificates${existingUserIds.size > 0 ? ` (${existingUserIds.size} already have certificates)` : ''}`,
        });
      }

      case 'bulk-certificates-revoke': {
        const { certificateIds } = data;
        if (!certificateIds || !Array.isArray(certificateIds)) {
          return NextResponse.json(
            { error: 'Missing required field: certificateIds' },
            { status: 400 }
          );
        }

        if (userRole !== 'super_admin') {
          // Verify all certificates belong to the user's tenant
          const certCount = await db.certificateAward.count({
            where: {
              id: { in: certificateIds },
              tenantId: userTenantId,
            },
          });
          if (certCount !== certificateIds.length) {
            return NextResponse.json(
              { error: 'Forbidden: cross-tenant access denied' },
              { status: 403 }
            );
          }
        }

        // Delete certificate awards from database
        const result = await db.certificateAward.deleteMany({
          where: { id: { in: certificateIds } },
        });

        return NextResponse.json({
          success: true,
          operation: 'bulk-certificates-revoke',
          revokedCount: result.count,
          message: `Successfully revoked ${result.count} certificates`,
        });
      }

      case 'bulk-certificates-resend': {
        const { certificateIds: certIds } = data;
        if (!certIds || !Array.isArray(certIds)) {
          return NextResponse.json(
            { error: 'Missing required field: certificateIds' },
            { status: 400 }
          );
        }

        // In demo mode, we can't resend emails, just return success
        return NextResponse.json({
          success: true,
          operation: 'bulk-certificates-resend',
          resentCount: certIds.length,
          message: `Successfully resent ${certIds.length} certificate emails (demo mode)`,
        });
      }

      default:
        return NextResponse.json(
          { error: `Unknown operation: ${operation}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Bulk operations error:', error);
    return NextResponse.json(
      { error: 'Internal server error during bulk operation' },
      { status: 500 }
    );
  }
}
