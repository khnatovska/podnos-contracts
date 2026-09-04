import { z as zod } from 'zod';

export const INGREDIENT_ID_PATTERN = /^i-[0-9]{11}$/;
export const RECIPE_ID_PATTERN = /^r-[0-9]{11}$/;
export const LABEL_ID_PATTERN = /^l-[0-9]{11}$/;
export const PLATE_ID_PATTERN = /^p-[0-9]{11}$/;
export const DAILY_MEAL_ID_PATTERN = /^d-[0-9]{11}$/;
export const WEEKLY_SCHEDULE_ID_PATTERN = /^w-[0-9]{11}$/;

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
