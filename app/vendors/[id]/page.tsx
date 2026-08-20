import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MapPin, Phone, ArrowLeft } from 'lucide-react';
import { connectDB } from '@/lib/db/client';
import { VendorProfileModel, MenuItemModel, ReviewModel } from '@/lib/db/models';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { MenuItem } from '@/types/menu';
import { ReviewList } from '@/components/review/review-list';
import { type Review, type VendorRatingSummary, toReviewPublic } from '@/types/review';
import { Types } from 'mongoose';

async function getVendor(id: string) {
    await connectDB();

    const vendor = await VendorProfileModel.findOne({ _id: id, isActive: true })
        .lean()
        .select('_id businessName description phone address');

    if (!vendor) return null;

    return {
        id: vendor._id.toString(),
        businessName: vendor.businessName,
        description: vendor.description,
        phone: vendor.phone,
        address: vendor.address,
    };
};

async function getPublishedMenuItems(vendorId: string) {
    const items = await MenuItemModel.find({
        vendorId,
        status: 'published',
        isDeleted: false,
    })
        .lean<MenuItem[]>()
        .select('_id name description price category')
        .sort({ category: 1, createdAt: 1 });

    return items.map((item) => ({
        id: item._id.toString(),
        name: item.name,
        description: item.description,
        price: item.price,
        category: item.category,
    }));
};

async function getVendorReviews(vendorId: string) {
    const reviewsPromise = ReviewModel.find({ vendorId })
        .lean<Review[]>()
        .sort({ createdAt: -1 });

    const summaryPromise = ReviewModel.aggregate<{
        _id: null;
        averageRating: number;
        reviewCount: number;
    }>([
        { $match: { vendorId: new Types.ObjectId(vendorId) } },
        {
            $group: {
                _id: null,
                averageRating: { $avg: '$rating' },
                reviewCount: { $sum: 1 },
            },
        },
    ]);

    const [reviews, summaryResult] = await Promise.all([
        reviewsPromise,
        summaryPromise,
    ]);

    const summary: VendorRatingSummary = summaryResult[0]
        ? {
            averageRating:
                Math.round(summaryResult[0].averageRating * 10) / 10,
            reviewCount: summaryResult[0].reviewCount,
        }
        : { averageRating: 0, reviewCount: 0 };

    return {
        reviews: reviews.map(toReviewPublic),
        summary,
    };
};

function groupByCategory(items: Awaited<ReturnType<typeof getPublishedMenuItems>>) {
    return items.reduce<Record<string, typeof items>>(
        (acc, item) => {
            if (!acc[item.category]) acc[item.category] = [];
            acc[item.category].push(item);
            return acc;
        },
        {},
    );
};

export default async function VendorDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const vendor = await getVendor(id);

    if (!vendor) notFound();

    const menuItems = await getPublishedMenuItems(vendor.id);
    const { reviews, summary } = await getVendorReviews(vendor.id);
    const grouped = groupByCategory(menuItems);
    const categories = Object.keys(grouped).sort();

    return (
        <main className="max-w-4xl mx-auto px-4 py-10">
            <Link
                href="/vendors"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"
            >
                <ArrowLeft className="h-3.5 w-3.5" />
                All vendors
            </Link>

            <div className="mb-8">
                <h1 className="text-2xl font-semibold tracking-tight">
                    {vendor.businessName}
                </h1>
                <p className="text-sm text-muted-foreground mt-2 max-w-prose">
                    {vendor.description}
                </p>
                <div className="flex items-center gap-4 mt-3">
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        {vendor.address}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Phone className="h-3.5 w-3.5 shrink-0" />
                        {vendor.phone}
                    </span>
                </div>
            </div>

            <div className="mb-10">
                <Button asChild size="sm">
                    <Link href={`/bookings/new?vendorId=${vendor.id}`}>
                        Request a booking
                    </Link>
                </Button>
            </div>

            <section>
                <h2 className="text-base font-semibold tracking-tight mb-4">
                    Menu
                </h2>

                {menuItems.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        This vendor has not published any menu items yet.
                    </p>
                ) : (
                    <div className="space-y-8">
                        {categories.map((category) => (
                            <div key={category}>
                                <h3 className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-3">
                                    {category}
                                </h3>
                                <ul className="divide-y divide-border">
                                    {grouped[category].map((item) => (
                                        <li
                                            key={item.id}
                                            className="flex items-start justify-between gap-4 py-4"
                                        >
                                            <div className="space-y-0.5 min-w-0">
                                                <p className="text-sm font-medium">
                                                    {item.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground line-clamp-2">
                                                    {item.description}
                                                </p>
                                            </div>
                                            <Badge
                                                variant="secondary"
                                                className="shrink-0 tabular-nums"
                                            >
                                                ₹{(item.price / 100).toFixed(2)}
                                            </Badge>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                )}
            </section>
            <section className="mt-10">
                <h2 className="text-base font-semibold tracking-tight mb-4">
                    Reviews
                </h2>
                <ReviewList reviews={reviews} summary={summary} />
            </section>
        </main>
    );
};