const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const allowedExtensions = new Set(["jpg", "jpeg", "png", "webp"]);

export type ValidatedUpload = {
  file: File;
  extension: string;
};

export function validateJobForm(formData: FormData) {
  const prompt = String(formData.get("prompt") ?? "").trim();
  const files = formData
    .getAll("images")
    .filter((value): value is File => value instanceof File && value.size > 0);

  if (!prompt) {
    return { error: "Prompt is required.", status: 400 as const };
  }

  if (files.length !== 2) {
    return { error: "Upload exactly two images.", status: 400 as const };
  }

  const images: ValidatedUpload[] = [];

  for (const file of files) {
    const extension = getExtension(file.name);

    if (!allowedMimeTypes.has(file.type) || !allowedExtensions.has(extension)) {
      return {
        error: "Only jpg, jpeg, png, and webp images are allowed.",
        status: 400 as const
      };
    }

    if (file.size > MAX_IMAGE_BYTES) {
      return {
        error: "Each image must be 10 MB or smaller.",
        status: 400 as const
      };
    }

    images.push({ file, extension });
  }

  return { prompt, images };
}

function getExtension(fileName: string) {
  const parts = fileName.toLowerCase().split(".");
  return parts.length > 1 ? parts.at(-1) ?? "" : "";
}
