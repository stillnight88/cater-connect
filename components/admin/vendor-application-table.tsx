'use client';

import { useRouter } from 'next/navigation';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { VendorStatusBadge } from '@/components/admin/vendor-status-badge';
import { cn } from '@/lib/utils';
import type { VendorApplicationPublic } from '@/types/vendor';

interface VendorApplicationTableProps {
    applications: VendorApplicationPublic[];
    isLoading?: boolean;
}

export function VendorApplicationTable({
    applications,
    isLoading,
}: VendorApplicationTableProps) {
    const router = useRouter();

    if (isLoading) {
        return (
            <div className="py-12 text-center text-sm text-muted-foreground">
                Loading applications…
            </div>
        );
    }

    if (applications.length === 0) {
        return (
            <div className="py-12 text-center text-sm text-muted-foreground">
                No applications in this category.
            </div>
        );
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Business Name</TableHead>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Status</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {applications.map((application) => (
                    <TableRow
                        key={application.id}
                        onClick={() => router.push(`/admin/vendor-applications/${application.id}`)}
                        className={cn('cursor-pointer hover:bg-muted/50')}
                    >
                        <TableCell className="font-medium">{application.businessName}</TableCell>
                        <TableCell>{application.applicantName ?? application.applicantEmail ?? '—'}</TableCell>
                        <TableCell>
                            {new Date(application.submittedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                            <VendorStatusBadge status={application.status} />
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}