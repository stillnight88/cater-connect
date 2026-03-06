import mongoose, { Schema, Model } from 'mongoose';
import { User, UserRole } from '@/types/user';
import isEmail from 'validator/lib/isEmail';

export enum Role {
    CUSTOMER = "customer",
    VENDOR = "vendor",
    ADMIN = "admin",
}

// Core identity model for all users in the system
const UserSchema = new Schema<User>({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters'],
        maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        index: true,
        validate: {
            validator: v => isEmail(v),
            message: props => `${props.value} is not a valid email!`
        },
        immutable: true,
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        select: false,
        minlength: [6, "Password must be at least 6 characters"],
    },
    role: {
        type: String,
        enum: {
            values: ['customer', 'vendor', 'admin'] as UserRole[],
            message: '{VALUE} is not a valid role'
        },
        default: Role.CUSTOMER,
        index: true
    },
    emailVerified: {
        type: Boolean,
        default: false,
        index: true
    },
    mfaEnabled: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
    collection: 'users'
});

// Indexes for query optimization
UserSchema.index({ email: 1, emailVerified: 1 });   // Index for login queries
UserSchema.index({ role: 1, createdAt: -1 });      // Index for role-based queries (admin dashboards)

// Instance methods
UserSchema.methods = {
    isAdmin(): boolean {
        return this.role === Role.ADMIN        // Check if user is admin
    },

    isVendor(): boolean {
        return this.role === Role.VENDOR       // Check if user is vendor
    },

    isCustomer(): boolean {
        return this.role === Role.CUSTOMER     // Check if user is customer
    }
};

// Static methods for common queries
UserSchema.statics = {
    async findByEmailWithPassword(email: string) {
        return this.findOne({ email }).select('+password');
    },
    async findVerifiedByEmail(email: string) {
        return this.findOne({ email, emailVerified: true });
    },
    async countByRole(role: UserRole) {
        return this.countDocuments({ role });
    },
};

// Prevent model recompilation in Next.js development
export const UserModel: Model<User> = mongoose.models.User || mongoose.model<User>('User', UserSchema);