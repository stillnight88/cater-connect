import { Resend } from "resend";
import { Worker, Job } from "bullmq";
import {
  EmailJobData,
  VerifyEmailJobData,
  PasswordResetJobData,
  MFAOTPJobData,
  VendorApplicationSubmittedJobData,
  VendorApplicationApprovedJobData,
  VendorApplicationRejectedJobData,
} from "./queue";
import {
  generateVerifyEmailTemplate,
  generatePasswordResetTemplate,
  generateMFAOTPTemplate,
  generateVendorApplicationSubmittedTemplate,
  generateVendorApplicationApprovedTemplate,
  generateVendorApplicationRejectedTemplate,
} from "./templates";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL;
const FROM_NAME = process.env.FROM_NAME;
const EMAIL_QUEUE_NAME = 'email-queue';

if (!RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY environment variable is not set");
}

const resend = new Resend(RESEND_API_KEY);

async function sendEmail(
  to: string,
  subject: string,
  react: React.ReactNode,
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to,
      subject,
      react,
    });

    if (error) {
      console.error("Resend error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error("Email send error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

async function processVerifyEmail(data: VerifyEmailJobData) {
  const react = generateVerifyEmailTemplate({
    name: data.name,
    otp: data.otp,
  });

  return await sendEmail(
    data.email,
    "Password Reset Request - CaterConnect",
    react,
  );
}

async function processPasswordReset(data: PasswordResetJobData) {
  const react = generatePasswordResetTemplate({
    name: data.name,
    otp: data.otp,
  });

  return await sendEmail(
    data.email,
    "Password Reset Request - CaterConnect",
    react,
  );
}

async function processMFAOTP(data: MFAOTPJobData) {
  const react = generateMFAOTPTemplate({
    name: data.name,
    otp: data.otp,
  });

  return await sendEmail(data.email, "Your Login Code - CaterConnect", react);
}

async function processVendorApplicationSubmitted(
  data: VendorApplicationSubmittedJobData,
) {
  const react = generateVendorApplicationSubmittedTemplate({
    name: data.name,
    businessName: data.businessName,
  });

  return await sendEmail(
    data.email,
    "Vendor Application Received - CaterConnect",
    react,
  );
}

async function processVendorApplicationApproved(
  data: VendorApplicationApprovedJobData,
) {
  const react = generateVendorApplicationApprovedTemplate({
    name: data.name,
    businessName: data.businessName,
  });

  return await sendEmail(
    data.email,
    "Vendor Application Approved - CaterConnect",
    react,
  );
}

async function processVendorApplicationRejected(
  data: VendorApplicationRejectedJobData,
) {
  const react = generateVendorApplicationRejectedTemplate({
    name: data.name,
    businessName: data.businessName,
    rejectionReason: data.rejectionReason,
  });

  return await sendEmail(
    data.email,
    "Vendor Application Status - CaterConnect",
    react,
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function processEmailJob(job: Job<EmailJobData>): Promise<any> {
  console.log(`📧 Processing email job: ${job.name} (${job.id})`);

  let result;

  switch (job.name) {
    case 'verify-email':
      result = await processVerifyEmail(job.data as VerifyEmailJobData);
      break;

    case 'password-reset':
      result = await processPasswordReset(job.data as PasswordResetJobData);
      break;

    case 'mfa-otp':
      result = await processMFAOTP(job.data as MFAOTPJobData);
      break;

    case 'vendor-application-submitted':
      result = await processVendorApplicationSubmitted(job.data as VendorApplicationSubmittedJobData);
      break;

    case 'vendor-application-approved':
      result = await processVendorApplicationApproved(job.data as VendorApplicationApprovedJobData);
      break;

    case 'vendor-application-rejected':
      result = await processVendorApplicationRejected(job.data as VendorApplicationRejectedJobData);
      break;

    default:
      throw new Error(`Unknown email job type: ${job.name}`);
  }

  if (!result.success) {
    throw new Error(`Email send failed: ${result.error}`);
  }

  console.log(`Email sent successfully: ${result.messageId}`);

  return result;
};

export const emailWorker = new Worker<EmailJobData>(
  EMAIL_QUEUE_NAME,
  processEmailJob,
  {
    connection: {
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      maxRetriesPerRequest: null,
    },
    concurrency: 5, // Process 5 emails concurrently
    limiter: {
      max: 10, // Maximum 10 jobs per duration
      duration: 1000, // per 1 second (rate limiting)
    },
  },
);

// Worker event handlers
emailWorker.on('completed', (job) => {
  console.log(`Email worker completed job ${job.id}`);
});

emailWorker.on('failed', (job, error) => {
  console.error(`Email worker failed job ${job?.id}:`, error.message);
});

emailWorker.on('error', (error) => {
  console.error('Email worker error:', error);
});

export function startEmailWorker() {
  console.log('Email worker started');
  return emailWorker;
}

export async function closeEmailWorker() {
  await emailWorker.close();
  console.log('Email worker closed');
};

// Test email sending (development only)
export async function sendTestEmail(to: string) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Test emails not allowed in production');
  }

  return await sendEmail(
    to,
    'Test Email - CaterConnect',
    '<h1>Test Email</h1><p>This is a test email from CaterConnect.</p>',
  );
};
