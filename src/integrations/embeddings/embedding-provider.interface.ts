export type EmbeddingProvider = {
  embed(input: string): Promise<number[]>;
};

export type EmbeddingProviderConfig = {
  provider: string;
  baseUrl: string;
  apiKey: string;
  model: string;
};
