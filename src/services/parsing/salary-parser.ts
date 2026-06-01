import type { ParsedJobCompensation } from "../../domain/jobs/parsed-job-profile.types.js";

const CURRENCY_PATTERNS: Array<{ currency: string; pattern: RegExp }> = [
  { currency: "PHP", pattern: /\u20b1|php/i },
  { currency: "USD", pattern: /\$|usd/i },
  { currency: "EUR", pattern: /\u20ac|eur/i },
  { currency: "GBP", pattern: /\u00a3|gbp/i }
];

export class SalaryParser {
  parse(text: string): ParsedJobCompensation {
    const numbers = [...text.matchAll(/(?:\u20b1|\$|\u20ac|\u00a3|php|usd|eur|gbp)?\s*(\d[\d,]*(?:\.\d+)?)(k)?/gi)]
      .map((match) => toAmount(match[1] ?? "", Boolean(match[2])))
      .filter((value) => value > 0);

    if (numbers.length === 0) {
      return {};
    }

    const sorted = [...numbers].sort((left, right) => left - right);
    const min = sorted[0];
    const max = sorted.length > 1 ? sorted[sorted.length - 1] : undefined;
    const currency = detectCurrency(text);

    if (min === undefined) {
      return {};
    }

    return {
      min,
      ...(max !== undefined ? { max } : {}),
      ...(currency ? { currency } : {}),
      raw: text
    };
  }
}

function toAmount(raw: string, thousandsSuffix: boolean): number {
  const value = Number(raw.replace(/,/g, ""));
  return thousandsSuffix ? value * 1000 : value;
}

function detectCurrency(text: string): string | undefined {
  return CURRENCY_PATTERNS.find((candidate) => candidate.pattern.test(text))?.currency;
}
