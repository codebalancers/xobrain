import { Injectable } from '@angular/core';

@Injectable()
export class ElectronService {
  private _electron = (<any>window).require('electron');

  public getRemote() {
    return this._electron.remote;
  }

  public getElectron(): any {
    return this._electron;
  }
}
