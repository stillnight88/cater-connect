'use client';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { AuditLogPublic, AuditAction } from '@/types/audit';

interface AuditLogTableProps {
    entries: AuditLogPublic[];
    isLoading?: boolean;
}

function actionBadgeVariant(action: AuditAction): 'destructive' | 'secondary' | 'outline' {
    if (action.includes('failed')) return 'destructive';
    if (action.includes('rejected')) return 'destructive';
    if (action.includes('approved') || action.includes('verified')) return 'outline';
    return 'secondary';
}

export function AuditLogTable({ entries, isLoading }: AuditLogTableProps) {
    if (isLoading) {
        return (
            <div className="py-12 text-center text-sm text-muted-foreground">
                Loading audit log…
            </div>
        );
    }

    if (entries.length === 0) {
        return (
            <div className="py-12 text-center text-sm text-muted-foreground">
                No audit log entries match this filter.
            </div>
        );
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Action</TableHead>
                    <TableHead>Actor</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Timestamp</TableHead>
                </TableRow>
            </TableHeader>

            <TableBody>
                {entries.map((entry) => (
                    <TableRow key={entry.id}>
                        <TableCell>
                            <Badge variant={actionBadgeVariant(entry.action)}>{entry.action}</Badge>
                        </TableCell>
                        <TableCell className="text-sm">{entry.actorId ?? 'system'}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                            {entry.targetId ?? '—'}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                            {new Date(entry.timestamp).toLocaleString()}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};