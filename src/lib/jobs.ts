export type JobWithImages = {
  id: string;
  prompt: string;
  status: "pending" | "processing" | "completed" | "failed";
  error: string | null;
  createdAt: Date;
  updatedAt: Date;
  uploadedImages: Array<{
    id: string;
    originalName: string;
    mimeType: string;
    size: number;
  }>;
  generatedImages: Array<{
    id: string;
    mimeType: string;
    size: number;
  }>;
};

export function serializeJob(job: JobWithImages) {
  return {
    id: job.id,
    prompt: job.prompt,
    status: job.status,
    error: job.error,
    createdAt: job.createdAt.toISOString(),
    updatedAt: job.updatedAt.toISOString(),
    uploadedImages: job.uploadedImages.map((image) => ({
      id: image.id,
      originalName: image.originalName,
      mimeType: image.mimeType,
      size: image.size,
      url: `/api/files/${image.id}`
    })),
    generatedImages: job.generatedImages.map((image) => ({
      id: image.id,
      mimeType: image.mimeType,
      size: image.size,
      url: `/api/files/${image.id}`
    }))
  };
}
