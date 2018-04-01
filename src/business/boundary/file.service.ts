import { Injectable } from '@angular/core';
import { DatabaseService } from '../control/database.service';
import { FileEntity } from '../entity/file.entity';
import { Observable } from 'rxjs/Observable';
import { CardEntity } from '../entity/card.entity';
import { ElectronService } from '../control/electron.service';
import { join as pJoin } from 'path';
import { ArrayUtils } from '../../util/array.utils';

interface FileLink {
  card_id: number,
  file_id: number,
  modificationDate: Date
}

@Injectable()
export class FileService {
  private attachmentsPath: string;

  constructor(private dbService: DatabaseService, private electronService: ElectronService) {
    const userData = this.electronService.getRemote().app.getPath('userData');
    this.attachmentsPath = pJoin(userData, 'attachments');

    const fs = this.electronService.getFs();
    fs.mkdir(this.attachmentsPath, res => console.log(res));
  }

  public getFiles(cardId: number): Observable<FileEntity[]> {
    console.error('NOT YET IMPLEMENTED');
    return Observable.of([]);
  }

  public updateFiles(card: CardEntity, files: FileEntity[]): Observable<void> {
    // -- ensure all tag entities are present
    const filesToBeCreated = files.filter(f => f.id < 1);

    return this
      .createFiles(filesToBeCreated)
      .flatMap(() => Observable.fromPromise(this.dbService.getConnection('card_file').where('card_id', card.id)))
      .flatMap((existingFiles: FileLink[]) => {
        /**
         * All existing files that are not included in the files array have to be deleted.
         */
        const toBeDeleted: number[] = existingFiles
          .filter(et => ArrayUtils.containsNot(files, et, (a, b) => a.id === b.file_id))
          .map(et => et.file_id);

        /**
         * All files that do not exist have to be created.
         */
        const toBeCreated: number[] = files
          .filter(f =>
            ArrayUtils.containsNot(existingFiles, f, (a, b) => a.file_id === b.id)
          )
          .map(f => f.id);

        const os: Observable<void>[] = [];

        if (toBeDeleted.length > 0) {
          os.push(this.deleteFiles(card.id, toBeDeleted));
        }

        if (toBeCreated.length > 0) {
          os.push(this.createLinks(card.id, toBeCreated));
        }

        if (os.length > 0) {
          return Observable.forkJoin(os).map(() => null);
        } else {
          return Observable.of(null);
        }
      });
  }

  private createFiles(files: FileEntity[]): Observable<void> {
    const fs = this.electronService.getFs();

    // -- copy files to local directory
    files.forEach(f => {
      const dest = pJoin(this.attachmentsPath, f.fileName);
      const path = (f.fileUpload as any).path;
      fs.createReadStream(path).pipe(fs.createWriteStream(dest));
      f.fileUpload = null;
    });

    // -- create db entries
    const os: Observable<void>[] = files.map(file => {
      return Observable
        .fromPromise(
          this.dbService
            .getConnection('file')
            .insert({
              name: file.name,
              modificationDate: new Date(),
              size: file.size,
              mimeType: file.mimeType,
              fileName: file.fileName
            })
            .returning('id')
        )
        .map(d => {
          file.id = d[ 0 ];
          return null;
        });
    });

    if (os.length > 0) {
      return Observable.forkJoin(os).map(() => null);
    } else {
      return Observable.of(null);
    }
  }

  private deleteFiles(cardId: number, toBeDeleted: number[]): Observable<void> {
    const fs = this.electronService.getFs();

    // delete all links
    return Observable
      .fromPromise(
        this.dbService.getConnection('card_file')
          .where('card_id', cardId).and.whereIn('file_id', toBeDeleted)
          .del()
      )
      .flatMap(() => {
        const os: Observable<void>[] = toBeDeleted.map(fileId =>
          this.getFile(fileId)
            .map((file: FileEntity) => {
              // -- delete file from file system
              const dest = pJoin(this.attachmentsPath, file.fileName);
              fs.unlink(dest);
              return null;
            })
            .flatMap(() =>
              // -- delete file from db
              Observable.fromPromise(
                this.dbService.getConnection('file')
                  .where('file_id', fileId)
                  .del()
              )
            )
        );

        return Observable.forkJoin(os);
      })
      .map(() => null);
  }

  private createLinks(cardId: number, toBeCreated: number[]): Observable<void> {
    const data = toBeCreated.map(fileId => {
      return { card_id: cardId, file_id: fileId, modificationDate: new Date() };
    });

    return Observable.fromPromise(this.dbService
      .getConnection('card_file')
      .insert(data));
  }

  private getFile(fileId: number): Observable<FileEntity> {
    return Observable
      .fromPromise(
        this.dbService.getConnection('file')
          .where('file_id', fileId)
          .del()
      )
      .map(res => {
        const f = new FileEntity();
        f.id = res.id;
        f.name = res.name;
        f.fileName = res.fileName;
        f.mimeType = res.mimeType;
        f.size = res.size;

        return f;
      });
  }
}
