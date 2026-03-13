import * as argon2 from 'argon2';

// Argon2 configuration - Balanced between security and performance
const HASH_OPTIONS: argon2.Options = {
    type: argon2.argon2id,
    memoryCost: 65536, // 64 MB
    timeCost: 3,  // 3 iterations
    parallelism: 4, // 4 threads
};

// Hash a password using Argon2id
export async function hashPassword(password: string): Promise<string> {
    if (!password || password.length === 0) {
        throw new Error('Password cannot be empty');
    }

    if (password.length > 128) {
        throw new Error('Password is too long (max 128 characters)');
    }

    try {
        return await argon2.hash(password, HASH_OPTIONS);
    } catch (error) {
        console.error('Password hashing error:', error);
        throw new Error('Failed to hash password');
    }
};

// Verify a password against its hash
export async function verifyPassword(hash: string, password: string): Promise<boolean> {
    if (!hash || !password) {
        return false;
    }

    try {
        return await argon2.verify(hash, password);
    } catch (error) {
        console.error('Password verification error:', error);
        return false;
    }
};

export async function needsRehash(hash: string): Promise<boolean> {
    try {
        return argon2.needsRehash(hash, HASH_OPTIONS);
    } catch (error) {
        console.error('Rehash check error:', error);
        return false;
    }
};