import mongoose, { Schema, Model, HydratedDocument } from 'mongoose';
import { VendorProfile } from '@/types/vendor';
import { isValidPhoneNumber } from "libphonenumber-js";

type VendorProfileDocument = HydratedDocument<VendorProfile>;

export interface VendorProfileMethods {
    suspend(): Promise<VendorProfileDocument>;
    reactivate(): Promise<VendorProfileDocument>;
    updateBusinessInfo(data: {
        businessName?: string;
        description?: string;
        phone?: string;
        address?: string;
    }): Promise<VendorProfileDocument>;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface VendorProfileModelType extends Model<VendorProfile, {}, VendorProfileMethods> {
    findByUserId(
        userId: string
    ): Promise<VendorProfileDocument | null>;

    getActiveVendors(
        limit?: number,
        skip?: number
    ): Promise<VendorProfileDocument[]>;

    getAllVendors(
        limit?: number,
        skip?: number
    ): Promise<VendorProfileDocument[]>;

    searchVendors(
        searchTerm: string,
        limit?: number
    ): Promise<VendorProfileDocument[]>;

    getStatistics(): Promise<{
        active: number;
        suspended: number;
        total: number;
    }>;

    existsForUser(userId: string): Promise<boolean>;

    bulkSuspend(userIds: string[]): Promise<number>;

    bulkReactivate(userIds: string[]): Promise<number>;
}

// Vendor Profile Schema - Created after admin approves vendor application, Contains public business information for the platform
const VendorProfileSchema = new Schema<VendorProfile, VendorProfileModelType, VendorProfileMethods>({
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
        index: true,    // For searching vendors
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
        unique: true,
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
    isActive: {
        type: Boolean,
        default: true,
        index: true
    }
}, {
    timestamps: true,
    collection: 'vendor_profiles',
});

// Indexes for query optimization
VendorProfileSchema.index({ businessName: 'text', description: 'text', });  // Text search index for business name and description
VendorProfileSchema.index({ isActive: 1, createdAt: -1 });  // Index for active vendors sorted by creation date

// Instance methods
VendorProfileSchema.method("suspend", async function () {
    this.isActive = false;
    return this.save();
});

VendorProfileSchema.method("reactivate", async function () {
    this.isActive = true;
    return this.save();
});

VendorProfileSchema.method(
    "updateBusinessInfo",
    async function (data: {
        businessName?: string;
        description?: string;
        phone?: string;
        address?: string;
    }) {
        if (data.businessName !== undefined) {
            this.businessName = data.businessName;
        }

        if (data.description !== undefined) {
            this.description = data.description;
        }

        if (data.phone !== undefined) {
            this.phone = data.phone;
        }

        if (data.address !== undefined) {
            this.address = data.address;
        }

        return this.save();
    }
);

// Static methods 
VendorProfileSchema.static(
    "findByUserId",
    async function (userId: string) {
        return this.findOne({
            userId: new mongoose.Types.ObjectId(userId),
        }).populate("userId", "name email role");
    }
);

// Get all active vendors
VendorProfileSchema.static(
    "getActiveVendors",
    async function (limit: number = 50, skip: number = 0) {
        return this.find({ isActive: true })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("userId", "name email");
    }
);

// Get all vendors (including suspended)
VendorProfileSchema.static(
    "getAllVendors",
    async function (limit: number = 50, skip: number = 0) {
        return this.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("userId", "name email role");
    }
);

// Search vendors by business name or description
VendorProfileSchema.static(
    "searchVendors",
    async function (searchTerm: string, limit: number = 20) {
        return this.find(
            { $text: { $search: searchTerm }, isActive: true, },
            { score: { $meta: "textScore" } }
        )
            .sort({ score: { $meta: "textScore" } })
            .limit(limit)
            .populate("userId", "name email");
    }
);

VendorProfileSchema.static("getStatistics", async function () {
    const [active, suspended, total] = await Promise.all([
        this.countDocuments({ isActive: true }),
        this.countDocuments({ isActive: false }),
        this.countDocuments(),
    ]);

    return { active, suspended, total };
});

// Check if vendor profile exists for user
VendorProfileSchema.static(
    "existsForUser",
    async function (userId: string): Promise<boolean> {
        const count = await this.countDocuments({
            userId: new mongoose.Types.ObjectId(userId),
        });

        return count > 0;
    }
);

VendorProfileSchema.static(
    "bulkSuspend",
    async function (userIds: string[]) {
        const result = await this.updateMany(
            { userId: { $in: userIds.map((id) => new mongoose.Types.ObjectId(id)), }, },
            { isActive: false }
        );
        return result.modifiedCount;
    }
);

VendorProfileSchema.static(
    "bulkReactivate",
    async function (userIds: string[]) {
        const result = await this.updateMany(
            { userId: { $in: userIds.map((id) => new mongoose.Types.ObjectId(id)), }, },
            { isActive: true }
        );
        return result.modifiedCount;
    }
);

// Prevent model recompilation in Next.js development
const existingModel = mongoose.models.VendorProfile as VendorProfileModelType;
export const VendorProfileModel =
    existingModel ||
    mongoose.model<VendorProfile, VendorProfileModelType>('VendorProfile', VendorProfileSchema);