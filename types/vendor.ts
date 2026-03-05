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