'use client';

import Link from 'next/link';
import { MapPin, Phone } from 'lucide-react';

export interface VendorCardProps {
    id: string;
    businessName: string;
    description: string;
    phone: string;
    address: string;
    showBookButton?: boolean;
}

export function VendorCard({
    id,
    businessName,
    description,
    phone,
    address,
    showBookButton = false,
}: VendorCardProps) {
    return (
        <div className="py-5 flex items-start justify-between gap-4 group">
            <div className="space-y-1 min-w-0">
                <Link
                    href={`/vendors/${id}`}
                    className="font-medium text-sm hover:underline truncate block"
                >
                    {businessName}
                </Link>
                <p className="text-sm text-muted-foreground line-clamp-2">
                    {description}
                </p>
                <div className="flex items-center gap-4 pt-1">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3 shrink-0" />
                        {address}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3 shrink-0" />
                        {phone}
                    </span>
                </div>
            </div>

            {showBookButton && (
                <Link
                    href={`/bookings/new?vendorId=${id}`}
                    className="text-xs text-muted-foreground shrink-0 pt-0.5 hover:text-foreground"
                >
                    Book →
                </Link>
            )}
        </div>
    );
}