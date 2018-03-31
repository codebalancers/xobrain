import * as knex from 'knex';
import { Injectable } from '@angular/core';
import { ElectronService } from './electron.service';
import { StringUtils } from '../../util/string.utils';


@Injectable()
export class DatabaseService {
  private knex;

  constructor(electronService: ElectronService) {
    this.knex = electronService.getRemote().getGlobal('knex') as knex;
  }

  public ensureSchema(): Promise<any> {
    console.log('migration');
    return this.knex.migrate.latest();
  }

  public getConnection(tableName?: string): knex {
    if (StringUtils.isNotBlank(tableName)) {
      return this.knex(tableName);
    }
    return this.knex;
  }
}
