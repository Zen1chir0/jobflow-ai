import { describe, expect, it } from "vitest";

import { ScreeningQuestionHandler } from "../../../../src/services/ats/screening-question-handler.js";
import { FakeATSPageAdapter } from "./support/fake-ats-page-adapter.js";

describe("ScreeningQuestionHandler", () => {
  it("answers exact matching screening questions only", async () => {
    const adapter = new FakeATSPageAdapter("<label>Why are you interested in this role?</label>", []);
    const handler = new ScreeningQuestionHandler();

    const result = await handler.answerSafeQuestions({
      adapter,
      questions: [
        {
          question: "Why are you interested in this role?",
          candidates: [{ strategy: "label", value: /why are you interested in this role/i }]
        },
        {
          question: "Do you need sponsorship?",
          candidates: [{ strategy: "label", value: /sponsorship/i }]
        }
      ],
      answers: [{ question: "Why are you interested in this role?", answer: "Because the role matches my QA background." }]
    });

    expect(result).toEqual([
      { question: "Why are you interested in this role?", answered: true, reason: "matched" },
      { question: "Do you need sponsorship?", answered: false, reason: "not_found" }
    ]);
    expect(adapter.filledFields).toHaveLength(1);
  });
});
