export function normalizeToken(value: string): string {
  return value.trim().toLowerCase();
}

export function roundScore(value: number): number {
  return Math.round(value * 100) / 100;
}

export function clampScore(value: number): number {
  return Math.max(0, Math.min(100, roundScore(value)));
}
