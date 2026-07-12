'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, LogOut } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

import { useAuth, useHasRole } from '@/components/providers/auth-provider';
import { myApplicationApi, listVendorApplicationsApi } from '@/lib/api/vendor-application-api';
import type { VendorApplicationPublic } from '@/types/vendor';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const ROLE_LABELS: Record<string, string> = {
    admin: 'Admin',
    vendor: 'Vendor',
    customer: 'Customer',
};

export default function DashboardPage() {
    const router = useRouter();
    const { isAuthenticated, isLoading, user, logout, getAccessToken } = useAuth();
    const isAdmin = useHasRole('admin');
    const isVendor = useHasRole('vendor');
    const isCustomer = useHasRole('customer');

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.replace('/login?redirect=/dashboard');
        }
    }, [isLoading, isAuthenticated, router]);

    const { data: myApplicationResult, isLoading: isApplicationLoading } = useQuery({
        queryKey: ['vendor-application', 'mine'],
        queryFn: async () => {
            const token = await getAccessToken();
            if (!token) throw new Error('Not authenticated');
            return myApplicationApi(token);
        },
        enabled: isAuthenticated && user?.role === 'customer',
    });

    const { data: pendingApplicationsResult } = useQuery({
        queryKey: ['vendor-applications', 'pending'],
        queryFn: async () => {
            const token = await getAccessToken();
            if (!token) throw new Error('Not authenticated');
            return listVendorApplicationsApi('pending', token);
        },
        enabled: isAuthenticated && user?.role === 'admin',
    });

    const myApplication = myApplicationResult?.success ? myApplicationResult.application : null;
    const pendingCount = pendingApplicationsResult?.success
        ? pendingApplicationsResult.applications.length
        : 0;

    async function handleLogout() {
        await logout();
        router.replace('/login');
    }

    if (isLoading || !isAuthenticated || !user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }
    return (
        <div className="min-h-screen bg-background">
            <header className="border-b">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <h1 className="text-lg font-semibold tracking-tight">
                        CaterConnect
                    </h1>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLogout}
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign out
                    </Button>
                </div>
            </header>
            <main className="max-w-4xl mx-auto px-4 py-8">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>
                                    Welcome, {user.name ?? user.email}
                                </CardTitle>
                                <CardDescription className="mt-1">
                                    {user.email}
                                </CardDescription>
                            </div>
                            <Badge variant="secondary">
                                {ROLE_LABELS[user.role] ?? user.role}
                            </Badge>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <Separator className="mb-4" />
                        {isCustomer && (
                            <CustomerDashboardSection
                                application={myApplication}
                                isLoading={isApplicationLoading}
                            />
                        )}

                        {isVendor && (
                            <p className="text-sm text-muted-foreground">
                                Manage your menu and view incoming booking
                                requests from here.
                            </p>
                        )}

                        {isAdmin && (
                            <AdminDashboardSection pendingCount={pendingCount} />
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}

function CustomerDashboardSection({
    application,
    isLoading,
}: {
    application: VendorApplicationPublic | null;
    isLoading: boolean;
}) {
    if (isLoading) {
        return (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Checking application status…
            </div>
        );
    }

    if (!application) {
        return (
            <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                    Browse vendors and manage your event bookings from here.
                    Want to offer your own catering services?
                </p>
                <Button asChild variant="outline" size="sm">
                    <Link href="/vendor/apply">
                        Apply to become a vendor
                    </Link>
                </Button>
            </div>
        );
    }

    if (application.status === 'pending') {
        return (
            <div className="space-y-2">
                <Badge variant="secondary">Application Pending</Badge>
                <p className="text-sm text-muted-foreground">
                    Your vendor application for{' '}
                    <span className="font-medium">{application.businessName}</span>{' '}
                    is under review. We&apos;ll email you once a decision is made.
                </p>
            </div>
        );
    }

    if (application.status === 'approved') {
        return (
            <div className="space-y-2">
                <Badge variant="outline" className="border-green-600 text-green-600">
                    Vendor Approved
                </Badge>
                <p className="text-sm text-muted-foreground">
                    Your application for{' '}
                    <span className="font-medium">{application.businessName}</span>{' '}
                    was approved. Vendor-specific tools are coming in Phase 3.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <Badge variant="destructive">Application Rejected</Badge>
            <p className="text-sm text-muted-foreground">
                Your application for{' '}
                <span className="font-medium">{application.businessName}</span>{' '}
                was not approved.
                {application.rejectionReason && (
                    <>
                        {' '}
                        Reason: <span className="italic">{application.rejectionReason}</span>
                    </>
                )}
            </p>
            <Button asChild variant="outline" size="sm">
                <Link href="/vendor/apply">Apply again</Link>
            </Button>
        </div>
    );
};

function AdminDashboardSection({ pendingCount }: { pendingCount: number }) {
    return (
        <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
                Review vendor applications and oversee platform activity
                from here.
            </p>
            <Button asChild variant="outline" size="sm">
                <Link href="/admin/vendor-applications">
                    {pendingCount > 0
                        ? `Review ${pendingCount} pending application${pendingCount === 1 ? '' : 's'}`
                        : 'View vendor applications'}
                </Link>
            </Button>
        </div>
    );
}