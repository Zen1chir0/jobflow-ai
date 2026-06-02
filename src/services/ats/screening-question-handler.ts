import type { ATSScreeningQuestionResult, ScreeningAnswer } from "../../domain/ats/ats.types.js";
import type { ATSPageAdapter } from "./ats-page-adapter.interface.js";
import type { SemanticLocatorCandidate } from "./semantic-locator.service.js";
import { SemanticLocatorService } from "./semantic-locator.service.js";

export type ScreeningQuestionDefinition = {
  question: string;
  candidates: SemanticLocatorCandidate[];
};

export type ScreeningQuestionHandlerRequest = {
  adapter: ATSPageAdapter;
  questions: ScreeningQuestionDefinition[];
  answers: ScreeningAnswer[];
};

export class ScreeningQuestionHandler {
  constructor(private readonly semanticLocator = new SemanticLocatorService()) {}

  async answerSafeQuestions(request: ScreeningQuestionHandlerRequest): Promise<ATSScreeningQuestionResult[]> {
    const results: ATSScreeningQuestionResult[] = [];

    for (const question of request.questions) {
      const answer = this.findExactAnswer(question.question, request.answers);

      if (!answer) {
        results.push({ question: question.question, answered: false, reason: "not_found" });
        continue;
      }

      try {
        const candidate = await this.semanticLocator.resolve(
          {
            fieldKey: `screening:${question.question}`,
            candidates: question.candidates
          },
          request.adapter
        );

        await request.adapter.fillText(candidate, answer.answer);
        results.push({ question: question.question, answered: true, reason: "matched" });
      } catch {
        results.push({ question: question.question, answered: false, reason: "ambiguous" });
      }
    }

    return results;
  }

  private findExactAnswer(question: string, answers: ScreeningAnswer[]): ScreeningAnswer | undefined {
    const normalizedQuestion = normalizeQuestion(question);
    return answers.find((answer) => normalizeQuestion(answer.question) === normalizedQuestion);
  }
}

function normalizeQuestion(question: string): string {
  return question.trim().replace(/\s+/g, " ").toLowerCase();
}
