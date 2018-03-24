import * as knex from 'knex';
import { Injectable } from '@angular/core';
import { ElectronService } from './electron.service';

@Injectable()
export class ConnectionService {
  private knex;

  constructor(electronService: ElectronService) {
    this.knex = electronService.getRemote().getGlobal('knex') as knex;
  }

  public getConnection(): knex {
    return this.knex;
  }
}
