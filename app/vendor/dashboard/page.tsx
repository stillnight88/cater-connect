'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, BookOpen, UtensilsCrossed } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

import { useAuth } from '@/components/providers/auth-provider';
import { getMyMenuApi } from '@/lib/api/vendor-api';
import { getIncomingBookingsApi } from '@/lib/api/booking-api';
import { groupBookingsByStage } from '@/lib/booking/grouping';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function VendorDashboardPage() {
    const router = useRouter();
    const { isAuthenticated, isLoading, user, getAccessToken } = useAuth();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.replace('/login?redirect=/vendor/dashboard');
        }
        if (!isLoading && isAuthenticated && user?.role !== 'vendor') {
            toast.error('Only vendor accounts can access this page.');
            router.replace('/dashboard');
        }
    }, [isLoading, isAuthenticated, user, router]);

    const { data: menuData, isPending: isMenuLoading } = useQuery({
        queryKey: ['menu'],
        queryFn: async () => {
            const token = await getAccessToken();
            if (!token) throw new Error('Session expired. Please sign in again.');
            return getMyMenuApi(token)
        },
        enabled: user?.role === 'vendor',
    });

    const { data: bookingsData, isPending: isBookingsLoading } = useQuery({
        queryKey: ['bookings', 'incoming'],
        queryFn: async () => {
            const token = await getAccessToken();
            if (!token) throw new Error('Session expired. Please sign in again.');
            return getIncomingBookingsApi(token)
        },
        enabled: user?.role === 'vendor',
    });

    if (isLoading || !isAuthenticated || user?.role !== 'vendor') {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const menuItems = menuData?.success ? menuData.items : [];
    const bookings = bookingsData?.success ? bookingsData.bookings : [];

    const { requested, accepted } = groupBookingsByStage(bookings);
    const pendingCount = requested.length;
    const confirmedCount = accepted.length;
    
    const publishedCount = menuItems.filter((i) => i.status === 'published').length;
    const draftCount = menuItems.filter((i) => i.status === 'draft').length;

    return (
        <div className="max-w-4xl mx-auto px-4 py-10">
            <div className="mb-8">
                <h1 className="text-2xl font-semibold tracking-tight">
                    Vendor dashboard
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Overview of your menu and incoming bookings.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Menu
                        </CardTitle>
                        <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isMenuLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        ) : (
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div>
                                        <p className="text-2xl font-semibold tabular-nums">
                                            {publishedCount}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            published
                                        </p>
                                    </div>
                                    {draftCount > 0 && (
                                        <Badge
                                            variant="secondary"
                                            className="ml-auto"
                                        >
                                            {draftCount} draft
                                            {draftCount !== 1 ? 's' : ''}
                                        </Badge>
                                    )}
                                </div>
                                <CardDescription>
                                    {menuItems.length === 0
                                        ? 'No menu items yet. Add your first item to start accepting bookings.'
                                        : publishedCount === 0
                                            ? 'No published items. Publish a draft to make your menu visible.'
                                            : `${menuItems.length} item${menuItems.length !== 1 ? 's' : ''} total.`}
                                </CardDescription>
                                <Button asChild variant="outline" size="sm">
                                    <Link href="/vendor/menu">
                                        Manage menu
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Bookings
                        </CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isBookingsLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        ) : (
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div>
                                        <p className="text-2xl font-semibold tabular-nums">
                                            {pendingCount}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            pending
                                        </p>
                                    </div>
                                    {confirmedCount > 0 && (
                                        <Badge
                                            variant="outline"
                                            className="ml-auto border-green-600 text-green-600"
                                        >
                                            {confirmedCount} confirmed
                                        </Badge>
                                    )}
                                </div>
                                <CardDescription>
                                    {bookings.length === 0
                                        ? 'No bookings yet. Customers will send requests once your menu is published.'
                                        : pendingCount > 0
                                            ? `${pendingCount} request${pendingCount !== 1 ? 's' : ''} awaiting your response.`
                                            : 'No pending requests right now.'}
                                </CardDescription>
                                <Button asChild variant="outline" size="sm">
                                    <Link href="/vendor/bookings">
                                        {pendingCount > 0
                                            ? `Review ${pendingCount} request${pendingCount !== 1 ? 's' : ''}`
                                            : 'View bookings'}
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};