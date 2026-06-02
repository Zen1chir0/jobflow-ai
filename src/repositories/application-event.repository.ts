import type { PostgrestError } from "@supabase/supabase-js";

import type {
  ApplicationEvent,
  ApplicationEventType,
  ApplicationState,
  NewApplicationEvent
} from "../domain/applications/application.types.js";
import { ApplicationError } from "../domain/errors/application-error.js";
import { createSupabaseClient } from "../integrations/supabase/supabase.client.js";

type JsonObject = Record<string, unknown>;

export type ApplicationEventRow = {
  id: string;
  application_id: string;
  from_state: string | null;
  to_state: string;
  event_type: string | null;
  execution_id: string | null;
  metadata: JsonObject | null;
  created_at: string;
};

type ApplicationEventPayload = {
  application_id: string;
  from_state?: ApplicationState;
  to_state: ApplicationState;
  event_type: ApplicationEventType;
  execution_id?: string;
  metadata: JsonObject;
};

type SupabaseSingleResult = {
  data: ApplicationEventRow | null;
  error: PostgrestError | null;
};

type SupabaseListResult = {
  data: ApplicationEventRow[] | null;
  error: PostgrestError | null;
};

type ApplicationEventTableClient = {
  insert(payload: ApplicationEventPayload): {
    select(columns: string): {
      single(): Promise<SupabaseSingleResult>;
    };
  };
  select(columns: string): {
    eq(column: string, value: string): {
      order(column: string, options: { ascending: boolean }): Promise<SupabaseListResult>;
    };
  };
};

export type SupabaseApplicationEventClient = {
  from(table: "application_events"): ApplicationEventTableClient;
};

export interface ApplicationEventRepository {
  create(event: NewApplicationEvent): Promise<ApplicationEvent>;
  findByApplicationId(applicationId: string): Promise<ApplicationEvent[]>;
}

export class SupabaseApplicationEventRepository implements ApplicationEventRepository {
  constructor(
    private readonly client: SupabaseApplicationEventClient =
      createSupabaseClient() as unknown as SupabaseApplicationEventClient
  ) {}

  async create(event: NewApplicationEvent): Promise<ApplicationEvent> {
    const result = await this.client.from("application_events").insert(toPayload(event)).select("*").single();

    if (result.error) {
      throw new ApplicationError("APPLICATION_EVENT_REPOSITORY_ERROR", "Unable to create application event", {
        cause: result.error
      });
    }

    if (!result.data) {
      throw new ApplicationError("APPLICATION_EVENT_REPOSITORY_ERROR", "Application event create returned no data");
    }

    return fromApplicationEventRow(result.data);
  }

  async findByApplicationId(applicationId: string): Promise<ApplicationEvent[]> {
    const result = await this.client
      .from("application_events")
      .select("*")
      .eq("application_id", applicationId)
      .order("created_at", { ascending: true });

    if (result.error) {
      throw new ApplicationError("APPLICATION_EVENT_REPOSITORY_ERROR", "Unable to find application events", {
        cause: result.error
      });
    }

    return (result.data ?? []).map(fromApplicationEventRow);
  }
}

function toPayload(event: NewApplicationEvent): ApplicationEventPayload {
  return {
    application_id: event.applicationId,
    to_state: event.toState,
    event_type: event.eventType,
    metadata: event.metadata ?? {},
    ...(event.fromState ? { from_state: event.fromState } : {}),
    ...(event.executionId ? { execution_id: event.executionId } : {})
  };
}

function fromApplicationEventRow(row: ApplicationEventRow): ApplicationEvent {
  return {
    id: row.id,
    applicationId: row.application_id,
    toState: row.to_state as ApplicationState,
    eventType: (row.event_type ?? "STATE_TRANSITION") as ApplicationEventType,
    metadata: row.metadata ?? {},
    createdAt: row.created_at,
    ...(row.from_state ? { fromState: row.from_state as ApplicationState } : {}),
    ...(row.execution_id ? { executionId: row.execution_id } : {})
  };
}
