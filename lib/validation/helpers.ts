import { ZodError } from 'zod';

export interface FormattedError {
    field: string;
    message: string;
}

export function normalizeEmail(email: string) {
    return email.trim().toLowerCase();
};

export function formatZodError(error: ZodError): FormattedError[] {
    return error.issues.map((err) => ({
        field: err.path.join('.'),
        message: err.message
    }));
};