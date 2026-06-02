import type { ATSAutomationPlan } from "../../domain/ats/ats.types.js";
import { ApplicationError } from "../../domain/errors/application-error.js";
import type { ATSStrategyRegistry } from "./ats-strategy-registry.js";
import type { ATSStrategyExecutionRequest } from "./ats-interaction.types.js";

export class ATSAutomationService {
  constructor(private readonly strategyRegistry: ATSStrategyRegistry) {}

  async execute(request: ATSStrategyExecutionRequest): Promise<ATSAutomationPlan> {
    const strategy = await this.strategyRegistry.resolve({ url: request.applicationUrl });

    if (!strategy.execute) {
      throw new ApplicationError(
        "ATS_STRATEGY_EXECUTION_UNAVAILABLE",
        `ATS strategy ${strategy.type} does not support execution`
      );
    }

    return strategy.execute(request);
  }
}
