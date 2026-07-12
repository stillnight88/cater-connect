// app/admin/vendor-applications/page.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VendorApplicationTable } from '@/components/admin/vendor-application-table';
import { listVendorApplicationsApi } from '@/lib/api/vendor-application-api';
import { useAuth } from '@/components/providers/auth-provider';
import type { VendorApplicationStatus } from '@/types/vendor';

const STATUS_TABS: { value: VendorApplicationStatus; label: string }[] = [
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
];

function StatusTabContent({ status, }: { status: VendorApplicationStatus }) {
    const { getAccessToken } = useAuth();

    const { data, isLoading } = useQuery({
        queryKey: ['vendor-applications', status],
        queryFn: async () => {
            const token = await getAccessToken();

            if (!token) {
                throw new Error('Not authenticated');
            }

            return listVendorApplicationsApi(status, token);
        },
    });
    const applications = data && 'applications' in data ? data.applications : [];
    return (
        <VendorApplicationTable
            applications={applications}
            isLoading={isLoading}
        />
    );
}
export default function VendorApplicationsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">Vendor Applications</h1>
                <p className="text-sm text-muted-foreground">Review and act on vendor applications submitted by customers.</p>
            </div>
            <Tabs defaultValue='pending'>
                <TabsList>
                    {STATUS_TABS.map(({ value, label }) => <TabsTrigger key={value} value={value} >{label}</TabsTrigger>)}
                </TabsList>
                {STATUS_TABS.map(({ value }) => (
                    <TabsContent key={value} value={value} className="mt-4">
                        <StatusTabContent status={value} />
                    </TabsContent>
                ))}
            </Tabs>

        </div>
    )
}