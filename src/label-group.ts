/**
 * The label vocabulary and its taxonomy — one table both repos read, so the
 * Ukrainian label strings are written once. Kept off the `Label` schema on
 * purpose: the wire shape of a `Label` is unchanged, this is a pure lookup that
 * every consumer (the meal planner, the web client's tags, a future
 * swap-candidate endpoint) shares.
 *
 * Groups:
 *   slot       сніданок / обід / вечеря — the plate's time of day. Also carries
 *              the diet's timing rules (fruit/grains are simply never tagged
 *              `вечеря`). Rarely shown as a tag; used to match swap candidates.
 *   category   the food component (protein / vegetables / complex carbs /
 *              healthy fats). An entry usually has one or two. This is the
 *              primary "similar" axis for swap candidates.
 *   diet       "free-from" notes (без борошна / без цукру). Informational.
 *   nutrition  "source of" highlights (омега-3, джерело заліза, …). Informational.
 *
 * Identity is the `name` — that is what a recipe references, what rides on the
 * wire (`PlateEntryView.labels[].name`), and what `labelGroup` is keyed on.
 * `key` is a stable English handle for referring to a label in code without
 * retyping the Ukrainian string: `LABEL.protein === 'білок'`.
 */
export const LABEL_GROUPS = ['slot', 'category', 'diet', 'nutrition'] as const;
export type LabelGroup = (typeof LABEL_GROUPS)[number];

/**
 * The vocabulary. Order matters: `category` entries are listed in plate-method
 * reading order, and {@link CATEGORY_LABELS} preserves it.
 */
export const LABELS = [
    { key: 'breakfast', name: 'сніданок', group: 'slot' },
    { key: 'lunch', name: 'обід', group: 'slot' },
    { key: 'dinner', name: 'вечеря', group: 'slot' },
    { key: 'veg', name: 'овочі', group: 'category' },
    { key: 'protein', name: 'білок', group: 'category' },
    { key: 'complexCarbs', name: 'складні вуглеводи', group: 'category' },
    { key: 'healthyFats', name: 'корисні жири', group: 'category' },
    { key: 'flourFree', name: 'без борошна', group: 'diet' },
    { key: 'sugarFree', name: 'без цукру', group: 'diet' },
    { key: 'highFiber', name: 'багато клітковини', group: 'nutrition' },
    { key: 'iodineSource', name: 'джерело йоду', group: 'nutrition' },
    { key: 'ironSource', name: 'джерело заліза', group: 'nutrition' },
    { key: 'omega3', name: 'омега-3', group: 'nutrition' },
] as const satisfies readonly {
    key: string;
    name: string;
    group: LabelGroup;
}[];

export type LabelKey = (typeof LABELS)[number]['key'];
export type LabelName = (typeof LABELS)[number]['name'];

type NameForKey<K extends LabelKey> = Extract<
    (typeof LABELS)[number],
    { key: K }
>['name'];

/** `LABEL.protein` → `'білок'`, with the exact literal type per key. */
export const LABEL = Object.fromEntries(
    LABELS.map((label) => [label.key, label.name]),
) as { readonly [K in LabelKey]: NameForKey<K> };

/**
 * Display / precedence order for a recipe's labels — lower index comes first.
 * `slot` is last on purpose: it's filtered out of most tag lists, and when it
 * is shown it belongs after the substantive labels.
 */
export const LABEL_GROUP_ORDER: readonly LabelGroup[] = [
    'category',
    'diet',
    'nutrition',
    'slot',
];

/** The category (food-component) label names, in plate-method reading order. */
export const CATEGORY_LABELS: readonly LabelName[] = LABELS.filter(
    (label) => label.group === 'category',
).map((label) => label.name);

const GROUP_BY_NAME = new Map<string, LabelGroup>(
    LABELS.map((label) => [label.name, label.group]),
);

/**
 * The group a label belongs to. An unrecognised name (a label added after this
 * package was published) falls back to `nutrition` — it still shows, at the
 * lowest priority, and is never mistaken for a food category.
 */
export function labelGroup(name: string): LabelGroup {
    return GROUP_BY_NAME.get(name) ?? 'nutrition';
}

/**
 * Comparator ordering two label names for display: by group precedence first
 * ({@link LABEL_GROUP_ORDER}), then — within `category` — by plate-method
 * reading order ({@link CATEGORY_LABELS}). Labels in any other group compare
 * equal, so callers keep their existing relative order.
 */
export function compareLabelsByGroup(a: string, b: string): number {
    const byGroup =
        LABEL_GROUP_ORDER.indexOf(labelGroup(a)) -
        LABEL_GROUP_ORDER.indexOf(labelGroup(b));
    if (byGroup !== 0) return byGroup;
    if (labelGroup(a) !== 'category') return 0;
    return (
        CATEGORY_LABELS.indexOf(a as LabelName) -
        CATEGORY_LABELS.indexOf(b as LabelName)
    );
}
