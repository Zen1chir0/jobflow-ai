#!/usr/bin/env node

import { Command } from "commander";

import { loadEnv } from "../config/env";

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

  return program;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await buildCli().parseAsync(process.argv);
}
