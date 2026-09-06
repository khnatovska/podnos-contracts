import { z as zod } from 'zod';
import {
    RECIPE_ID_FORMAT,
    PLATE_ID_FORMAT,
    DAILY_MEAL_ID_FORMAT,
    WEEKLY_SCHEDULE_ID_FORMAT,
} from './ids.ts';
import { labelSchema } from './label.ts';
import { recipeIngredientViewSchema } from './recipe.ts';

/**
 * Meal planning is modelled at four nested levels:
 *
 *   plateEntry      one recipe + the % of the plate it takes up
 *   plate           every recipe planned for a single time slot (e.g. dinner)
 *   dailyMeal       the plates planned for a single day (up to one per slot)
 *   weeklySchedule  the daily meals planned across a week
 *
 * Each level has three shapes:
 *
 *   *WriteInputSchema  what a client sends when creating / replacing that level
 *   *RecordSchema      what the repository persists — generated ids + `recipeId`
 *                      references, no recipe data copied in
 *   *ViewSchema        a read projection: adds the recipe's `recipeName`,
 *                      `labels` and `ingredients`, resolved live from the recipe
 *                      repo — enough to render and edit a plan client-side (and
 *                      re-derive its highlights / shopping list) without a
 *                      second fetch. Still no `steps` or `description`.
 *
 * A plate always feeds MEAL_HEADCOUNT people in this iteration (see
 * constants.ts), so an entry carries no absolute portion — only `share`, the
 * percent of the plate given to that recipe. The entries on a plate sum to 100.
 *
 * Writes are accepted at week, day or plate granularity through the single
 * {@link scheduleWriteInputSchema} discriminated union.
 */

export const mealSlotSchema = zod.enum(['breakfast', 'lunch', 'dinner']);
export type MealSlot = zod.infer<typeof mealSlotSchema>;

/* --------------------------------------------------------------------------- *
 * plateEntry — a recipe within a plate
 * --------------------------------------------------------------------------- */

/** Percent of a plate given to one recipe: a whole number from 1 to 100. */
export const plateShareSchema = zod.number().int().min(1).max(100);

export const plateEntryWriteInputSchema = zod.object({
    recipeId: RECIPE_ID_FORMAT(),
    share: plateShareSchema,
});

export const plateEntryViewSchema = zod.object({
    recipeId: RECIPE_ID_FORMAT(),
    recipeName: zod.string().min(1),
    labels: zod.array(labelSchema),
    ingredients: zod.array(recipeIngredientViewSchema),
    share: plateShareSchema,
});

/* --------------------------------------------------------------------------- *
 * plate — a meal for one time slot, holding one or more plate entries
 * --------------------------------------------------------------------------- */

const sharesSumTo100 = (entries: { share: number }[]): boolean =>
    entries.reduce((sum, entry) => sum + entry.share, 0) === 100;

export const plateWriteInputSchema = zod.object({
    slot: mealSlotSchema,
    entries: zod
        .array(plateEntryWriteInputSchema)
        .min(1)
        .refine(sharesSumTo100, { message: 'entry shares must add up to 100' }),
});

export const plateViewSchema = zod.object({
    id: PLATE_ID_FORMAT(),
    slot: mealSlotSchema,
    entries: zod.array(plateEntryViewSchema),
});

/* --------------------------------------------------------------------------- *
 * dailyMeal — the plates planned for a single day, at most one per slot
 * --------------------------------------------------------------------------- */

const allDistinct = (values: readonly string[]): boolean =>
    new Set(values).size === values.length;

export const dailyMealWriteInputSchema = zod.object({
    date: zod.iso.date(),
    plates: zod
        .array(plateWriteInputSchema)
        .min(1)
        .max(3)
        .refine((plates) => allDistinct(plates.map((plate) => plate.slot)), {
            message: 'a day cannot have two plates for the same slot',
        }),
});

