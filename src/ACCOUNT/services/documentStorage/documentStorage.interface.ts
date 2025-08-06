export interface DocumentStorageService {
  deleteFile(path: string): Promise<void>;
  upload(file: Express.Multer.File, pathSegments: string[], filename: string): Promise<string>
  uploadBuffer(buffer: Buffer, pathSegments: string[], filenameWithExtension: string): Promise<string>
}

export const DocumentStorageServiceToken = Symbol('DocumentStorageService');