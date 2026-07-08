import { Types } from 'mongoose';

// Vendor application status lifecycle - pending → approved | rejected
export type VendorApplicationStatus = 'pending' | 'approved' | 'rejected';

// Vendor application submitted by customer
export interface VendorApplication {
    _id: Types.ObjectId;
    userId: Types.ObjectId;
    businessName: string;
    description: string;
    phone: string;
    address: string;
    status: VendorApplicationStatus;
    submittedAt: Date;
    reviewedAt?: Date;
    reviewedBy?: Types.ObjectId;     // Admin who approved/rejected
    rejectionReason?: string;
    createdAt: Date;
    updatedAt: Date;
}

//Used by admin routes
export interface VendorApplicationPopulated extends Omit<VendorApplication, 'userId' | 'reviewedBy'> {
    userId: { _id: Types.ObjectId; name: string; email: string };
    reviewedBy?: { _id: Types.ObjectId; name: string; email: string };
}

// Vendor profile created after approval, Contains public business information
export interface VendorProfile {
    _id: Types.ObjectId;
    userId: Types.ObjectId;
    businessName: string;
    description: string;
    phone: string;
    address: string;
    isActive: boolean;   // Can be suspended by admin
    createdAt: Date;
    updatedAt: Date;
}

// Public vendor data for client-side display
export interface VendorPublic {
    id: string;
    businessName: string;
    description: string;
    phone: string;
    address: string;
    isActive: boolean;
    createdAt: Date;
}

// Vendor application data safe for client-side
export interface VendorApplicationPublic {
    id: string;
    businessName: string;
    description: string;
    phone: string;
    address: string;
    status: VendorApplicationStatus;
    submittedAt: Date;
    reviewedAt?: Date;
    rejectionReason?: string;

    // Admin-only populated fields — undefined for non-admin callers
    applicantName?: string;
    applicantEmail?: string;
    reviewedById?: string;
    reviewedByName?: string;
}

// Convert Mongoose VendorProfile to public format
export function toVendorPublic(vendor: VendorProfile): VendorPublic {
    return {
        id: vendor._id.toString(),
        businessName: vendor.businessName,
        description: vendor.description,
        phone: vendor.phone,
        address: vendor.address,
        isActive: vendor.isActive,
        createdAt: vendor.createdAt,
    };
}

// Convert Mongoose VendorApplication to public format
export function toVendorApplicationPublic(
    application: VendorApplication
): VendorApplicationPublic {
    return {
        id: application._id.toString(),
        businessName: application.businessName,
        description: application.description,
        phone: application.phone,
        address: application.address,
        status: application.status,
        submittedAt: application.submittedAt,
        reviewedAt: application.reviewedAt,
        rejectionReason: application.rejectionReason,
    };
}

export function toVendorApplicationAdminPublic(
    application: VendorApplicationPopulated
): VendorApplicationPublic {
    return {
        id: application._id.toString(),
        businessName: application.businessName,
        description: application.description,
        phone: application.phone,
        address: application.address,
        status: application.status,
        submittedAt: application.submittedAt,
        reviewedAt: application.reviewedAt,
        rejectionReason: application.rejectionReason,
        applicantName: application.userId.name,
        applicantEmail: application.userId.email,
        reviewedById: application.reviewedBy?._id.toString(),
        reviewedByName: application.reviewedBy?.name,
    };
}