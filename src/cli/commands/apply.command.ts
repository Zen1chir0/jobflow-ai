import { Command } from "commander";

import { AutofillApplicationUseCase } from "../../use-cases/autofill-application.use-case.js";

type ApplyOptions = {
  jobId: string;
  applicationUrl: string;
  resumePdf: string;
};

type ApplyUseCaseFactory = () => AutofillApplicationUseCase;

export function createApplyCommand(createApplyUseCase: ApplyUseCaseFactory = createDefaultApplyUseCase): Command {
  return new Command("apply")
    .description("Prepare ATS automation foundation plan without live autofill")
    .requiredOption("--job-id <jobId>", "job id to prepare for ATS automation")
    .requiredOption("--application-url <url>", "application URL used for ATS detection")
    .requiredOption("--resume-pdf <path>", "local rendered resume PDF path")
    .action(async (options: ApplyOptions) => {
      const result = await Promise.resolve(createApplyUseCase().execute({
        jobId: options.jobId,
        applicationUrl: options.applicationUrl,
        resumePdfPath: options.resumePdf
      }));
      console.log(`ATS foundation ready for job ${result.jobId}`);
      console.log(`Detected ATS ${result.atsType}`);
      console.log(`Status ${result.status}`);
    });
}

function createDefaultApplyUseCase(): AutofillApplicationUseCase {
  return new AutofillApplicationUseCase();
}
