//app/admin/vendor-applications/[id]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getVendorApplicationApi } from '@/lib/api/vendor-application-api';
import { VendorApplicationDetail } from '@/components/admin/vendor-application-detail';
import { useAuth } from '@/components/providers/auth-provider';

export default function VendorApplicationDetailPage() {
    const params = useParams();
    const { getAccessToken, isAuthenticated } = useAuth();

    const id = typeof params?.id === 'string' ? params.id : undefined;

    const { data, isLoading, isError } = useQuery({
        queryKey: ['vendor-application', id],
        queryFn: async () => {
            const token = await getAccessToken();
            if (!token) throw new Error('Not authenticated');
            return getVendorApplicationApi(id as string, token);
        },
        enabled: isAuthenticated && !!id,
    });
    if (isLoading) {    
        return (
            <div className="py-12 text-center text-sm text-muted-foreground">
                Loading application…
            </div>
        );
    }

    if (isError || !id || !data?.success) {
        return (
            <div className="py-12 text-center text-sm text-destructive">
                Application not found.
            </div>
        );
    }
    return <VendorApplicationDetail application={data.application} />;
}
