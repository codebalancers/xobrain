import { Injectable } from '@angular/core';
import { DatabaseService } from '../control/database.service';
import { FileEntity } from '../entity/file.entity';
import { Observable } from 'rxjs/Observable';
import { CardEntity } from '../entity/card.entity';

@Injectable()
export class FileService {
  constructor(private dbService: DatabaseService) {
  }

  public getFiles(cardId: number): Observable<FileEntity[]> {
    console.error('NOT YET IMPLEMENTED');
    return Observable.of([]);
  }

  public updateFiles(card: CardEntity, files: FileEntity[]): Observable<void> {
    console.error('NOT YET IMPLEMENTED');
    // const fr = new FileReader();
    // const fileArray = fr.readAsArrayBuffer(f);
    return Observable.of(null);
  }
}
