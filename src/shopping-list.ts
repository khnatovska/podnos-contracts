import { z as zod } from 'zod';
import {
    INGREDIENT_ID_FORMAT,
    RECIPE_ID_FORMAT,
    WEEKLY_SCHEDULE_ID_FORMAT,
} from './ids.ts';
import { ingredientKindSchema, type IngredientKind } from './ingredient.ts';
import { mealSlotSchema } from './itinerary.ts';

/**
 * The shopping list a weekly schedule implies — the wire shape the backend
 * returns for a plan's shopping-list preview (and, later, for the persisted
 * list a confirmed week owns). The fold itself lives in the backend; these are
 * the shape and the rules it must follow.
 *
 * Building one from a `WeeklyScheduleView`:
 *   - a plate entry's ingredient amounts are authored for a whole plate
 *     ({@link MEAL_HEADCOUNT} people); scale them by the entry's `share`
 *     (percent of the plate) before summing.
 *   - pool amounts by (ingredient, unit) — a mismatched unit for one ingredient
 *     stays a separate line rather than being silently reconciled.
 *   - keep every line's `sources`: which day / slot / recipe contributed how
 *     much, so the client can break a line down to where it came from.
 *   - `item.quantity` is the sum of its `sources[].quantity`.
 */

/** One recipe's contribution to a shopping-list line, on one day and slot. */
export const shoppingListSourceSchema = zod.object({
    date: zod.iso.date(),
    slot: mealSlotSchema,
    recipeId: RECIPE_ID_FORMAT(),
    recipeName: zod.string().min(1),
    /** Scaled by the entry's share. */
    quantity: zod.number().positive(),
});

/** One aggregated ingredient to buy for the week. */
export const shoppingListItemSchema = zod.object({
    ingredientId: INGREDIENT_ID_FORMAT(),
    name: zod.string().min(1),
    /**
     * Drives the drawer's sections and its "buy only" toggle —
     * see {@link STAPLE_INGREDIENT_KINDS}.
     */
    kind: ingredientKindSchema,
    unit: zod.string().min(1),
    /** Sum of `sources[].quantity`. */
    quantity: zod.number().positive(),
    sources: zod.array(shoppingListSourceSchema).min(1),
});

export const shoppingListSchema = zod.object({
    scheduleId: WEEKLY_SCHEDULE_ID_FORMAT(),
    startDate: zod.iso.date(),
    endDate: zod.iso.date(),
    items: zod.array(shoppingListItemSchema),
    /** `items.length` — every line, before any client-side kind filter. */
    total: zod.number().int().nonnegative(),
});

export type ShoppingListSource = zod.infer<typeof shoppingListSourceSchema>;
export type ShoppingListItem = zod.infer<typeof shoppingListItemSchema>;
export type ShoppingList = zod.infer<typeof shoppingListSchema>;

/**
 * Ingredient kinds the drawer hides in its default "buy only" view — things a
 * household generally already has; the "show everything" toggle reveals them.
 * A presentation default, kept here so the planner and the web client agree.
 */
export const STAPLE_INGREDIENT_KINDS: readonly IngredientKind[] = [
    'aromatic',
    'pantry',
];
