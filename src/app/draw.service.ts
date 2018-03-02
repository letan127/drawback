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

    // Give the new user the current state of the canvas
    public newUser = () => {
        return Observable.create((observer) => {
            this.socket.on('newUser', (strokeArray) => {
                observer.next(strokeArray);
            });
        });
    }

    // Send the server our room ID
    public sendRoom(room){
        this.socket.emit('room', room);
    }

    // Send a stroke object, its ID, and the client's room ID to the server
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

    // Notify subscribed observers when server sends a clear event
    public getClear = () => {
        return Observable.create((observer) => {
            this.socket.on('clear', (room) => {
                observer.next(); // Don't send anything to the subscribed observers
            });
        });
    }

    // Tell the server that the client clicked the undo button
    public sendUndo(room, strokeID) {
        var undoStroke = {
            room: room,
            strokeID: strokeID
        };
        this.socket.emit('undo', undoStroke);
    }

    // Notify subscribed observers when the server sends an undo event and passes the strokeID
    public getUndo = () => {
        return Observable.create((observer) => {
            this.socket.on('undo', (strokeID) => {
                observer.next(strokeID);
            });
        });
    }

    // Tell the server that the client clicked the redo button
    public sendRedo(room, strokeID) {
        var redoStroke = {
            room: room,
            strokeID: strokeID
        };
        this.socket.emit('redo', redoStroke);
    }

    // Notify subscribed observers when the server sends a redo event and passes the strokeID
    public getRedo = () => {
        return Observable.create((observer) => {
            this.socket.on('redo', (strokeID) => {
                observer.next(strokeID);
            });
        });
    }

    // Tell the server that the client changed their color
    public sendColor(room, color) {
        var colorMessage = {
            room: room,
            color: color
        };
        this.socket.emit('color', colorMessage);
    }
}
