import { z as zod } from 'zod';
import { INGREDIENT_ID_FORMAT, RECIPE_ID_FORMAT } from './ids.ts';
import { groceryCategorySchema, ingredientKindSchema } from './ingredient.ts';
import { labelSchema } from './label.ts';
import { plateShareSchema, mealSlotSchema } from './itinerary.ts';
import { recipeIngredientViewSchema } from './recipe.ts';

/**
 * An AI-generated week, resolved for display — every id a plate-generation
 * run proposes has already been looked up server-side (recipe/label/
 * ingredient names, kinds, grocery categories), the same way
 * `weeklyScheduleViewSchema` resolves a real, persisted schedule. Nothing on
 * this schema is a bare id the client has to chase down with a second fetch.
 *
 * It mirrors `itinerary.ts`'s four-level shape (`plateEntry → plate →
 * dailyMeal → weeklySchedule`), but every level below `plate` is a `kind:
 * 'existing' | 'new'` discriminated union — a generated plan can reference a
 * real recipe/ingredient, or propose a new one that doesn't exist in the
 * catalog yet. `recipeIngredientDraftViewSchema` exists only here (a real
 * recipe's own ingredients are never themselves "existing-or-new").
 *
 * Nothing here is persisted, so there's no `id` at the plate/day/week level
 * and no `createdAt` — those only exist once a draft is accepted and written
 * through `scheduleWriteInputSchema`. `startDate`/`endDate` are included
 * (unlike the raw generator output) purely so the same date-range display
 * logic that reads a real `WeeklyScheduleView` also works unchanged here.
 *
 * Labels are never draftable — a `kind: 'new'` recipe's `labels` only
 * reference the existing label catalog, resolved the same as a real recipe's.
 */

/* --------------------------------------------------------------------------- *
 * recipeIngredientDraftView — an ingredient within a *new* proposed recipe,
 * either a real ingredient (resolved) or a proposed new one
 * --------------------------------------------------------------------------- */

export const recipeIngredientDraftViewSchema = zod.discriminatedUnion('kind', [
    zod.object({
        kind: zod.literal('existing'),
        ingredientId: INGREDIENT_ID_FORMAT(),
        name: zod.string().min(1),
        ingredientKind: ingredientKindSchema,
        groceryCategory: groceryCategorySchema,
        quantity: zod.number().positive(),
        unit: zod.string().min(1),
    }),
    zod.object({
        kind: zod.literal('new'),
        name: zod.string().min(1),
        ingredientKind: ingredientKindSchema,
        groceryCategory: groceryCategorySchema,
        /** Short: what it is + why proposed. */
        rationale: zod.string().min(1),
        quantity: zod.number().positive(),
        unit: zod.string().min(1),
    }),
]);

/* --------------------------------------------------------------------------- *
 * plateEntryDraftView — a recipe within a plate, either a real recipe
 * (resolved, same shape as `plateEntryViewSchema`) or a proposed new one
 * --------------------------------------------------------------------------- */

export const plateEntryDraftViewSchema = zod.discriminatedUnion('kind', [
    zod.object({
        kind: zod.literal('existing'),
        recipeId: RECIPE_ID_FORMAT(),
        recipeName: zod.string().min(1),
        labels: zod.array(labelSchema),
        ingredients: zod.array(recipeIngredientViewSchema),
        share: plateShareSchema,
    }),
    zod.object({
        kind: zod.literal('new'),
        share: plateShareSchema,
        newRecipe: zod.object({
            name: zod.string().min(1),
            labels: zod.array(labelSchema),
            /** Short: what it is + why proposed. */
            rationale: zod.string().min(1),
            ingredients: zod.array(recipeIngredientDraftViewSchema).min(1),
        }),
    }),
]);

/* --------------------------------------------------------------------------- *
 * plateDraftView — a meal for one time slot, holding one or more
 * plateEntryDraftViews
 * --------------------------------------------------------------------------- */

export const plateDraftViewSchema = zod.object({
    slot: mealSlotSchema,
    entries: zod.array(plateEntryDraftViewSchema).min(1),
});

/* --------------------------------------------------------------------------- *
 * dailyMealDraftView — the plateDraftViews planned for a single day, at most
 * one per slot
 * --------------------------------------------------------------------------- */

export const dailyMealDraftViewSchema = zod.object({
    date: zod.iso.date(),
    plates: zod.array(plateDraftViewSchema).min(1).max(3),
});

/* --------------------------------------------------------------------------- *
 * weeklyScheduleDraftView — the dailyMealDraftViews proposed across a week
 * --------------------------------------------------------------------------- */

export const weeklyScheduleDraftViewSchema = zod.object({
    startDate: zod.iso.date(),
    endDate: zod.iso.date(),
    days: zod.array(dailyMealDraftViewSchema).min(1).max(7),
});

/* --------------------------------------------------------------------------- *
 * inferred types
 * --------------------------------------------------------------------------- */

export type RecipeIngredientDraftView = zod.infer<
    typeof recipeIngredientDraftViewSchema
>;
export type PlateEntryDraftView = zod.infer<typeof plateEntryDraftViewSchema>;
export type PlateDraftView = zod.infer<typeof plateDraftViewSchema>;
export type DailyMealDraftView = zod.infer<typeof dailyMealDraftViewSchema>;
export type WeeklyScheduleDraftView = zod.infer<
    typeof weeklyScheduleDraftViewSchema
>;
