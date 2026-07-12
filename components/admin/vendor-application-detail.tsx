'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { VendorStatusBadge } from '@/components/admin/vendor-status-badge';
import {
    rejectVendorApplicationSchema,
    type RejectVendorApplicationInput,
} from '@/lib/validation/schemas/vendor.schema';
import {
    approveVendorApplicationApi,
    rejectVendorApplicationApi,
} from '@/lib/api/vendor-application-api';
import { useAuth } from '@/components/providers/auth-provider';
import type { VendorApplicationPublic } from '@/types/vendor';

interface VendorApplicationDetailProps {
    application: VendorApplicationPublic;
}

function DetailRow({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-sm">{value}</p>
        </div>
    );
}

export function VendorApplicationDetail({ application }: VendorApplicationDetailProps) {
    const { getAccessToken } = useAuth();
    const queryClient = useQueryClient();
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);

    const form = useForm<RejectVendorApplicationInput>({
        resolver: zodResolver(rejectVendorApplicationSchema),
        defaultValues: { rejectionReason: '' },
    });

    const invalidateApplicationQueries = () => {
        queryClient.invalidateQueries({ queryKey: ['vendor-applications'] });
        queryClient.invalidateQueries({ queryKey: ['vendor-application', application.id] });
    };

    const approveMutation = useMutation({
        mutationFn: async () => {
            const token = await getAccessToken();
            if (!token) throw new Error('Not authenticated');
            return approveVendorApplicationApi(application.id, token);
        },
        onSuccess: (result) => {
            if (!result.success) {
                toast.error(result.error);
                return;
            }
            toast.success('Application approved');
            invalidateApplicationQueries();
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to approve application');
        },
    });

    const rejectMutation = useMutation({
        mutationFn: async (reason: string) => {
            const token = await getAccessToken();
            if (!token) throw new Error('Not authenticated');
            return rejectVendorApplicationApi(application.id, reason, token);
        },
        onSuccess: (result) => {
            if (!result.success) {
                toast.error(result.error);
                return;
            }
            toast.success('Application rejected');
            setIsRejectDialogOpen(false);
            form.reset();
            invalidateApplicationQueries();
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to approve application');
        },
    });

    const onRejectSubmit = form.handleSubmit((values) => {
        rejectMutation.mutate(values.rejectionReason)
    });

    const isPending = application.status === 'pending';

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>{application.businessName}</CardTitle>
                        <VendorStatusBadge status={application.status} />
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <DetailRow label="Description" value={application.description} />
                    <DetailRow label="Phone" value={application.phone} />
                    <DetailRow label="Address" value={application.address} />
                    <DetailRow
                        label="Applicant"
                        value={application.applicantName ?? application.applicantEmail ?? '—'}
                    />
                    <DetailRow
                        label="Submitted"
                        value={new Date(application.submittedAt).toLocaleString()}
                    />
                    {!isPending && application.reviewedAt && (
                        <DetailRow
                            label="Reviewed"
                            value={`${new Date(application.reviewedAt).toLocaleString()}${application.reviewedByName ? ` 
                                by ${application.reviewedByName}` : ''
                                }`}
                        />
                    )}

                    {application.status === 'rejected' && application.rejectionReason && (
                        <DetailRow label="Rejection Reason" value={application.rejectionReason} />
                    )}
                </CardContent>
            </Card>

            {isPending && (
                <div className="flex gap-3">
                    <Button
                        onClick={() => approveMutation.mutate()}
                        disabled={approveMutation.isPending}
                    >
                        {approveMutation.isPending ? 'Approving…' : 'Approve'}
                    </Button>

                    <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="destructive">Reject</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Reject application</DialogTitle>
                                <DialogDescription>
                                    This action is one-way and the reason below will be emailed to the
                                    applicant. Please be specific.
                                </DialogDescription>
                            </DialogHeader>

                            <form onSubmit={onRejectSubmit} className="space-y-4">
                                <Textarea
                                    placeholder="Explain why this application is being rejected…"
                                    {...form.register('rejectionReason')}
                                />
                                {form.formState.errors.rejectionReason && (
                                    <p className="text-sm text-destructive">
                                        {form.formState.errors.rejectionReason.message}
                                    </p>
                                )}

                                <DialogFooter>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsRejectDialogOpen(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="destructive"
                                        disabled={rejectMutation.isPending}
                                    >
                                        {rejectMutation.isPending ? 'Rejecting…' : 'Confirm Reject'}
                                    </Button>
                                </DialogFooter>

                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            )}
        </div>
    )
};