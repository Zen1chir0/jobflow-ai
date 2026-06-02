import { ApplicationError } from "../../domain/errors/application-error.js";

export type SemanticLocatorStrategy = "role" | "label" | "associated_text" | "placeholder" | "data_attribute" | "css";

export type SemanticLocatorCandidate = {
  strategy: SemanticLocatorStrategy;
  value: string | RegExp;
};

export type SemanticLocatorRequest = {
  fieldKey: string;
  candidates: SemanticLocatorCandidate[];
};

export type SemanticLocatorResolver = {
  canResolve(candidate: SemanticLocatorCandidate): boolean | Promise<boolean>;
};

const STRATEGY_PRIORITY: Record<SemanticLocatorStrategy, number> = {
  role: 0,
  label: 1,
  associated_text: 2,
  placeholder: 3,
  data_attribute: 4,
  css: 5
};

export class SemanticLocatorService {
  async resolve(
    request: SemanticLocatorRequest,
    resolver: SemanticLocatorResolver
  ): Promise<SemanticLocatorCandidate> {
    const candidates = [...request.candidates].sort(
      (left, right) => STRATEGY_PRIORITY[left.strategy] - STRATEGY_PRIORITY[right.strategy]
    );

    for (const candidate of candidates) {
      if (await resolver.canResolve(candidate)) {
        return candidate;
      }
    }

    throw new ApplicationError(
      "SEMANTIC_LOCATOR_NOT_FOUND",
      `Unable to resolve field ${request.fieldKey} with semantic locators`
    );
  }
}
