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

/**
 * Which grocery-store aisle an ingredient is shopped from — independent of
 * {@link IngredientKind}, which is nutritional. The two disagree on purpose:
 * avocado is a `fat` (why it's on the plate) but shops as `produce`; canned
 * tomatoes are a `vegetable` but shop as `pantry_spices`. Drives the shopping
 * list's grouping; `kind` keeps driving its "buy only" filter.
 *
 * No `frozen` category yet — the one frozen ingredient in the current seed
 * (frozen berries) is filed under `produce` for now. Add `frozen` once there
 * are enough frozen ingredients to earn its own shopping-list section.
 */
export const GROCERY_CATEGORIES = [
    'meat_fish',
    'dairy_eggs',
    'produce',
    'grains_bread',
    'nuts_seeds',
    'pantry_spices',
] as const;
export type GroceryCategory = (typeof GROCERY_CATEGORIES)[number];

export const groceryCategorySchema = zod.enum(GROCERY_CATEGORIES);

export const ingredientSchema = zod.object({
    id: INGREDIENT_ID_FORMAT(),
    name: zod.string().min(1),
    kind: ingredientKindSchema,
    groceryCategory: groceryCategorySchema,
});

export const ingredientWriteInputSchema = zod.object({
    id: INGREDIENT_ID_FORMAT(),
    name: zod.string().min(1),
    kind: ingredientKindSchema,
    groceryCategory: groceryCategorySchema,
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
