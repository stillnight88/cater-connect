import mongoose, { Schema, Model, HydratedDocument } from 'mongoose';
import { User, UserRole } from '@/types/user';
import isEmail from 'validator/lib/isEmail';

export enum Role {
    CUSTOMER = "customer",
    VENDOR = "vendor",
    ADMIN = "admin",
}

type UserDocument = HydratedDocument<User,UserMethods>;

export interface UserMethods {
    isAdmin(): boolean;
    isVendor(): boolean;
    isCustomer(): boolean;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface UserModelType extends Model<User, {}, UserMethods> {
    findByEmailWithPassword(email: string): Promise<UserDocument | null>;
    findVerifiedByEmail(email: string): Promise<UserDocument | null>;
    countByRole(role: UserRole): Promise<number>;
}

// Core identity model for all users in the system
const UserSchema = new Schema<User, UserModelType,UserMethods>({
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
UserSchema.method("isAdmin", function (): boolean {
  return this.role === Role.ADMIN;     // Check if user is admin
});

UserSchema.method("isVendor", function (): boolean {
  return this.role === Role.VENDOR;   // Check if user is vendor
});

UserSchema.method("isCustomer", function (): boolean {
  return this.role === Role.CUSTOMER;  // Check if user is customer
});

// Static methods
UserSchema.static("findByEmailWithPassword", async function (email: string) {
  return this.findOne({ email }).select("+password");
});

UserSchema.static("findVerifiedByEmail", async function (email: string) {
  return this.findOne({ email, emailVerified: true });
});

UserSchema.static("countByRole", async function (role: UserRole) {
  return this.countDocuments({ role });
});

// Prevent model recompilation in Next.js development
const existingModel = mongoose.models.User as UserModelType;
export const UserModel = existingModel || mongoose.model<User,UserModelType>('User', UserSchema);