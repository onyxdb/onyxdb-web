export function roundTo(num: number, places: number) {
    const factor = 10 ** places;
    return Math.round(num * factor) / factor;
}

export function toPercent(num: number) {
    return Math.min(Math.max(num, 0), 100);
}
