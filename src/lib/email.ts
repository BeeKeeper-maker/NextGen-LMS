import { Resend } from 'resend';
import { db } from '@/lib/db';

export async function getResendClient(tenantId?: string) {
  if (tenantId) {
    const config = await db.tenantConfig.findUnique({
      where: { tenantId },
    });
    if (config?.resendApiKey) {
      return new Resend(config.resendApiKey);
    }
  }

  const systemKey = process.env.RESEND_API_KEY || 're_dummy_key';
  return new Resend(systemKey);
}

export async function sendEmail({
  tenantId,
  to,
  subject,
  html,
  from,
}: {
  tenantId?: string;
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}) {
  try {
    const client = await getResendClient(tenantId);

    // Resolve "from" address
    let sender = from;
    if (!sender && tenantId) {
      const config = await db.tenantConfig.findUnique({
        where: { tenantId },
      });
      sender = config?.smtpFrom || process.env.DEFAULT_EMAIL_FROM;
    }

    if (!sender) {
      sender = 'NextGen LMS <onboarding@resend.dev>';
    }

    const recipients = Array.isArray(to) ? to : [to];

    const result = await client.emails.send({
      from: sender,
      to: recipients,
      subject,
      html,
    });

    return { success: true, data: result };
  } catch (error: any) {
    console.error('Failed to send email:', error);
    return { success: false, error: error.message || error };
  }
}
