import { Queue, QueueEvents } from 'bullmq';

const REDIS_HOST = process.env.REDIS_HOST!;
const REDIS_PORT = Number(process.env.REDIS_PORT!);
const REDIS_PASSWORD = process.env.REDIS_PASSWORD;
const EMAIL_QUEUE_NAME = 'email-queue';

export const redisConnection = {
    host: REDIS_HOST,
    port: REDIS_PORT,
    password: REDIS_PASSWORD,
    maxRetriesPerRequest: null,  // Required for BullMQ
    enableReadyCheck: false,
};

export type EmailJobType =
    | 'verify-email'
    | 'password-reset'
    | 'mfa-otp'
    | 'vendor-application-submitted'
    | 'vendor-application-approved'
    | 'vendor-application-rejected';

export interface VerifyEmailJobData {
    email: string;
    name: string;
    otp: string;
}

export interface PasswordResetJobData {
    email: string;
    name: string;
    otp: string;
}

export interface MFAOTPJobData {
    email: string;
    name: string;
    otp: string;
}

export interface VendorApplicationSubmittedJobData {
    email: string;
    name: string;
    businessName: string;
    applicationId: string;
}

export interface VendorApplicationApprovedJobData {
    email: string;
    name: string;
    businessName: string;
}

export interface VendorApplicationRejectedJobData {
    email: string;
    name: string;
    businessName: string;
    rejectionReason: string;
}

export type EmailJobData =
    | VerifyEmailJobData
    | PasswordResetJobData
    | MFAOTPJobData
    | VendorApplicationSubmittedJobData
    | VendorApplicationApprovedJobData
    | VendorApplicationRejectedJobData;

// All email jobs are added to this queue
export const emailQueue = new Queue<EmailJobData>(EMAIL_QUEUE_NAME, {
    connection: redisConnection,
    defaultJobOptions: {
        attempts: 3, // Retry up to 3 times
        backoff: {
            type: 'exponential',
            delay: 2000,   // Start with 2 second delay
        },
        removeOnComplete: {
            age: 24 * 60 * 60, // Keep completed jobs for 24 hours
            count: 1000,      // Keep last 1000 completed jobs
        },
        removeOnFail: {
            age: 7 * 24 * 60 * 60, // Keep failed jobs for 7 days
        },
    },
});

// Listen to queue events for monitoring
export const emailQueueEvents = new QueueEvents(EMAIL_QUEUE_NAME, { connection: redisConnection });

// Email Queue Helper Functions
export async function queueVerifyEmail(data: VerifyEmailJobData) {
    return await emailQueue.add('verify-email', data, {
        priority: 1,   // High priority
        jobId: `verify-email-${data.email}-${Date.now()}`,
    });
};

export async function queuePasswordReset(data: PasswordResetJobData) {
    return await emailQueue.add('password-reset', data, {
        priority: 1,   // High priority
        jobId: `pw-reset-${data.email}-${Date.now()}`,
    });
};

export async function queueMFAOTP(data: MFAOTPJobData) {
    return await emailQueue.add('mfa-otp', data, {
        priority: 1,    // High priority
        jobId: `mfa-${data.email}-${Date.now()}`,
    });
};

export async function queueVendorApplicationSubmitted(data: VendorApplicationSubmittedJobData) {
    return await emailQueue.add('vendor-application-submitted', data, {
        priority: 2,   // Normal priority
        jobId: `vendor-submitted-${data.email}-${Date.now()}`,
    });
};

export async function queueVendorApplicationApproved(data: VendorApplicationApprovedJobData) {
    return await emailQueue.add('vendor-application-approved', data, {
        priority: 2,   // Normal priority
        jobId: `vendor-approved-${data.email}-${Date.now()}`,
    });
};

export async function queueVendorApplicationRejected(data: VendorApplicationRejectedJobData) {
    return await emailQueue.add('vendor-application-rejected', data, {
        priority: 2, // Normal priority
    });
};

export async function getQueueStats() {
    const counts = await emailQueue.getJobCounts();
    return {
        ...counts,
        total: counts.waiting + counts.active + counts.completed + counts.failed + counts.delayed
    };
};

// Get failed jobs for debugging
export async function getFailedJobs(limit: number = 50) {
    return await emailQueue.getJobs(['failed'], 0, limit);
};

export async function retryFailedJob(jobId: string) {
    const job = await emailQueue.getJob(jobId);
    if (job && (await job.isFailed())) {
        await job.retry();
        return true;   // Job was successfully re-queued
    }
    return false;
};

// Close queue connections gracefully - Call during application shutdown
export async function closeQueue() {
    await emailQueue.close();
    await emailQueueEvents.close();
};

if (process.env.NODE_ENV === 'development') {
    emailQueueEvents.on('completed', ({ jobId }) => {
        console.log(`Email job ${jobId} completed`);
    });

    emailQueueEvents.on('failed', ({ jobId, failedReason }) => {
        console.error(`Email job ${jobId} failed:`, failedReason);
    });

    emailQueueEvents.on('progress', ({ jobId, data }) => {
        console.log(`Email job ${jobId} progress:`, data);
    });
}

export async function isQueueHealthy(): Promise<boolean> {
    try {
        const client = await emailQueue.waitUntilReady();
        await client.ping();
        return true;
    } catch (error) {
        console.error('Queue health check failed:', error);
        return false;
    }
};