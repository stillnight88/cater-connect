import Link from 'next/link';
import { MapPin, Phone } from 'lucide-react';
import { connectDB } from '@/lib/db/client';
import { VendorProfileModel } from '@/lib/db/models';

async function getVendors() {
    await connectDB();
    const vendors = await VendorProfileModel.find({ isActive: true })
        .lean()
        .select('_id businessName description phone address')
        .sort({ createdAt: -1 });

    return vendors.map((v) => ({
        id: v._id.toString(),
        businessName: v.businessName,
        description: v.description,
        phone: v.phone,
        address: v.address,
    }));
};

export default async function VendorsPage() {
    const vendors = await getVendors();

    return (
        <main className="max-w-4xl mx-auto px-4 py-10">
            <div className="mb-8">
                <h1 className="text-2xl font-semibold tracking-tight">
                    Vendors
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Browse catering vendors available on CaterConnect.
                </p>
            </div>

            {vendors.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                    No vendors are available at this time. Check back soon.
                </p>
            ) : (
                <ul className="divide-y divide-border">
                    {vendors.map((vendor) => (
                        <li key={vendor.id}>
                            <Link
                                href={`/vendors/${vendor.id}`}
                                className="flex items-start justify-between gap-4 py-5 group"
                            >
                                <div className="space-y-1 min-w-0">
                                    <p className="font-medium text-sm group-hover:underline truncate">
                                        {vendor.businessName}
                                    </p>
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                        {vendor.description}
                                    </p>
                                    <div className="flex items-center gap-4 pt-1">
                                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <MapPin className="h-3 w-3 shrink-0" />
                                            {vendor.address}
                                        </span>
                                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <Phone className="h-3 w-3 shrink-0" />
                                            {vendor.phone}
                                        </span>
                                    </div>
                                </div>
                                <span className="text-xs text-muted-foreground shrink-0 pt-0.5">
                                    View →
                                </span>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </main>
    );
};