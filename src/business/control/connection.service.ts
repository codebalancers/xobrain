import * as knex from 'knex';
import { Injectable } from '@angular/core';
import * as electron from 'electron';

const electron = (<any>window).require('electron') as electron;

@Injectable()
export class ConnectionService {
  private knex = electron.remote.getGlobal('knex') as knex;

  public getConnection(): knex {
    return this.knex;
  }
}
