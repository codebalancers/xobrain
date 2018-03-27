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
    return Observable.of(null);
  }

  public updateFiles(card: CardEntity, files: FileEntity[]) {
    console.error('NOT YET IMPLEMENTED');
  }
}
