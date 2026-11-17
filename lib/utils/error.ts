export function getErrorMessage(
    err: unknown,
    fallback: string = 'Something went wrong. Please try again.',
): string {
    return err instanceof Error ? err.message : fallback;
};