import mongoose, { Schema, Model, HydratedDocument } from 'mongoose';
import { VendorApplication, VendorApplicationStatus } from '@/types/vendor';
import { isValidPhoneNumber } from "libphonenumber-js";

type VendorApplicationDocument = HydratedDocument<VendorApplication>;

export interface VendorApplicationMethods {
    isPending(): boolean;
    isApproved(): boolean;
    isRejected(): boolean;
    approve(adminId: string): Promise<VendorApplicationDocument>;
    reject(adminId: string, reason: string): Promise<VendorApplicationDocument>;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface VendorApplicationModelType extends Model<VendorApplication, {}, VendorApplicationMethods> {
    findPendingByUserId(
        userId: string
    ): Promise<VendorApplicationDocument | null>;

    hasPendingApplication(userId: string): Promise<boolean>;

    getPendingApplications(
        limit?: number
    ): Promise<VendorApplicationDocument[]>;

    getReviewedByAdmin(
        adminId: string,
        limit?: number
    ): Promise<VendorApplicationDocument[]>;

    getStatistics(): Promise<{
        pending: number;
        approved: number;
        rejected: number;
        total: number;
    }>;

    getUserApplications(
        userId: string
    ): Promise<VendorApplicationDocument[]>;
}
// Vendor Application Schema - Customers submit applications to become vendors, Requires admin approval before role upgrade
const VendorApplicationSchema = new Schema<VendorApplication, VendorApplicationModelType, VendorApplicationMethods>({
    userId: {
        type: Schema.Types.ObjectId,
        required: [true, 'User ID is required'],
        ref: 'User',
        index: true,
    },
    businessName: {
        type: String,
        required: [true, 'Business name is required'],
        trim: true,
        minlength: [2, 'Business name must be at least 2 characters'],
        maxlength: [200, 'Business name cannot exceed 200 characters'],
    },
    description: {
        type: String,
        required: [true, 'Business description is required'],
        trim: true,
        minlength: [10, 'Description must be at least 10 characters'],
        maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true,
        // unique: true, - prevents reapplication with same phone
        validate: {
            validator: (value: string) => isValidPhoneNumber(value, 'IN'),
            message: "Please provide a valid phone number",
        },
    },
    address: {
        type: String,
        required: [true, 'Business address is required'],
        trim: true,
        minlength: [10, 'Address must be at least 10 characters'],
        maxlength: [500, 'Address cannot exceed 500 characters'],
    },
    status: {
        type: String,
        enum: {
            values: ['pending', 'approved', 'rejected'] as VendorApplicationStatus[],
            message: '{VALUE} is not a valid status',
        },
        default: 'pending',
        index: true,
    },
    submittedAt: {
        type: Date,
        default: Date.now,
        required: true,
        index: true,
    },
    reviewedAt: {
        type: Date,
        index: true,
    },
    reviewedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        index: true,
    },
    rejectionReason: {
        type: String,
        trim: true,
        maxlength: [1000, 'Rejection reason cannot exceed 1000 characters'],
    },
}, {
    timestamps: true,
    collection: 'vendor_applications',
});

// Indexes for query optimization
VendorApplicationSchema.index({ userId: 1, status: 1 });            // Index for prevent duplicate pending applications
VendorApplicationSchema.index({ status: 1, submittedAt: -1 });    // Index for admin review queue
VendorApplicationSchema.index({ reviewedBy: 1, reviewedAt: -1 });  // Index for reviewer queries

// Validation: User can only have one pending application
VendorApplicationSchema.pre('save', async function () {
    if (!this.isNew) return;

    const existingPending = await (this.constructor as Model<VendorApplication>)
        .findOne({
            userId: this.userId,
            status: 'pending',
        });

    if (existingPending) {
        throw new Error('You already have a pending vendor application');
    }
});

// Instance methods
VendorApplicationSchema.method("isPending", function (): boolean {
    return this.status === "pending";
});

VendorApplicationSchema.method("isApproved", function (): boolean {
    return this.status === "approved";
});

VendorApplicationSchema.method("isRejected", function (): boolean {
    return this.status === "rejected";
});

// Approve application - Sets status, reviewedBy, and reviewedAt
VendorApplicationSchema.method("approve", async function (adminId: string) {
    this.status = "approved";
    this.reviewedBy = new mongoose.Types.ObjectId(adminId);
    this.reviewedAt = new Date();
    this.rejectionReason = undefined;   // Clear any previous rejection reason

    return this.save();
});

// Reject application - Sets status, reviewedBy, reviewedAt, and reason
VendorApplicationSchema.method(
    "reject",
    async function (adminId: string, reason: string) {
        this.status = "rejected";
        this.reviewedBy = new mongoose.Types.ObjectId(adminId);
        this.reviewedAt = new Date();
        this.rejectionReason = reason;

        return this.save();
    }
);

// Static methods
VendorApplicationSchema.static(
    "findPendingByUserId",
    async function (userId: string) {
        return this.findOne({
            userId: new mongoose.Types.ObjectId(userId),
            status: "pending",
        });
    }
);

VendorApplicationSchema.static(
    "hasPendingApplication",
    async function (userId: string): Promise<boolean> {
        const count = await this.countDocuments({
            userId: new mongoose.Types.ObjectId(userId),
            status: "pending",
        });

        return count > 0;
    }
);

// Get all pending applications (admin review queue) - Sorted by submission date (oldest first)
VendorApplicationSchema.static(
    "getPendingApplications",
    async function (limit: number = 50) {
        return this.find({ status: "pending" })
            .populate("userId", "name email")
            .sort({ submittedAt: 1 })
            .limit(limit);
    }
);

// Get applications reviewed by admin
VendorApplicationSchema.static(
    "getReviewedByAdmin",
    async function (adminId: string, limit: number = 50) {
        return this.find({
            reviewedBy: new mongoose.Types.ObjectId(adminId),
        })
            .populate("userId", "name email")
            .sort({ reviewedAt: -1 })
            .limit(limit);
    }
);

// Get application statistics
VendorApplicationSchema.static("getStatistics", async function () {
    const [pending, approved, rejected, total] = await Promise.all([
        this.countDocuments({ status: "pending" }),
        this.countDocuments({ status: "approved" }),
        this.countDocuments({ status: "rejected" }),
        this.countDocuments(),
    ]);

    return { pending, approved, rejected, total };
});

//  Get user's application history
VendorApplicationSchema.static(
    "getUserApplications",
    async function (userId: string) {
        return this.find({
            userId: new mongoose.Types.ObjectId(userId),
        })
            .sort({ submittedAt: -1 })
            .populate("reviewedBy", "name email");
    }
);

// Prevent model recompilation in Next.js development
const existingModel = mongoose.models.VendorApplication as VendorApplicationModelType;
export const VendorApplicationModel =
    existingModel ||
    mongoose.model<VendorApplication, VendorApplicationModelType>('VendorApplication', VendorApplicationSchema);