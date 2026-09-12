import { z as zod } from 'zod';
import {
    INGREDIENT_ID_FORMAT,
    RECIPE_ID_FORMAT,
    LABEL_ID_FORMAT,
} from './ids.ts';
import { ingredientKindSchema, groceryCategorySchema } from './ingredient.ts';
import { labelSchema } from './label.ts';

export const recipeIngredientWriteInputSchema = zod.object({
    ingredientId: INGREDIENT_ID_FORMAT(),
    quantity: zod.number().positive(),
    unit: zod.string().min(1),
});

export const recipeIngredientViewSchema = zod.object({
    ingredientId: INGREDIENT_ID_FORMAT(),
    name: zod.string().min(1),
    /** Resolved from the ingredient, like `name` — the recipe author only references an id. */
    kind: ingredientKindSchema,
    /** Resolved from the ingredient, like `kind`. */
    groceryCategory: groceryCategorySchema,
    quantity: zod.number().positive(),
    unit: zod.string().min(1),
});

export const recipeWriteInputSchema = zod.object({
    id: RECIPE_ID_FORMAT(),
    name: zod.string().min(1),
    description: zod.string(),
    ingredients: zod
        .array(recipeIngredientWriteInputSchema)
        .refine(
            (ingredients) =>
                new Set(ingredients.map((i) => i.ingredientId)).size ===
                ingredients.length,
            { message: 'a recipe cannot list the same ingredient twice' },
        ),
    steps: zod.array(zod.string().min(1)),
    labelIds: zod.array(LABEL_ID_FORMAT()),
});

export const recipeViewSchema = zod.object({
    id: RECIPE_ID_FORMAT(),
    name: zod.string().min(1),
    description: zod.string(),
    ingredients: zod.array(recipeIngredientViewSchema),
    steps: zod.array(zod.string().min(1)),
    labels: zod.array(labelSchema),
});

export const recipeViewListResponseSchema = zod.object({
    items: zod.array(recipeViewSchema),
    total: zod.number().int().nonnegative(),
});

export type RecipeIngredientWriteInput = zod.infer<
    typeof recipeIngredientWriteInputSchema
>;
export type RecipeIngredientView = zod.infer<typeof recipeIngredientViewSchema>;
export type RecipeWriteInput = zod.infer<typeof recipeWriteInputSchema>;
export type RecipeView = zod.infer<typeof recipeViewSchema>;
export type RecipeViewListResponse = zod.infer<
    typeof recipeViewListResponseSchema
>;
