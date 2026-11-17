'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { useAuth } from '@/components/providers/auth-provider';
import { createMenuItemApi } from '@/lib/api/vendor-api';
import { MenuItemForm } from '@/components/vendor/menu-item-form';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import type { CreateMenuItemInput } from '@/lib/validation/schemas/menu.schema';
import { getErrorMessage } from '@/lib/utils/error';

export default function NewMenuItemPage() {
    const router = useRouter();
    const { isAuthenticated, isLoading, user, getAccessToken } = useAuth();
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.replace('/login?redirect=/vendor/menu/new');
        }
        if (!isLoading && isAuthenticated && user?.role !== 'vendor') {
            toast.error('Only vendor accounts can access this page.');
            router.replace('/dashboard');
        }
    }, [isLoading, isAuthenticated, user, router]);

    const { mutate, isPending, error: mutationError } = useMutation({
        mutationFn: async (data: CreateMenuItemInput) => {
            const token = await getAccessToken();
            if (!token) throw new Error('Session expired. Please sign in again.');
            return createMenuItemApi(data, token);
        },
        onSuccess: (result) => {
            if (!result.success) {
                toast.error(getErrorMessage(result.error, 'Failed to create menu item.'));
                return;
            }
            queryClient.invalidateQueries({ queryKey: ['menu'] });
            toast.success('Menu item saved as draft.');
            router.push('/vendor/menu');
        },
        onError: (err) => {
            toast.error(getErrorMessage(err));
        },
    });

    if (isLoading || !isAuthenticated || user?.role !== 'vendor') {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="max-w-lg mx-auto px-4 py-10">
            <div className="mb-8">
                <h1 className="text-2xl font-semibold tracking-tight">
                    Add menu item
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    New items are saved as drafts. Publish them from your
                    menu page when ready.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Item details</CardTitle>
                    <CardDescription>
                        Fill in the details for your new menu item.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <MenuItemForm
                        onSubmit={mutate}
                        isPending={isPending}
                        error={mutationError instanceof Error ? mutationError.message : null}
                    />
                </CardContent>
            </Card>
        </div>
    );
}