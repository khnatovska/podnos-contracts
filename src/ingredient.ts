import { z as zod } from 'zod';
import { INGREDIENT_ID_FORMAT } from './ids.ts';

/**
 * What an ingredient *is* — intrinsic to the ingredient, not a per-recipe role.
 * Drives the week's "key ingredients" panel (ranked by how many meals use each)
 * and, later, shopping-list sections.
 *
 *   protein     meat, fish, eggs, cottage cheese, yogurt
 *   vegetable   the substantive vegetables
 *   fruit       incl. avocado — kept for its fats, but shopped as produce
 *   grain       гречка / ячка / висівки / хлібець …
 *   fat         oils, nuts, seeds
 *   aromatic    garlic / onion / ginger / fresh herbs, and lemon/lime used as
 *               seasoning — always present, never the point: left out of the
 *               panel, still its own shopping section
 *   pantry      salt, spices, sauces, sweetener, gelatin — "check the shelf",
 *               left out of the panel
 */
export const INGREDIENT_KINDS = [
    'protein',
    'vegetable',
    'fruit',
    'grain',
    'fat',
    'aromatic',
    'pantry',
] as const;
export type IngredientKind = (typeof INGREDIENT_KINDS)[number];

export const ingredientKindSchema = zod.enum(INGREDIENT_KINDS);

/**
 * The kinds the "key ingredients" panel ranks, in the order it groups them —
 * protein first (the "am I eating the same protein all week?" check), then
 * vegetables, then fruit. Everything else (grains, fats, aromatics, pantry) is
 * background there. An allowlist on purpose: a new kind is shown only once
 * someone decides it belongs, and where.
 */
export const KEY_INGREDIENT_KINDS: readonly IngredientKind[] = [
    'protein',
    'vegetable',
    'fruit',
];

export const ingredientSchema = zod.object({
    id: INGREDIENT_ID_FORMAT(),
    name: zod.string().min(1),
    kind: ingredientKindSchema,
});

export const ingredientWriteInputSchema = zod.object({
    id: INGREDIENT_ID_FORMAT(),
    name: zod.string().min(1),
    kind: ingredientKindSchema,
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
