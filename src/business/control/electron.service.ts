import { Injectable } from '@angular/core';
import * as fs from 'fs';

@Injectable()
export class ElectronService {
  private _electron = (<any>window).require('electron');
  private _fs = (<any>window).require('fs') as fs;

  public getRemote() {
    return this._electron.remote;
  }

  public getElectron(): any {
    return this._electron;
  }

  public getFs(): fs {
    return this._fs;
  }
}
