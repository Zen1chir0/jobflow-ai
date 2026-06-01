import type { ResumeFragment } from "../../domain/resumes/resume-fragment.types.js";

const FRAGMENT_TYPE_PRIORITY = {
  work_experience: 0,
  project: 1,
  leadership: 2,
  skill: 3,
  certification: 4,
  education: 5
} as const;

export class PromptContextBuilder {
  build(fragments: ResumeFragment[]): string {
    const uniqueFragments = dedupeFragments(fragments);
    const orderedFragments = [...uniqueFragments].sort(compareFragments);

    return orderedFragments.map(formatFragment).join("\n");
  }
}

function dedupeFragments(fragments: ResumeFragment[]): ResumeFragment[] {
  const seen = new Set<string>();
  const result: ResumeFragment[] = [];

  for (const fragment of fragments) {
    const key = fragment.fragmentText.trim().toLowerCase();

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(fragment);
  }

  return result;
}

function compareFragments(left: ResumeFragment, right: ResumeFragment): number {
  const leftSimilarity = left.similarity ?? 0;
  const rightSimilarity = right.similarity ?? 0;

  if (rightSimilarity !== leftSimilarity) {
    return rightSimilarity - leftSimilarity;
  }

  return FRAGMENT_TYPE_PRIORITY[left.fragmentType] - FRAGMENT_TYPE_PRIORITY[right.fragmentType];
}

function formatFragment(fragment: ResumeFragment): string {
  const label = fragment.sourceLabel ? ` (${fragment.sourceLabel})` : "";
  return `- [${fragment.fragmentType}${label}] ${fragment.fragmentText}`;
}
