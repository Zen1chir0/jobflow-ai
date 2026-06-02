import type { SemanticLocatorCandidate, SemanticLocatorResolver } from "./semantic-locator.service.js";

export interface ATSPageAdapter extends SemanticLocatorResolver {
  fillText(candidate: SemanticLocatorCandidate, value: string): Promise<void>;
  uploadFile(candidate: SemanticLocatorCandidate, filePath: string): Promise<void>;
  hasVisibleText(text: string | RegExp): Promise<boolean>;
}
