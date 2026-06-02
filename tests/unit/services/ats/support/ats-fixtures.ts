import { readFileSync } from "node:fs";
import { resolve } from "node:path";

export function readAtsFixture(path: string): string {
  return readFileSync(resolve("tests", "fixtures", "ats", path), "utf8");
}

export const applicantProfile = {
  firstName: "Kenneth",
  lastName: "Flororita",
  email: "kenneth@example.com",
  phone: "+15555550123",
  linkedin: "https://linkedin.com/in/example"
};
