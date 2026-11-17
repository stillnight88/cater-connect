import { Types } from 'mongoose';

export interface MenuItem {
    _id: Types.ObjectId;
    vendorId: Types.ObjectId;       // ref: 'VendorProfile'
    name: string;
    description: string;
    price: number;
    category: string;
    status: 'draft' | 'published';
    isDeleted: boolean;
    deletedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface MenuItemPublic {
    id: string;
    vendorId: string;
    name: string;
    description: string;
    price: number;
    category: string;
    status: 'draft' | 'published';
    createdAt: Date;
}

export function toMenuItemPublic(item: MenuItem): MenuItemPublic {
    return {
        id: item._id.toString(),
        vendorId: item.vendorId.toString(),
        name: item.name,
        description: item.description,
        price: item.price,
        category: item.category,
        status: item.status,
        createdAt: item.createdAt,
    };
}