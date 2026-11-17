import { z } from 'zod';

export const createMenuItemSchema = z.object({
    name: z.string().min(2).max(100),
    description: z.string().min(10).max(500),
    price: z.number().int().min(1),         
    category: z.string().min(2).max(50),
});

export const updateMenuItemSchema = createMenuItemSchema.partial();

export type CreateMenuItemInput = z.infer<typeof createMenuItemSchema>;
export type UpdateMenuItemInput  = z.infer<typeof updateMenuItemSchema>;
