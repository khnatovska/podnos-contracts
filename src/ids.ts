import { z as zod } from 'zod';

/**
 * A domain id: `<prefix>-<hex>`. The hex body is 11–32 chars — legacy seed ids
 * carry an 11-digit body (`w-00000000001`); ids minted at runtime carry a
 * 32-char hex body from `crypto.randomUUID()`, for collision safety.
 */
const idPattern = (prefix: string): RegExp =>
    new RegExp(`^${prefix}-[0-9a-f]{11,32}$`);

export const INGREDIENT_ID_PATTERN = idPattern('i');
export const RECIPE_ID_PATTERN = idPattern('r');
export const LABEL_ID_PATTERN = idPattern('l');
export const PLATE_ID_PATTERN = idPattern('p');
export const DAILY_MEAL_ID_PATTERN = idPattern('d');
export const WEEKLY_SCHEDULE_ID_PATTERN = idPattern('w');

/** Every planned meal feeds this many people in the current iteration. */
export const MEAL_HEADCOUNT = 2;

export const INGREDIENT_ID_FORMAT = () =>
    zod.stringFormat('ingredientId', INGREDIENT_ID_PATTERN);
export const RECIPE_ID_FORMAT = () =>
    zod.stringFormat('recipeId', RECIPE_ID_PATTERN);
export const LABEL_ID_FORMAT = () =>
    zod.stringFormat('labelId', LABEL_ID_PATTERN);
export const PLATE_ID_FORMAT = () =>
    zod.stringFormat('plateId', PLATE_ID_PATTERN);
export const DAILY_MEAL_ID_FORMAT = () =>
    zod.stringFormat('dailyMealId', DAILY_MEAL_ID_PATTERN);
export const WEEKLY_SCHEDULE_ID_FORMAT = () =>
    zod.stringFormat('weeklyScheduleId', WEEKLY_SCHEDULE_ID_PATTERN);
