export type StoredFile = {
  fileName: string;
  mimeType: string;
  path: string;
  size: number;
};

export interface StorageProvider {
  saveUpload(input: {
    file: File;
    jobId: string;
    extension: string;
  }): Promise<StoredFile>;
  saveResult(input: {
    buffer: Buffer;
    jobId: string;
    extension: string;
    mimeType: string;
  }): Promise<StoredFile>;
  read(relativePath: string): Promise<Buffer>;
}
