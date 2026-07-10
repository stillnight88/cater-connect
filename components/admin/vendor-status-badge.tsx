import { Badge } from '@/components/ui/badge';
import type { VendorApplicationPublic } from '@/types/vendor';

export function VendorStatusBadge({ status }: { status: VendorApplicationPublic['status'] }) {
  if (status === 'approved') {
    return (
      <Badge variant="outline" className="border-green-600 text-green-600">
        Approved
      </Badge>
    );
  }
  if (status === 'rejected') {
    return <Badge variant="destructive">Rejected</Badge>;
  }
  return <Badge variant="secondary">Pending</Badge>;
}