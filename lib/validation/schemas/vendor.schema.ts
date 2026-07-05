import { z } from 'zod';
import { isValidPhoneNumber } from 'libphonenumber-js';

const phoneSchema = z
    .string()
    .trim()
    .refine((value) => isValidPhoneNumber(value, 'IN'), {
        message: 'Invalid phone number',
    });

const businessNameSchema = z
    .string()
    .trim()
    .min(2, 'Business name must be at least 2 characters')
    .max(200, 'Business name cannot exceed 200 characters');

const descriptionSchema = z
    .string()
    .trim()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description cannot exceed 2000 characters');

const addressSchema = z
    .string()
    .trim()
    .min(10, 'Address must be at least 10 characters')
    .max(500, 'Address cannot exceed 500 characters');

export const submitVendorApplicationSchema = z.object({
    businessName: businessNameSchema,
    description: descriptionSchema,
    phone: phoneSchema,
    address: addressSchema
});
export type SubmitVendorApplicationInput = z.infer<typeof submitVendorApplicationSchema>;

export const rejectVendorApplicationSchema = z.object({
    rejectionReason: z
        .string()
        .trim()
        .min(10, 'Rejection reason must be at least 10 characters')
        .max(1000, 'Rejection reason cannot exceed 1000 characters'),
});
export type RejectVendorApplicationInput = z.infer<typeof rejectVendorApplicationSchema>;

export const updateVendorProfileSchema = z
    .object({
        businessName: businessNameSchema.optional(),
        description: descriptionSchema.optional(),
        phone: phoneSchema.optional(),
        address: addressSchema.optional()
    })
    .refine((data) => Object.keys(data).length > 0, {
        message: 'At least one field must be provided for update',
    });
export type UpdateVendorProfileInput = z.infer<typeof updateVendorProfileSchema>;