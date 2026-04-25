import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { StorageProvider, StoredFile } from "@/lib/storage/types";

export class LocalStorageProvider implements StorageProvider {
  private readonly root: string;

  constructor(root = process.env.STORAGE_ROOT ?? "storage") {
    this.root = path.resolve(/* turbopackIgnore: true */ process.cwd(), root);
  }

  async saveUpload(input: {
    file: File;
    jobId: string;
    extension: string;
  }): Promise<StoredFile> {
    const fileName = `${randomUUID()}.${input.extension}`;
    const relativePath = path.join("uploads", input.jobId, fileName);
    const absolutePath = this.resolveSafe(relativePath);

    await mkdir(path.dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, Buffer.from(await input.file.arrayBuffer()));

    return {
      fileName,
      mimeType: input.file.type,
      path: relativePath,
      size: input.file.size
    };
  }

  async saveResult(input: {
    buffer: Buffer;
    jobId: string;
    extension: string;
    mimeType: string;
  }): Promise<StoredFile> {
    const fileName = `${randomUUID()}.${input.extension}`;
    const relativePath = path.join("results", input.jobId, fileName);
    const absolutePath = this.resolveSafe(relativePath);

    await mkdir(path.dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, input.buffer);

    return {
      fileName,
      mimeType: input.mimeType,
      path: relativePath,
      size: input.buffer.byteLength
    };
  }

  async read(relativePath: string) {
    return readFile(this.resolveSafe(relativePath));
  }

  private resolveSafe(relativePath: string) {
    const absolutePath = path.resolve(this.root, relativePath);
    const relativeToRoot = path.relative(this.root, absolutePath);

    if (relativeToRoot.startsWith("..") || path.isAbsolute(relativeToRoot)) {
      throw new Error("Invalid storage path.");
    }

    return absolutePath;
  }
}

export const storageProvider = new LocalStorageProvider();
