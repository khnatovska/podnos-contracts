import { describe, expect, it } from 'vitest';
import {
    weeklyScheduleViewSchema,
    type WeeklyScheduleView,
} from './itinerary.ts';

/**
 * A hand-written, known-good WeeklyScheduleView: two days, a couple of plates,
 * entry shares that add up to 100. Used below for safeParse round-trips so CI
 * has something to run against the published contracts.
 */
const goodView: WeeklyScheduleView = {
    id: 'w-00000000001',
    startDate: '2026-09-04',
    endDate: '2026-09-05',
    createdAt: '2026-09-01T12:00:00Z',
    days: [
        {
            date: '2026-09-04',
            plates: [
                {
                    id: 'p-00000000001',
                    slot: 'breakfast',
                    entries: [
                        {
                            recipeId: 'r-00000000001',
                            recipeName: 'Oatmeal',
                            labels: [{ id: 'l-00000000001', name: 'vegan' }],
                            ingredients: [
                                {
                                    ingredientId: 'i-00000000001',
                                    name: 'oats',
                                    kind: 'grain',
                                    quantity: 80,
                                    unit: 'g',
                                },
                                {
                                    ingredientId: 'i-00000000002',
                                    name: 'milk',
                                    kind: 'protein',
                                    quantity: 200,
                                    unit: 'ml',
                                },
                            ],
                            share: 100,
                        },
                    ],
                },
                {
                    id: 'p-00000000002',
                    slot: 'dinner',
                    entries: [
                        {
                            recipeId: 'r-00000000002',
                            recipeName: 'Rice',
                            labels: [],
                            ingredients: [
                                {
                                    ingredientId: 'i-00000000003',
                                    name: 'rice',
                                    kind: 'grain',
                                    quantity: 150,
                                    unit: 'g',
                                },
                            ],
                            share: 60,
                        },
                        {
                            recipeId: 'r-00000000003',
                            recipeName: 'Curry',
                            labels: [],
                            ingredients: [],
                            share: 40,
                        },
                    ],
                },
            ],
        },
        {
            date: '2026-09-05',
            plates: [
                {
                    id: 'p-00000000003',
                    slot: 'lunch',
                    entries: [
                        {
                            recipeId: 'r-00000000004',
                            recipeName: 'Salad',
                            labels: [],
                            ingredients: [],
                            share: 100,
                        },
                    ],
                },
            ],
        },
    ],
};

describe('weeklyScheduleViewSchema', () => {
    it('accepts a known-good view and round-trips it unchanged', () => {
        const parsed = weeklyScheduleViewSchema.safeParse(goodView);
        expect(parsed.success).toBe(true);
        expect(parsed.data).toEqual(goodView);
    });

    it('round-trips a JSON serialize/parse of the known-good view', () => {
        const wire = JSON.parse(JSON.stringify(goodView)) as unknown;
        const parsed = weeklyScheduleViewSchema.safeParse(wire);
        expect(parsed.success).toBe(true);
        expect(parsed.data).toEqual(goodView);
    });

    it('rejects a view whose id is not a weekly-schedule id', () => {
        const parsed = weeklyScheduleViewSchema.safeParse({
            ...goodView,
            id: 'r-00000000001',
        });
        expect(parsed.success).toBe(false);
    });

    it('rejects a view with a malformed createdAt', () => {
        const parsed = weeklyScheduleViewSchema.safeParse({
            ...goodView,
            createdAt: 'not-a-timestamp',
        });
        expect(parsed.success).toBe(false);
    });

    it('keeps each entry’s full ingredient list on the parsed view', () => {
        const parsed = weeklyScheduleViewSchema.parse(goodView);
        const oatmeal = parsed.days
            .flatMap((day) => day.plates)
            .flatMap((plate) => plate.entries)
            .find((entry) => entry.recipeName === 'Oatmeal');

        expect(oatmeal?.ingredients).toEqual([
            {
                ingredientId: 'i-00000000001',
                name: 'oats',
                kind: 'grain',
                quantity: 80,
                unit: 'g',
            },
            {
                ingredientId: 'i-00000000002',
                name: 'milk',
                kind: 'protein',
                quantity: 200,
                unit: 'ml',
            },
        ]);
    });

    it('rejects an entry with no ingredients array', () => {
        const bad = JSON.parse(JSON.stringify(goodView)) as {
            days: { plates: { entries: Record<string, unknown>[] }[] }[];
        };
        const entry = bad.days[0]?.plates[0]?.entries[0];
        if (entry) delete entry.ingredients;

        expect(weeklyScheduleViewSchema.safeParse(bad).success).toBe(false);
    });
});
