import * as knex from 'knex';
import { Config } from 'knex';
import { Injectable } from '@angular/core';

@Injectable()
export class ConnectionService {
  private knex;

  constructor() {
    this.knex = knex(this.exportConfig());
  }

  public getConnection(): knex {
    return this.knex;
  }

  private exportConfig(): Config {
    return {
      client: 'sqlite3',
      connection: {
        filename: './database.sqlite'
      }
    };
  }
}
