import { describe, expect, it } from 'vitest';
import {
    shoppingListSchema,
    STAPLE_INGREDIENT_KINDS,
    type ShoppingList,
} from './shopping-list.ts';
import { INGREDIENT_KINDS } from './ingredient.ts';

/**
 * A hand-written, known-good ShoppingList: one protein line reached from two
 * different plates, one aromatic line. Used for safeParse round-trips so CI has
 * something to run against the published shape.
 */
const good: ShoppingList = {
    scheduleId: 'w-00000000001',
    startDate: '2026-09-04',
    endDate: '2026-09-05',
    items: [
        {
            ingredientId: 'i-00000000009',
            name: 'сир',
            kind: 'protein',
            groceryCategory: 'dairy_eggs',
            unit: 'г',
            quantity: 300,
            sources: [
                {
                    date: '2026-09-04',
                    slot: 'breakfast',
                    recipeId: 'r-00000000001',
                    recipeName: 'Сирники',
                    quantity: 100,
                },
                {
                    date: '2026-09-05',
                    slot: 'lunch',
                    recipeId: 'r-00000000003',
                    recipeName: 'Салат',
                    quantity: 200,
                },
            ],
        },
        {
            ingredientId: 'i-00000000013',
            name: 'часник',
            kind: 'aromatic',
            groceryCategory: 'produce',
            unit: 'зубчик',
            quantity: 4,
            sources: [
                {
                    date: '2026-09-04',
                    slot: 'dinner',
                    recipeId: 'r-00000000002',
                    recipeName: 'Айолі',
                    quantity: 4,
                },
            ],
        },
    ],
    total: 2,
};

describe('shoppingListSchema', () => {
    it('accepts a known-good list and round-trips it unchanged', () => {
        const parsed = shoppingListSchema.safeParse(good);
        expect(parsed.success).toBe(true);
        expect(parsed.data).toEqual(good);
    });

    it('round-trips a JSON serialize/parse of the known-good list', () => {
        const wire = JSON.parse(JSON.stringify(good)) as unknown;
        expect(shoppingListSchema.safeParse(wire).success).toBe(true);
    });

    it('rejects a scheduleId that is not a weekly-schedule id', () => {
        expect(
            shoppingListSchema.safeParse({
                ...good,
                scheduleId: 'r-00000000001',
            }).success,
        ).toBe(false);
    });

    it('rejects an item with no sources', () => {
        const bad = {
            ...good,
            items: [{ ...good.items[0], sources: [] }],
        };
        expect(shoppingListSchema.safeParse(bad).success).toBe(false);
    });

    it('rejects a non-positive quantity', () => {
        const bad = {
            ...good,
            items: [{ ...good.items[0], quantity: 0 }],
        };
        expect(shoppingListSchema.safeParse(bad).success).toBe(false);
    });

    it('rejects a source with an unknown slot', () => {
        const bad = JSON.parse(JSON.stringify(good)) as {
            items: { sources: Record<string, unknown>[] }[];
        };
        const source = bad.items[0]?.sources[0];
        if (source) source.slot = 'brunch';
        expect(shoppingListSchema.safeParse(bad).success).toBe(false);
    });
});

describe('STAPLE_INGREDIENT_KINDS', () => {
    it('is the kinds hidden by default in the drawer', () => {
        expect(STAPLE_INGREDIENT_KINDS).toEqual(['aromatic', 'pantry']);
    });

    it('every entry is a real ingredient kind', () => {
        for (const kind of STAPLE_INGREDIENT_KINDS) {
            expect(INGREDIENT_KINDS).toContain(kind);
        }
    });
});
