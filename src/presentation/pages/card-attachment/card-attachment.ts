import { Component, OnDestroy } from '@angular/core';
import { IonicPage } from 'ionic-angular';
import { EditService } from '../../services/edit.service';
import { Subject } from 'rxjs/Subject';
import { CardEntity } from '../../../business/entity/card.entity';
import { FileEntity } from '../../../business/entity/file.entity';
import { ArrayUtils } from '../../../util/array.utils';
import { UuidUtils } from '../../../util/uuid.utils';

@IonicPage()
@Component({
  selector: 'card-attachment',
  templateUrl: 'card-attachment.html'
})
export class CardAttachmentPage implements OnDestroy {
  private componentDestroyed$: Subject<void> = new Subject<void>();
  card: CardEntity;

  constructor(private editService: EditService) {
    editService.cardSelectedSubject$
      .takeUntil(this.componentDestroyed$)
      .subscribe(card => this.card = card);
  }

  ngOnDestroy(): void {
    this.componentDestroyed$.next();
    this.componentDestroyed$.complete();
  }

  handleFiles(files: FileList) {
    for (let i = 0; i < files.length; i++) {
      const file = files.item(i);

      const fe = new FileEntity();
      fe.fileUpload = file;
      fe.name = file.name;
      fe.size = file.size;
      fe.mimeType = file.type;
      fe.fileName = UuidUtils.uuid();

      this.card.files.push(fe);
    }

    if (files.length > 0) {
      this.card.modified = true;
      this.editService.emitModified(this.card.modified);
    }
  }

  removeFile(file: FileEntity) {
    ArrayUtils.removeElement(this.card.files, file);

    this.card.modified = true;
    this.editService.emitModified(this.card.modified);
  }
}
