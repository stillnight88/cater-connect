'use client';

import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Star } from 'lucide-react';
import {
    Field,
    FieldLabel,
    FieldError,
    FieldGroup,
} from '@/components/ui/field';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
    createReviewSchema,
    type CreateReviewInput,
} from '@/lib/validation/schemas/review.schema';

interface ReviewFormProps {
    onSubmit: (data: CreateReviewInput) => void;
    isPending: boolean;
    error?: string | null;
}

export function ReviewForm({ onSubmit, isPending, error }: ReviewFormProps) {
    const form = useForm<CreateReviewInput>({
        resolver: zodResolver(createReviewSchema),
        defaultValues: {
            rating: 0,
            comment: '',
        },
    });

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FieldGroup>
                <Controller
                    name="rating"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="rating">
                                Your rating
                            </FieldLabel>
                            <div
                                id="rating"
                                className="flex items-center gap-1"
                                role="radiogroup"
                                aria-label="Rating"
                            >
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        role="radio"
                                        aria-checked={field.value === star}
                                        aria-label={`${star} star${star !== 1 ? 's' : ''}`}
                                        onClick={() => field.onChange(star)}
                                        className="p-0.5"
                                    >
                                        <Star
                                            className={cn(
                                                'h-6 w-6 transition-colors',
                                                star <= field.value
                                                    ? 'fill-yellow-400 text-yellow-400'
                                                    : 'fill-none text-muted-foreground',
                                            )}
                                        />
                                    </button>
                                ))}
                            </div>
                            {fieldState.invalid && (
                                <FieldError errors={[fieldState.error]} />
                            )}
                        </Field>
                    )}
                />

                <Controller
                    name="comment"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor={field.name}>
                                Comment{' '}
                                <span className="text-muted-foreground font-normal">
                                    (optional)
                                </span>
                            </FieldLabel>
                            <Textarea
                                {...field}
                                id={field.name}
                                aria-invalid={fieldState.invalid}
                                placeholder="Share details about your experience with this vendor..."
                                rows={4}
                                disabled={isPending}
                            />
                            {fieldState.invalid && (
                                <FieldError errors={[fieldState.error]} />
                            )}
                        </Field>
                    )}
                />
            </FieldGroup>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" disabled={isPending} size="sm">
                {isPending && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Submit review
            </Button>
        </form>
    );
}