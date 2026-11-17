'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

import { useAuth } from '@/components/providers/auth-provider';
import { getMyMenuApi } from '@/lib/api/vendor-api';
import { MenuItemTable } from '@/components/vendor/menu-item-table';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

export default function VendorMenuPage() {
    const router = useRouter();
    const { isAuthenticated, isLoading, user, getAccessToken } = useAuth();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.replace('/login?redirect=/vendor/menu');
        }
        if (!isLoading && isAuthenticated && user?.role !== 'vendor') {
            toast.error('Only vendor accounts can access this page.');
            router.replace('/dashboard');
        }
    }, [isLoading, isAuthenticated, router, user]);

    const { data, isPending: isMenuLoading } = useQuery({
        queryKey: ['menu'],
        queryFn: async () => {
            const token = await getAccessToken();
            if (!token) throw new Error('Not authenticated');
            return getMyMenuApi(token);
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

    const items = data?.success ? data.items : [];

    return (
        <div className="max-w-4xl mx-auto px-4 py-10">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Menu
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Manage your menu items. Draft items are not visible
                        to customers.
                    </p>
                </div>
                <Button asChild size="sm">
                    <Link href="/vendor/menu/new">
                        <Plus className="h-4 w-4 mr-2" />
                        Add item
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Your items</CardTitle>
                    <CardDescription>
                        {items.length} item{items.length !== 1 ? 's' : ''} total
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isMenuLoading ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground py-6">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Loading menu…
                        </div>
                    ) : (
                        <MenuItemTable items={items} />
                    )}
                </CardContent>
            </Card>
        </div>
    );
};