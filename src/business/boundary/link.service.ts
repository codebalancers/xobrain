import { Injectable } from '@angular/core';
import { DatabaseService } from '../control/database.service';


@Injectable()
export class LinkService{
  constructor(private dbService: DatabaseService) {
  }
}
