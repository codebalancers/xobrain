import { Injectable } from '@angular/core';
import * as electron from 'electron';

const electron = (<any>window).require('electron') as electron;

@Injectable()
export class ElectronService {

  public getElectron(): electron {
    return electron;
  }
}
