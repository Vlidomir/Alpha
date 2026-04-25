export type AIInputImage = {
  originalName: string;
  mimeType: string;
  buffer: Buffer;
};

export type GeneratedAIImage = {
  buffer: Buffer;
  extension: string;
  mimeType: string;
};

export interface AIProvider {
  generate(input: {
    prompt: string;
    images: [AIInputImage, AIInputImage];
  }): Promise<GeneratedAIImage>;
}
