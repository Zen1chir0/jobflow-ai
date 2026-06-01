import { createClient } from "@supabase/supabase-js";

import { loadEnv, type AppEnv } from "../../config/env";
import { ApplicationError } from "../../domain/errors/application-error";

export type JobFlowSupabaseClient = ReturnType<typeof createClient>;

export function createSupabaseClient(env: AppEnv = loadEnv()): JobFlowSupabaseClient {
  try {
    return createClient(env.supabaseUrl, env.supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
  } catch (error) {
    throw new ApplicationError("SUPABASE_CONFIGURATION_ERROR", "Unable to create Supabase client", {
      cause: error
    });
  }
}
