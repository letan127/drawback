import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Stroke } from './stroke';


@Injectable()
export class DrawService {
    private socket;

    constructor() {
    }

    public setSocket(io){
        this.socket = io;
    }

    public getSocket(){
        return this.socket;
    }

    // Give the new user the current state of the canvas
    public initUser = () => {
        return Observable.create((observer) => {
            this.socket.on('initUser', (init) => {
                observer.next(init);
            });
        });
    }

    // Notify current clients that a user has either entered or left the room
    public updateUserCount = () => {
        return Observable.create((observer) => {
            this.socket.on('updateUserCount', (amount) => {
                observer.next(amount);
            })
        })
    }

    // Send the server our room ID
    public sendRoom(room){
        this.socket.emit('room', room);
    }

    // Send the new canvas title to the server
    public sendTitle(room, title) {
        var roomTitle = {
            room: room,
            title: title
        };
        this.socket.emit('title', roomTitle);
    }

    // Get the new canvas title from the server
    public getTitle() {
        return Observable.create((observer) => {
            this.socket.on('title', (title) => {
                observer.next(title);
            });
        });
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

    // Ask the server if the room the client wants to move to exists
    public requestRoomCheck(newRoom) {
        this.socket.emit('check', newRoom);
    }

    public getRoomCheck = () => {
        return Observable.create((observer) => {
            this.socket.on('check', (checkRoom) => {
                observer.next(checkRoom);
            });
        });
    }

    public sendNewLiveStroke(stroke, room) {
        var liveStroke = {
            room: room,
            stroke: stroke
        };
        this.socket.emit('newLiveStroke', liveStroke);
    }

    public getNewLiveStroke = () => {
        return Observable.create((observer) => {
            this.socket.on('startLiveStroke', (strokeAndID) => {
                observer.next(strokeAndID);
            });
        });
    }

    public sendPixel(pixel, room) {
        var pixelRoom = {
            pixel: pixel,
            room: room
        }
        this.socket.emit('newPixel', pixelRoom);
    }

    public getNewPixel = () => {
        return Observable.create((observer) => {
            this.socket.on('addPixelToStroke', (pixelAndID) => {
                observer.next(pixelAndID);
            });
        });
    }
}
