import { Types } from 'mongoose';
import { UserRole } from './user';

// JWT Access Token Payload, Short-lived (15 minutes), For API authorization
export interface AccessTokenPayload {
    userId: string;
    email: string;
    role: UserRole;
    type: 'access';
}

// JWT Refresh Token Payload, Long-lived (7 days), Used only to generate new access tokens
export interface RefreshTokenPayload {
    userId: string;
    tokenId: string;  // Unique identifier for this refresh token
    type: 'refresh';
}

// Stored in database, Allows token invalidation (logout, password reset)
export interface RefreshToken {
    _id: Types.ObjectId;
    userId: Types.ObjectId;
    tokenId: string;        // Matches JWT payload tokenId
    token: string;         // The actual JWT string
    expiresAt: Date;
    createdAt: Date;
    isRevoked: boolean;
}

export type OTPType =
    | 'email_verification'  // Signup email verification
    | 'password_reset'      // Password reset flow
    | 'mfa_login';          // Admin MFA login

// One-Time Password record, Short expiry (5-10 minutes), Single-use only
export interface OTP {
    _id: Types.ObjectId;
    userId: string;
    code: string;        // 6-digit numeric code
    type: OTPType;
    expiresAt: Date;
    verified: boolean;
    attempts: number;   // Rate limit verification attempts
    createdAt: Date;
}

// Session context passed to protected routes, Available after middleware authentication
export interface Session {
    userId: string;
    email: string;
    role: UserRole;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: {
        id: string;
        name: string;
        email: string;
        role: UserRole;
        emailVerified: boolean;
    };
}

// MFA flow state, Temporary state during admin login before MFA verification
export interface MFAPendingSession {
    userId: string;
    email: string;
    role: UserRole;
    timestamp: number;    // For expiry check
}