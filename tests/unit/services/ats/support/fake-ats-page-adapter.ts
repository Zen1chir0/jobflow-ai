import type { ATSPageAdapter } from "../../../../../src/services/ats/ats-page-adapter.interface.js";
import type { SemanticLocatorCandidate } from "../../../../../src/services/ats/semantic-locator.service.js";

export class FakeATSPageAdapter implements ATSPageAdapter {
  readonly filledFields: Array<{ candidate: SemanticLocatorCandidate; value: string }> = [];
  readonly uploadedFiles: Array<{ candidate: SemanticLocatorCandidate; filePath: string }> = [];
  private readonly visibleTexts = new Set<string>();

  constructor(
    private readonly html: string,
    private readonly resolvableValues: readonly string[]
  ) {}

  canResolve(candidate: SemanticLocatorCandidate): boolean {
    if (typeof candidate.value === "string") {
      return this.resolvableValues.includes(candidate.value) || this.html.includes(candidate.value);
    }

    return candidate.value.test(this.html);
  }

  fillText(candidate: SemanticLocatorCandidate, value: string): Promise<void> {
    this.filledFields.push({ candidate, value });
    return Promise.resolve();
  }

  uploadFile(candidate: SemanticLocatorCandidate, filePath: string): Promise<void> {
    this.uploadedFiles.push({ candidate, filePath });
    this.visibleTexts.add(filePath.split(/[\\/]/).at(-1) ?? filePath);
    return Promise.resolve();
  }

  hasVisibleText(text: string | RegExp): Promise<boolean> {
    if (typeof text === "string") {
      return Promise.resolve(this.visibleTexts.has(text) || this.html.includes(text));
    }

    return Promise.resolve([...this.visibleTexts].some((visibleText) => text.test(visibleText)) || text.test(this.html));
  }
}
