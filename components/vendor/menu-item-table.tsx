'use client';

import { useState } from 'react';
import { Loader2, Trash2, Eye, EyeOff } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/providers/auth-provider';
import {
    publishMenuItemApi,
    unpublishMenuItemApi,
    deleteMenuItemApi,
} from '@/lib/api/vendor-api';
import type { MenuItemPublic } from '@/types/menu';

interface MenuItemTableProps {
    items: MenuItemPublic[];
}

export function MenuItemTable({ items }: MenuItemTableProps) {
    const { getAccessToken } = useAuth();
    const queryClient = useQueryClient();
    const [actionError, setActionError] = useState<string | null>(null);

    const publishMutation = useMutation({
        mutationFn: async (id: string) => {
            const token = await getAccessToken();
            if (!token) throw new Error('Not authenticated');
            return publishMenuItemApi(id, token);
        },
        onSuccess: (result) => {
            if (!result.success) {
                setActionError(result.error);
                return
            }
            setActionError(null);
            queryClient.invalidateQueries({ queryKey: ['menu'] });
        }
    });

    const unpublishMutation = useMutation({
        mutationFn: async (id: string) => {
            const token = await getAccessToken();
            if (!token) throw new Error('Not authenticated');
            return unpublishMenuItemApi(id, token);
        },
        onSuccess: (result) => {
            if (!result.success) {
                setActionError(result.error);
                return
            }
            setActionError(null);
            queryClient.invalidateQueries({ queryKey: ['menu'] });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const token = await getAccessToken();
            if (!token) throw new Error('Not authenticated');
            return deleteMenuItemApi(id, token);
        },
        onSuccess: (result) => {
            if (!result.success) {
                setActionError(result.error);
                return
            }
            setActionError(null);
            queryClient.invalidateQueries({ queryKey: ['menu'] });
        }
    });

    if (items.length === 0) {
        return (
            <p className="text-sm text-muted-foreground py-6">
                Your menu is empty. Add your first item to start accepting
                bookings.
            </p>
        );
    }

    return (
        <div className="space-y-3">
            {actionError && (<p className="text-sm text-destructive">{actionError}</p>)}

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {items.map((item) => {
                        const isActing =
                            (publishMutation.isPending &&
                                publishMutation.variables === item.id) ||
                            (unpublishMutation.isPending &&
                                unpublishMutation.variables === item.id) ||
                            (deleteMutation.isPending &&
                                deleteMutation.variables === item.id);

                        return (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium text-sm">
                                    {item.name}
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    {item.category}
                                </TableCell>
                                <TableCell className="text-sm tabular-nums">
                                    ₹{(item.price / 100).toFixed(2)}
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant={
                                            item.status === 'published'
                                                ? 'outline'
                                                : 'secondary'
                                        }
                                        className={
                                            item.status === 'published'
                                                ? 'border-green-600 text-green-600'
                                                : ''
                                        }
                                    >
                                        {item.status === 'published'
                                            ? 'Published'
                                            : 'Draft'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        {isActing ? (
                                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                        ) : (
                                            <>
                                                {item.status === 'draft' ? (
                                                    <Button
                                                        variant='ghost'
                                                        size='sm'
                                                        onClick={() => publishMutation.mutate(item.id)}
                                                    >
                                                        <Eye className="h-4 w-4 mr-1" />
                                                        Publish
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        variant='ghost'
                                                        size='sm'
                                                        onClick={() => unpublishMutation.mutate(item.id)}
                                                    >
                                                        <EyeOff className="h-4 w-4 mr-1" />
                                                        Unpublish
                                                    </Button>
                                                )}

                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-destructive hover:text-destructive"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>
                                                                Delete menu item?
                                                            </AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                This will permanently
                                                                remove{' '}
                                                                <span className="font-medium text-foreground">
                                                                    {item.name}
                                                                </span>{' '}
                                                                from your menu. This
                                                                action cannot be
                                                                undone.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>
                                                                Cancel
                                                            </AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() =>
                                                                    deleteMutation.mutate(
                                                                        item.id,
                                                                    )
                                                                }
                                                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                            >
                                                                Delete
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    )
};
