#!/usr/bin/env node

import { Command } from "commander";
import { normalize } from "node:path";
import { fileURLToPath } from "node:url";

import { createDiscoverCommand } from "./commands/discover.command.js";
import { createFragmentsCommand } from "./commands/fragments.command.js";
import { createParseCommand } from "./commands/parse.command.js";
import { createScoreCommand } from "./commands/score.command.js";
import { loadEnv } from "../config/env.js";

export function buildCli(): Command {
  const program = new Command();

  program
    .name("jobflow")
    .description("CLI-first Job Application Orchestration Platform")
    .version("0.1.0");

  program.command("health").description("Validate Phase 0 runtime configuration").action(() => {
    const env = loadEnv();
    program.optsWithGlobals();
    console.log(`JobFlow AI ready (${env.nodeEnv})`);
  });

  program.addCommand(createDiscoverCommand());
  program.addCommand(createParseCommand());
  program.addCommand(createScoreCommand());
  program.addCommand(createFragmentsCommand());

  return program;
}

if (process.argv[1] && normalize(fileURLToPath(import.meta.url)) === normalize(process.argv[1])) {
  await buildCli().parseAsync(process.argv);
}
