'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, LogOut } from 'lucide-react';

import { useAuth, useHasRole } from '@/components/providers/auth-provider';

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
    const { isAuthenticated, isLoading, user, logout } = useAuth();
    const isAdmin = useHasRole('admin');
    const isVendor = useHasRole('vendor');
    const isCustomer = useHasRole('customer');

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.replace('/login?redirect=/dashboard');
        }
    }, [isLoading, isAuthenticated, router]);

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
                            <div className="space-y-3">
                                <p className="text-sm text-muted-foreground">
                                    Browse vendors and manage your event bookings
                                    from here. Want to offer your own catering
                                    services?
                                </p>
                                <Button asChild variant="outline" size="sm">
                                    <Link href="/vendor/apply">
                                        Apply to become a vendor
                                    </Link>
                                </Button>
                            </div>
                        )}

                        {isVendor && (
                            <p className="text-sm text-muted-foreground">
                                Manage your menu and view incoming booking
                                requests from here.
                            </p>
                        )}

                        {isAdmin && (
                            <p className="text-sm text-muted-foreground">
                                Review vendor applications and oversee platform
                                activity from here.
                            </p>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}
