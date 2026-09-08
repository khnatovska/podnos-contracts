import { describe, expect, it } from 'vitest';
import {
    INGREDIENT_ID_PATTERN,
    RECIPE_ID_PATTERN,
    WEEKLY_SCHEDULE_ID_PATTERN,
} from './ids.ts';

describe('id patterns', () => {
    it('accept an 11-digit legacy seed body', () => {
        expect(WEEKLY_SCHEDULE_ID_PATTERN.test('w-00000000001')).toBe(true);
        expect(RECIPE_ID_PATTERN.test('r-00000000022')).toBe(true);
    });

    it('accept a 32-char hex body (a crypto.randomUUID with dashes stripped)', () => {
        expect(
            WEEKLY_SCHEDULE_ID_PATTERN.test(
                'w-9b1deb4d3b7d4bad9bdd2b0d7b3dcb6d',
            ),
        ).toBe(true);
    });

    it('reject the wrong prefix', () => {
        expect(WEEKLY_SCHEDULE_ID_PATTERN.test('r-00000000001')).toBe(false);
        expect(INGREDIENT_ID_PATTERN.test('w-00000000001')).toBe(false);
    });

    it('reject a non-hex or wrong-length body', () => {
        expect(WEEKLY_SCHEDULE_ID_PATTERN.test('w-0000000000g')).toBe(false); // g
        expect(WEEKLY_SCHEDULE_ID_PATTERN.test('w-0000000')).toBe(false); // too short
        expect(WEEKLY_SCHEDULE_ID_PATTERN.test(`w-${'a'.repeat(33)}`)).toBe(
            false,
        );
    });
});
