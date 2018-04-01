export class FileEntity {
  id: number = -1;
  modificationDate: Date;
  data: Buffer;

  /**
   * Transient field used to store a file that is going to be uploaded.
   */
  fileUpload: File;
}
