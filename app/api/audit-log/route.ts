// app/api/audit-log/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware/role-guard';
import { AuditLogModel } from '@/lib/db/models';
import { toAuditLogPublic } from '@/types/audit';
import { auditLogQuerySchema } from '@/lib/validation/schemas/audit.schema';
import { isZodError, formatZodError } from '@/lib/validation/helpers';
import { connectDB } from '@/lib/db/client';

export async function GET(request: NextRequest) {
    const authResult = await requireAdmin(request);
    if (authResult instanceof NextResponse) return authResult;

    let query;

    try {
        await connectDB();
        query = auditLogQuerySchema.parse({
            page: request.nextUrl.searchParams.get('page') ?? undefined,
            limit: request.nextUrl.searchParams.get('limit') ?? undefined,
            action: request.nextUrl.searchParams.get('action') ?? undefined,
        });

        const { page, limit, action } = query;

        const filter = action ? { action } : {};
        const skip = (page - 1) * limit;

        const [entries, total] = await Promise.all([
            AuditLogModel.find(filter).sort({ timestamp: -1 }).skip(skip).limit(limit).lean(),
            AuditLogModel.countDocuments(filter),
        ]);

        return NextResponse.json({
            success: true,
            entries: entries.map(toAuditLogPublic),
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        });
        
    } catch (error) {
        console.error('audit validation error:', error);
        if (isZodError(error)) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Validation failed',
                    errors: formatZodError(error),
                },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { success: false, error: 'Failed to fetch audit' },
            { status: 500 },
        );
    }
}