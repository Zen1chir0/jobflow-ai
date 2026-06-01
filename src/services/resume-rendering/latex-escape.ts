const LATEX_REPLACEMENTS = new Map<string, string>([
  ["\\", "\\textbackslash{}"],
  ["&", "\\&"],
  ["%", "\\%"],
  ["$", "\\$"],
  ["#", "\\#"],
  ["_", "\\_"],
  ["{", "\\{"],
  ["}", "\\}"],
  ["~", "\\textasciitilde{}"],
  ["^", "\\textasciicircum{}"]
]);

export function escapeLatex(value: string): string {
  return value.replace(/[\\&%$#_{}~^]/g, (character) => LATEX_REPLACEMENTS.get(character) ?? character);
}

