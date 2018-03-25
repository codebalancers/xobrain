import * as knex from 'knex';
import { Injectable } from '@angular/core';
import { ElectronService } from './electron.service';
import { StringUtils } from '../../util/string.utils';

const init_sql_1 = `
  CREATE TABLE IF NOT EXISTS card(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    creationDate DATE,
    title CHAR(180),
    content TEXT
  );
  `;

const init_sql_2 = `
  CREATE TABLE IF NOT EXISTS file(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    creationDate DATE,
    data BLOB
  );
  `;

const init_sql_3 = `
  CREATE TABLE IF NOT EXISTS tag(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    creationDate DATE,
    name CHAR(100)
  );
  `;

const init_sql_4 = `  
  CREATE TABLE IF NOT EXISTS card_tag(
    card_id INTEGER,
    tag_id INTEGER,
    creationDate DATE,
    FOREIGN KEY(card_id) REFERENCES card,
    FOREIGN KEY(tag_id) REFERENCES tag,
    UNIQUE (card_id, tag_id) ON CONFLICT IGNORE
  );
`;

const init_sql_5 = `  
  CREATE TABLE IF NOT EXISTS card_card(
    card1_id INTEGER,
    card2_id INTEGER,
    creationDate DATE,
    FOREIGN KEY(card1_id) REFERENCES card,
    FOREIGN KEY(card2_id) REFERENCES card,
    UNIQUE (card1_id, card2_id) ON CONFLICT IGNORE
  );
  `;

const init_sql_6 = `  
  CREATE TABLE IF NOT EXISTS card_file(
    card_id INTEGER,
    file_id INTEGER,
    creationDate DATE,
    FOREIGN KEY(card_id) REFERENCES card,
    FOREIGN KEY(file_id) REFERENCES file,
    UNIQUE (card_id, file_id) ON CONFLICT IGNORE
  );
  `;

@Injectable()
export class DatabaseService {
  private knex;

  constructor(electronService: ElectronService) {
    this.knex = electronService.getRemote().getGlobal('knex') as knex;
  }

  public ensureSchema(): Promise<any> {
    console.log('ensureSchema');

    return Promise.all([
        this.knex.raw(init_sql_1),
        this.knex.raw(init_sql_2),
        this.knex.raw(init_sql_3),
        this.knex.raw(init_sql_4),
        this.knex.raw(init_sql_5),
        this.knex.raw(init_sql_6),
      ]
    );
  }

  public getConnection(tableName?: string): knex {
    if (StringUtils.isNotBlank(tableName)) {
      return this.knex(tableName);
    }
    return this.knex;
  }
}
