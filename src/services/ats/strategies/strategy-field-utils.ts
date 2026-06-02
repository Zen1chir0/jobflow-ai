import type { ApplicantProfile, ATSFieldFillResult, ATSFieldKey } from "../../../domain/ats/ats.types.js";
import type { ATSPageAdapter } from "../ats-page-adapter.interface.js";
import type { SemanticLocatorCandidate } from "../semantic-locator.service.js";
import { SemanticLocatorService } from "../semantic-locator.service.js";

export type PersonalFieldDefinition = {
  fieldKey: ATSFieldKey;
  value: (applicant: ApplicantProfile) => string | undefined;
  candidates: SemanticLocatorCandidate[];
};

export async function fillPersonalFields(
  adapter: ATSPageAdapter,
  applicantProfile: ApplicantProfile,
  fields: PersonalFieldDefinition[],
  semanticLocator = new SemanticLocatorService()
): Promise<ATSFieldFillResult[]> {
  const results: ATSFieldFillResult[] = [];

  for (const field of fields) {
    const value = field.value(applicantProfile);

    if (!value) {
      results.push({ fieldKey: field.fieldKey, filled: false });
      continue;
    }

    try {
      const candidate = await semanticLocator.resolve(
        {
          fieldKey: field.fieldKey,
          candidates: field.candidates
        },
        adapter
      );
      await adapter.fillText(candidate, value);
      results.push({ fieldKey: field.fieldKey, filled: true });
    } catch {
      results.push({ fieldKey: field.fieldKey, filled: false });
    }
  }

  return results;
}
