import type { ATSDetectionInput } from "../../domain/ats/ats.types.js";
import { ApplicationError } from "../../domain/errors/application-error.js";
import type { ATSStrategy } from "./ats-strategy.interface.js";

export class ATSStrategyRegistry {
  constructor(private readonly strategies: ATSStrategy[]) {}

  async resolve(input: ATSDetectionInput): Promise<ATSStrategy> {
    for (const strategy of this.strategies) {
      const matched = await strategy.detect(input);

      if (matched) {
        return strategy;
      }
    }

    const genericStrategy = this.strategies.find((strategy) => strategy.type === "generic");

    if (genericStrategy) {
      return genericStrategy;
    }

    throw new ApplicationError("ATS_STRATEGY_NOT_FOUND", "No ATS strategy matched and no generic fallback exists");
  }
}
