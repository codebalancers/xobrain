export class FileEntity {
  id: number = -1;
  modificationDate: Date;

  name: string;
  size: number;
  mimeType: string;
  hash: string;

  thumbnailHash: string;

  /**
   * Transient field used to store a file that is going to be uploaded.
   */
  fileUpload: File;
}
