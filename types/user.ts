import { Types } from 'mongoose';

export type UserRole = 'customer' | 'vendor' | 'admin';

// Core user identity
export interface User {
    _id: Types.ObjectId;     // MongoDB uses _id
    name: string;
    email: string;
    password: string;
    role: UserRole;
    emailVerified: boolean;
    mfaEnabled: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// User data safe for client-side (no sensitive fields)
export interface UserPublic {
    id: string;            // id when sending responses
    name: string;
    email: string;
    role: UserRole;
    emailVerified: boolean;
    mfaEnabled: boolean;
    createdAt: Date;
}

// Convert Mongoose User document to public-safe format
export function toUserPublic(user: User): UserPublic {
    return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
        mfaEnabled: user.mfaEnabled,
        createdAt: user.createdAt,
    };
}