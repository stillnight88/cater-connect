'use client';

import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import {
    Field,
    FieldLabel,
    FieldError,
    FieldGroup,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    createMenuItemSchema,
    type CreateMenuItemInput,
} from '@/lib/validation/schemas/menu.schema';

const CATEGORIES = [
    'Starter',
    'Main Course',
    'Dessert',
    'Beverage',
    'Snack',
    'Breakfast',
    'Custom',
] as const;

interface MenuItemFormProps {
    onSubmit: (data: CreateMenuItemInput) => void;
    isPending: boolean;
    error?: string | null;
}

export function MenuItemForm({
    onSubmit,
    isPending,
    error,
}: MenuItemFormProps) {
    const form = useForm<CreateMenuItemInput>({
        resolver: zodResolver(createMenuItemSchema),
        defaultValues: {
            name: '',
            description: '',
            price: 0,
            category: '',
        },
    });

    return (
        <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
        >
            <FieldGroup>
                <Controller
                    name="name"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor={field.name}>
                                Item name
                            </FieldLabel>
                            <Input
                                {...field}
                                id={field.name}
                                aria-invalid={fieldState.invalid}
                                placeholder="e.g. Paneer Tikka"
                            />
                            {fieldState.invalid && (
                                <FieldError errors={[fieldState.error]} />
                            )}
                        </Field>
                    )}
                />

                <Controller
                    name="description"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor={field.name}>
                                Description
                            </FieldLabel>
                            <Textarea
                                {...field}
                                id={field.name}
                                aria-invalid={fieldState.invalid}
                                placeholder="Describe the dish, ingredients, portion size..."
                                rows={3}
                            />
                            {fieldState.invalid && (
                                <FieldError errors={[fieldState.error]} />
                            )}
                        </Field>
                    )}
                />

                <Controller
                    name="price"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor={field.name}>
                                Price
                            </FieldLabel>
                            <Input
                                {...field}
                                id={field.name}
                                type="number"
                                min={1}
                                aria-invalid={fieldState.invalid}
                                placeholder="e.g. 25000 for ₹250.00"
                                onChange={(e) =>
                                    field.onChange(
                                        parseInt(e.target.value, 10) || 0,
                                    )
                                }
                            />
                            {fieldState.invalid && (
                                <FieldError errors={[fieldState.error]} />
                            )}
                        </Field>
                    )}
                />

                <Controller
                    name="category"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor={field.name}>
                                Category
                            </FieldLabel>
                            <Select
                                value={field.value}
                                onValueChange={field.onChange}
                            >
                                <SelectTrigger
                                    id="category"
                                    aria-invalid={fieldState.invalid}
                                >
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {CATEGORIES.map((cat) => (
                                        <SelectItem
                                            key={cat}
                                            value={cat}
                                        >
                                            {cat}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {fieldState.invalid && (
                                <FieldError errors={[fieldState.error]} />
                            )}
                        </Field>
                    )}
                />

                {error && (
                    <p className="text-sm text-destructive">{error}</p>
                )}

                <Button type="submit" disabled={isPending} size="sm">
                    {isPending && (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    Save as draft
                </Button>
            </FieldGroup>
        </form>
    );
};