export const dailyMealViewSchema = zod.object({
    id: DAILY_MEAL_ID_FORMAT(),
    date: zod.iso.date(),
    plates: zod.array(plateViewSchema),
});

/* --------------------------------------------------------------------------- *
 * weeklySchedule — daily meals across a week
 * --------------------------------------------------------------------------- */

export const weeklyScheduleWriteInputSchema = zod.object({
    name: zod.string().min(1),
    days: zod
        .array(dailyMealWriteInputSchema)
        .min(1)
        .max(7)
        .refine((days) => allDistinct(days.map((day) => day.date)), {
            message: 'a schedule cannot have two daily meals for the same date',
        }),
});

export const weeklyScheduleViewSchema = zod.object({
    id: WEEKLY_SCHEDULE_ID_FORMAT(),
    name: zod.string().min(1),
    startDate: zod.iso.date(),
    endDate: zod.iso.date(),
    days: zod.array(dailyMealViewSchema),
    createdAt: zod.iso.datetime(),
});

/**
 * The listing projection: enough to render a card in a list of schedules
 * without shipping every plate and recipe.
 */
export const weeklyScheduleSummaryViewSchema = zod.object({
    id: WEEKLY_SCHEDULE_ID_FORMAT(),
    name: zod.string().min(1),
    startDate: zod.iso.date(),
    endDate: zod.iso.date(),
    dayCount: zod.number().int().nonnegative(),
    plateCount: zod.number().int().nonnegative(),
    recipeCount: zod.number().int().nonnegative(),
});

export const weeklyScheduleListResponseSchema = zod.object({
    items: zod.array(weeklyScheduleSummaryViewSchema),
    total: zod.number().int().nonnegative(),
});

/* --------------------------------------------------------------------------- *
 * unified write — accept a whole week, a single day, or a single plate
 * --------------------------------------------------------------------------- */

/**
 * Day- and plate-level writes patch an existing weekly schedule, so they carry
 * the target `scheduleId` (and, for a plate, the `date` of the day it lands in).
 * A plate write replaces the plate for that slot on that day.
 */
export const scheduleWriteInputSchema = zod.discriminatedUnion('granularity', [
    weeklyScheduleWriteInputSchema.extend({
        granularity: zod.literal('week'),
    }),
    dailyMealWriteInputSchema.extend({
        granularity: zod.literal('day'),
        scheduleId: WEEKLY_SCHEDULE_ID_FORMAT(),
    }),
    plateWriteInputSchema.extend({
        granularity: zod.literal('plate'),
        scheduleId: WEEKLY_SCHEDULE_ID_FORMAT(),
        date: zod.iso.date(),
    }),
]);

/* --------------------------------------------------------------------------- *
 * inferred types
 * --------------------------------------------------------------------------- */

export type PlateShare = zod.infer<typeof plateShareSchema>;
export type PlateEntryWriteInput = zod.infer<typeof plateEntryWriteInputSchema>;
export type PlateEntryView = zod.infer<typeof plateEntryViewSchema>;
export type PlateWriteInput = zod.infer<typeof plateWriteInputSchema>;
export type PlateView = zod.infer<typeof plateViewSchema>;
export type DailyMealWriteInput = zod.infer<typeof dailyMealWriteInputSchema>;
export type DailyMealView = zod.infer<typeof dailyMealViewSchema>;
export type WeeklyScheduleWriteInput = zod.infer<
    typeof weeklyScheduleWriteInputSchema
>;
export type WeeklyScheduleView = zod.infer<typeof weeklyScheduleViewSchema>;
export type WeeklyScheduleSummaryView = zod.infer<
    typeof weeklyScheduleSummaryViewSchema
>;
export type WeeklyScheduleListResponse = zod.infer<
    typeof weeklyScheduleListResponseSchema
>;
export type ScheduleWriteInput = zod.infer<typeof scheduleWriteInputSchema>;
