import { Schema, model, models, type Model } from 'mongoose';
import type { MenuItem } from '@/types/menu';

const menuItemSchema = new Schema<MenuItem>({
    vendorId: {
        type: Schema.Types.ObjectId,
        ref: 'VendorProfile',
        required: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
        min: 1,
    },
    category: {
        type: String,
        required: true,
        trim: true,
    },
    status: {
        type: String,
        enum: ['draft', 'published'],
        default: 'draft',
        required: true,
    },
    isDeleted: {
        type: Boolean,
        default: false,
        required: true,
    },
    deletedAt: { type: Date },
}, { timestamps: true },);

menuItemSchema.index({ vendorId: 1, isDeleted: 1 });
menuItemSchema.index({ vendorId: 1, status: 1, isDeleted: 1 });

export const MenuItemModel: Model<MenuItem> =
    models.MenuItem || model<MenuItem>('MenuItem', menuItemSchema);