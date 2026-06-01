export type EmbeddingProvider = {
  embed(input: string): Promise<number[]>;
};
