import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { Observable } from 'rxjs/Observable';
import { PaintInfo } from './paintInfo';


@Injectable()
export class DrawService {
    private url = 'http://localhost:4000';
    private socket;

    constructor() {
        this.socket = io(this.url);
    }

    public sendDrawing(message, roomID) {
        var roomandpaint = {
            stroke: message,
            room: roomID
        };
        this.socket.emit('new-message', roomandpaint);
    }

    public callClear(room) {
        this.socket.emit('clear', room);
    }

    public getDrawing = () => {
        return Observable.create((observer) => {
            this.socket.on('new-message', (message) => {
                observer.next(message);
            });
        });
    }

    public clearDrawing = () => {
        return Observable.create((observer) => {
            this.socket.on('clear', (message) => {
                observer.next(message);
            });
        });
    }
    
    public sendRoom(room){
        this.socket.emit('room', room);
    }

}
