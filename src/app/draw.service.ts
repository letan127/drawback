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
    public sendStroke(stroke, strokeID, roomID) {
        var strokeWithRoom = {
            stroke: stroke,
            strokeID: strokeID,
            room: roomID
        };
        this.socket.emit('stroke', strokeWithRoom);
    }

    // When the server sends a stroke, send the strokeMessage to our subscribed observers
    public getStroke = () => {
        return Observable.create((observer) => {
            this.socket.on('stroke', (strokeMessage) => {
                observer.next(strokeMessage);
            });
        });
    }

    // Ask the server for a strokeID
    public reqStrokeID(room) {
        this.socket.emit('strokeID', room);
    }

    // When the server sends a strokeID, send it to our subscribed observers
    public getStrokeID = () => {
        return Observable.create((observer) => {
            this.socket.on('strokeID', (strokeID) => {
                observer.next(strokeID);
            });
        });
    }

    // Tell server that the client clicked the clear button
    public sendClear(room) {
        this.socket.emit('clear', room);
    }

    // When the server emits a clear message, subscribed observers will execute their functions
    public getClear = () => {
        return Observable.create((observer) => {
            this.socket.on('clear', (room) => {
                observer.next(); // Don't send anything to the subscribed observers
            });
        });
    }
}
