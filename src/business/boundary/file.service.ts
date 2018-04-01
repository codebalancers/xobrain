import { Injectable } from '@angular/core';
import { DatabaseService } from '../control/database.service';
import { FileEntity } from '../entity/file.entity';
import { Observable } from 'rxjs/Observable';
import { CardEntity } from '../entity/card.entity';
import { ElectronService } from '../control/electron.service';
import { join as pJoin } from 'path';

@Injectable()
export class FileService {
  constructor(private dbService: DatabaseService, private electronService: ElectronService) {
  }

  public getFiles(cardId: number): Observable<FileEntity[]> {
    console.error('NOT YET IMPLEMENTED');
    return Observable.of([]);
  }

  public updateFiles(card: CardEntity, files: FileEntity[]): Observable<void> {
    const userData = this.electronService.getRemote().app.getPath('userData');
    const attachmentsPath = pJoin(userData, 'attachments');

    const fs = this.electronService.getFs();

    fs.mkdir(attachmentsPath);

    files.filter(f => f.id < 1).forEach(f => {
      // -- copy file to local directory
      const dest = pJoin(attachmentsPath, f.fileName);
      const path = (f.fileUpload as any).path;
      fs.createReadStream(path).pipe(fs.createWriteStream(dest));
    })
    ;

    console.error('NOT YET IMPLEMENTED');
    return Observable.of(null);
  }
}
