import { CacheableEntity } from './cacheable-entity';

export class FileEntity implements CacheableEntity {
  id: number = -1;
  entityName = 'file';

  modificationDate: Date;

  name: string;
  size: number;
  mimeType: string;
  fileName: string;

  // thumbnail: string;

  /**
   * Transient field used to store a file that is going to be uploaded.
   */
  fileUpload: File;
}
