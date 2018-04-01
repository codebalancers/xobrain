import { Injectable } from '@angular/core';

@Injectable()
export class ElectronService {
  private _electron = (<any>window).require('electron');
  private _fs = (<any>window).require('fs');

  public getRemote() {
    return this._electron.remote;
  }

  public getElectron(): any {
    return this._electron;
  }

  public getFs(): any {
    return this._fs;
  }
}
