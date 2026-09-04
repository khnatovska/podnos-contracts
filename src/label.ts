import { z as zod } from 'zod';
import { LABEL_ID_FORMAT } from './ids.ts';

export const labelSchema = zod.object({
    id: LABEL_ID_FORMAT(),
    name: zod.string().min(1),
});

export const labelWriteInputSchema = zod.object({
    id: LABEL_ID_FORMAT(),
    name: zod.string().min(1),
});

export const labelListResponseSchema = zod.object({
    items: zod.array(labelSchema),
    total: zod.number().int().nonnegative(),
});

export type Label = zod.infer<typeof labelSchema>;
export type LabelWriteInput = zod.infer<typeof labelWriteInputSchema>;
export type LabelListResponse = zod.infer<typeof labelListResponseSchema>;
