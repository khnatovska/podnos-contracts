import { z as zod } from 'zod';
import { INGREDIENT_ID_FORMAT } from './ids.ts';

export const ingredientSchema = zod.object({
    id: INGREDIENT_ID_FORMAT(),
    name: zod.string().min(1),
});

export const ingredientWriteInputSchema = zod.object({
    id: INGREDIENT_ID_FORMAT(),
    name: zod.string().min(1),
});

export const ingredientListResponseSchema = zod.object({
    items: zod.array(ingredientSchema),
    total: zod.number().int().nonnegative(),
});

export type Ingredient = zod.infer<typeof ingredientSchema>;
export type IngredientWriteInput = zod.infer<typeof ingredientWriteInputSchema>;
export type IngredientListResponse = zod.infer<
    typeof ingredientListResponseSchema
>;
