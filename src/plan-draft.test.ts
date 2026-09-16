import { describe, expect, it } from 'vitest';
import {
    weeklyScheduleDraftViewSchema,
    type WeeklyScheduleDraftView,
} from './plan-draft.ts';

/**
 * A hand-written, known-good WeeklyScheduleDraftView: one existing recipe
 * entry and one new-recipe entry (itself mixing an existing and a new
 * ingredient) — enough to exercise every branch of the discriminated unions.
 */
const goodView: WeeklyScheduleDraftView = {
    startDate: '2026-09-04',
    endDate: '2026-09-04',
    days: [
        {
            date: '2026-09-04',
            plates: [
                {
                    slot: 'breakfast',
                    entries: [
                        {
                            kind: 'existing',
                            recipeId: 'r-00000000001',
                            recipeName: 'Oatmeal',
                            labels: [{ id: 'l-00000000001', name: 'vegan' }],
                            ingredients: [
                                {
                                    ingredientId: 'i-00000000001',
                                    name: 'oats',
                                    kind: 'grain',
                                    groceryCategory: 'grains_bread',
                                    quantity: 80,
                                    unit: 'g',
                                },
                            ],
                            share: 100,
                        },
                    ],
                },
                {
                    slot: 'dinner',
                    entries: [
                        {
                            kind: 'new',
                            share: 100,
                            newRecipe: {
                                name: 'Лосось з кіноа',
                                labels: [
                                    { id: 'l-00000000002', name: 'омега-3' },
                                ],
                                rationale:
                                    'риба ще не зустрічалась цього тижня',
                                ingredients: [
                                    {
                                        kind: 'existing',
                                        ingredientId: 'i-00000000002',
                                        name: 'лосось',
                                        ingredientKind: 'protein',
                                        groceryCategory: 'meat_fish',
                                        quantity: 150,
                                        unit: 'g',
                                    },
                                    {
                                        kind: 'new',
                                        name: 'кіноа',
                                        ingredientKind: 'grain',
                                        groceryCategory: 'grains_bread',
                                        rationale:
                                            'легкий гарнір із зерна, якого ще не було в тижні',
                                        quantity: 100,
                                        unit: 'g',
                                    },
                                ],
                            },
                        },
                    ],
                },
            ],
        },
    ],
};

describe('weeklyScheduleDraftViewSchema', () => {
    it('accepts a known-good view and round-trips it unchanged', () => {
        const parsed = weeklyScheduleDraftViewSchema.safeParse(goodView);
        expect(parsed.success).toBe(true);
        expect(parsed.data).toEqual(goodView);
    });

    it('round-trips a JSON serialize/parse of the known-good view', () => {
        const wire = JSON.parse(JSON.stringify(goodView)) as unknown;
        const parsed = weeklyScheduleDraftViewSchema.safeParse(wire);
        expect(parsed.success).toBe(true);
        expect(parsed.data).toEqual(goodView);
    });

    it('rejects an existing plate entry missing recipeName', () => {
        const bad = JSON.parse(JSON.stringify(goodView)) as {
            days: { plates: { entries: Record<string, unknown>[] }[] }[];
        };
        delete bad.days[0]!.plates[0]!.entries[0]!.recipeName;

        expect(weeklyScheduleDraftViewSchema.safeParse(bad).success).toBe(
            false,
        );
    });

    it('rejects a new plate entry whose newRecipe has no ingredients', () => {
        const bad = JSON.parse(JSON.stringify(goodView)) as {
            days: { plates: { entries: Record<string, unknown>[] }[] }[];
        };
        const entry = bad.days[0]!.plates[1]!.entries[0]! as {
            newRecipe: { ingredients: unknown[] };
        };
        entry.newRecipe.ingredients = [];

        expect(weeklyScheduleDraftViewSchema.safeParse(bad).success).toBe(
            false,
        );
    });

    it('rejects a discriminant value other than "existing" or "new"', () => {
        const bad = JSON.parse(JSON.stringify(goodView)) as {
            days: { plates: { entries: Record<string, unknown>[] }[] }[];
        };
        bad.days[0]!.plates[0]!.entries[0]!.kind = 'pending';

        expect(weeklyScheduleDraftViewSchema.safeParse(bad).success).toBe(
            false,
        );
    });
});
