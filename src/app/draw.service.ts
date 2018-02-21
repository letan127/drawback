import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { Observable } from 'rxjs/Observable';
import { Stroke } from './stroke';


@Injectable()
export class DrawService {
    private url = 'http://localhost:4000';
    private socket;

    constructor() {
        this.socket = io(this.url);
    }

    // Send the server our room ID
    public sendRoom(room){
        this.socket.emit('room', room);
    }

    // Send a stroke object and the client's room ID to the server
    public sendStroke(stroke, roomID) {
        var strokeWithRoom = {
            stroke: stroke,
            room: roomID
        };
        this.socket.emit('stroke', strokeWithRoom);
    }

    // When the server sends a stroke, send the strokeMessage to subscried observers
    public getStroke = () => {
        return Observable.create((observer) => {
            this.socket.on('stroke', (strokeMessage) => {
                observer.next(strokeMessage);
            });
        });
    }

    // Tell server that the client clicked the clear button
    public sendClear(room) {
        this.socket.emit('clear', room);
    }

    // When the server emits a clear message, send the room to subscribed observers
    public getClear = () => {
        return Observable.create((observer) => {
            this.socket.on('clear', (room) => {
                observer.next(room);
            });
        });
    }
}
