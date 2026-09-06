import { describe, expect, it } from 'vitest';
import {
    CATEGORY_LABELS,
    compareLabelsByGroup,
    LABEL,
    LABELS,
    labelGroup,
} from './label-group.ts';

describe('LABELS', () => {
    it('has a unique key and name per entry', () => {
        expect(new Set(LABELS.map((l) => l.key)).size).toBe(LABELS.length);
        expect(new Set(LABELS.map((l) => l.name)).size).toBe(LABELS.length);
    });

    it('exposes each name through LABEL, keyed by its handle', () => {
        expect(LABEL.protein).toBe('білок');
        expect(LABEL.omega3).toBe('омега-3');
        expect(Object.values(LABEL).sort()).toEqual(
            LABELS.map((l) => l.name).sort(),
        );
    });
});

describe('labelGroup', () => {
    it('classifies every category label as `category`', () => {
        for (const name of CATEGORY_LABELS) {
            expect(labelGroup(name)).toBe('category');
        }
    });

    it('maps the vocabulary to the expected groups', () => {
        expect(labelGroup(LABEL.lunch)).toBe('slot');
        expect(labelGroup(LABEL.protein)).toBe('category');
        expect(labelGroup(LABEL.sugarFree)).toBe('diet');
        expect(labelGroup(LABEL.omega3)).toBe('nutrition');
    });

    it('falls back to nutrition for an unknown name', () => {
        expect(labelGroup('щось нове')).toBe('nutrition');
    });
});

describe('CATEGORY_LABELS', () => {
    it('is the category names in plate-method reading order', () => {
        expect(CATEGORY_LABELS).toEqual([
            'овочі',
            'білок',
            'складні вуглеводи',
            'корисні жири',
        ]);
    });
});

describe('compareLabelsByGroup', () => {
    it('orders category before diet before nutrition before slot', () => {
        const shuffled = [
            LABEL.dinner,
            LABEL.omega3,
            LABEL.sugarFree,
            LABEL.protein,
        ];
        expect([...shuffled].sort(compareLabelsByGroup)).toEqual([
            LABEL.protein,
            LABEL.sugarFree,
            LABEL.omega3,
            LABEL.dinner,
        ]);
    });

    it('orders the category labels in plate-method reading order', () => {
        const shuffled = [...CATEGORY_LABELS].reverse();
        expect([...shuffled].sort(compareLabelsByGroup)).toEqual([
            ...CATEGORY_LABELS,
        ]);
    });

    it('treats two labels of the same non-category group as equal', () => {
        expect(compareLabelsByGroup(LABEL.flourFree, LABEL.sugarFree)).toBe(0);
    });
});
