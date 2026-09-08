import { describe, expect, it } from 'vitest';
import { recipeWriteInputSchema } from './recipe.ts';

const base = {
    id: 'r-00000000001',
    name: 'Салат',
    description: '',
    ingredients: [
        { ingredientId: 'i-00000000001', quantity: 100, unit: 'г' },
        { ingredientId: 'i-00000000002', quantity: 1, unit: 'ст.л.' },
    ],
    steps: ['Змішати.'],
    labelIds: ['l-00000000001'],
};

describe('recipeWriteInputSchema', () => {
    it('accepts a recipe whose ingredients are all distinct', () => {
        expect(recipeWriteInputSchema.safeParse(base).success).toBe(true);
    });

    it('rejects a recipe that lists the same ingredient twice', () => {
        const parsed = recipeWriteInputSchema.safeParse({
            ...base,
            ingredients: [
                { ingredientId: 'i-00000000001', quantity: 100, unit: 'г' },
                { ingredientId: 'i-00000000001', quantity: 50, unit: 'г' },
            ],
        });
        expect(parsed.success).toBe(false);
    });

    it('allows an empty ingredient list', () => {
        expect(
            recipeWriteInputSchema.safeParse({ ...base, ingredients: [] })
                .success,
        ).toBe(true);
    });
});
