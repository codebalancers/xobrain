import * as knex from 'knex';
import { Injectable } from '@angular/core';
import { ElectronService } from './electron.service';

const create_card = `
  CREATE TABLE card(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title CHAR(180),
    content TEXT
  );
  `;

@Injectable()
export class DatabaseService {
  private knex;

  constructor(electronService: ElectronService) {
    this.knex = electronService.getRemote().getGlobal('knex') as knex;
  }

  public ensureSchema(): Promise<void> {
    console.log('ensureSchema');

    return this.knex.schema
      .hasTable('card')
      .then(exists => {
        if (!exists) {
          console.log('create card table');
          return this.knex.schema.raw(create_card);
        }
      });
  }

  public getConnection(): knex {
    return this.knex;
  }
}
