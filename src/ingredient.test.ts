import { describe, expect, it } from 'vitest';
import {
    INGREDIENT_KINDS,
    KEY_INGREDIENT_KINDS,
    ingredientSchema,
} from './ingredient.ts';

const good = {
    id: 'i-00000000001',
    name: 'куряче філе',
    kind: 'protein',
} as const;

describe('ingredientSchema', () => {
    it('accepts an ingredient with a known kind', () => {
        expect(ingredientSchema.safeParse(good).success).toBe(true);
    });

    it('requires a kind', () => {
        const { kind, ...noKind } = good;
        void kind;
        expect(ingredientSchema.safeParse(noKind).success).toBe(false);
    });

    it('rejects an unknown kind', () => {
        expect(
            ingredientSchema.safeParse({ ...good, kind: 'meat' }).success,
        ).toBe(false);
    });
});

describe('KEY_INGREDIENT_KINDS', () => {
    it('is the panel-worthy subset — no aromatic or pantry', () => {
        expect(KEY_INGREDIENT_KINDS).not.toContain('aromatic');
        expect(KEY_INGREDIENT_KINDS).not.toContain('pantry');
        for (const kind of KEY_INGREDIENT_KINDS) {
            expect(INGREDIENT_KINDS).toContain(kind);
        }
    });
});
