export function normalizeLookupValue(value: unknown): string {
    return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

export function normalizeCompactLookupValue(value: unknown): string {
    return normalizeLookupValue(value).replace(/\s+/g, '');
}
