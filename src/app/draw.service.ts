import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class DrawService {
  private url = 'http://localhost:4000';
  private socket;
  constructor() {
    this.socket = io(this.url);
  }
  public sendDrawing(message) {
    this.socket.emit('new-message', message);
  }
  public getDrawing = () => {
    return Observable.create((observer) => {
      this.socket.on('new-message', (message) => {
        observer.next(message);
      });
    });
  }

}
