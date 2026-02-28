export interface StorageAdapter {
  upload(file: File, path: string): Promise<{ path: string }>;
  download(path: string): Promise<string>;
  delete(path: string): Promise<void>;
}
