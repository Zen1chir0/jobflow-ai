export type GenerationProviderConfig = {
  provider: string;
  baseUrl: string;
  apiKey: string;
  model: string;
};

export type GenerationRequest = {
  systemPrompt: string;
  userPrompt: string;
  responseSchemaName: string;
};

export type GenerationResponse = {
  content: unknown;
  provider: string;
  model: string;
};

export interface GenerationProvider {
  generateStructured(request: GenerationRequest): Promise<GenerationResponse>;
}

