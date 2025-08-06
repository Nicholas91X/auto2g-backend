import * as fs from 'fs/promises';
import * as path from 'path';
import { Injectable, Logger } from '@nestjs/common';
import { DocumentStorageService } from "./documentStorage.interface"
import { format } from 'date-fns';

@Injectable()
export class LocalDocumentStorageService implements DocumentStorageService {
  private readonly logger: Logger = new Logger(LocalDocumentStorageService.name);
  private readonly baseUploadDir = path.resolve(process.cwd(), 'uploads');

  constructor() {
    fs.mkdir(this.baseUploadDir, { recursive: true }).catch(err =>
      this.logger.error('Impossibile creare la directory di upload di base.', err)
    );
  }

  /**
   * Carica un file in una struttura di cartelle gerarchica.
   * @param file L'oggetto file di Multer.
   * @param pathSegments Un array di segmenti per creare il percorso (es. ['company-123', 'drivers']).
   * @param filename Il nome del file da salvare (senza estensione).
   * @returns Il percorso relativo del file salvato, pronto per essere usato in un URL.
   */
  async upload(
    file: Express.Multer.File,
    pathSegments: string[],
    filename: string,
  ): Promise<string> {
    const targetDir = path.join(this.baseUploadDir, ...pathSegments);

    await fs.mkdir(targetDir, { recursive: true });

    const extension = path.extname(file.originalname);
    const timestamp = format(new Date(), 'yyyyMMdd-HHmmss');
    const finalFilename = `${filename}-${timestamp}${extension}`;
    const absolutePath = path.join(targetDir, finalFilename);

    await fs.writeFile(absolutePath, file.buffer);
    this.logger.log(`File caricato in: ${absolutePath}`);

    const relativePath = path.join(...pathSegments, finalFilename);
    return relativePath.replace(/\\/g, '/');
  }

  /**
   * Salva un Buffer di dati direttamente su file.
   */
  async uploadBuffer(
    buffer: Buffer,
    pathSegments: string[],
    filenameWithExtension: string,
  ): Promise<string> {
    const targetDir = path.join(this.baseUploadDir, ...pathSegments);
    await fs.mkdir(targetDir, { recursive: true });

    const absolutePath = path.join(targetDir, filenameWithExtension);
    await fs.writeFile(absolutePath, buffer);
    this.logger.log(`Buffer salvato come file in: ${absolutePath}`);

    const relativePath = path.join(...pathSegments, filenameWithExtension);
    return relativePath.replace(/\\/g, '/');
  }

  /**
   * [MODIFICATO] Cancella un file usando il percorso relativo salvato nel DB.
   */
  async deleteFile(relativePath: string): Promise<void> {
    if (!relativePath) return;
    const absolutePath = path.join(this.baseUploadDir, relativePath);
    try {
      await fs.unlink(absolutePath);
      this.logger.log(`File eliminato: ${absolutePath}`);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        this.logger.error(`Impossibile eliminare il file ${absolutePath}`, error.stack);
      }
    }
  }
}