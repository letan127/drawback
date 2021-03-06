import { Stroke } from './stroke';
import { Position } from './position';

// Server-side copy of a room's properties
export class Room {
    private name: string;
    private latestStrokeID: number;
    private strokes: Stroke[];
    private numUsers: number;
    private liveStrokes = {};
    private userInfo = [];
    private recentPixel = new Position(0,0);
    private top = 0;
    private bottom = 0;
    private right = 0;
    private left = 0;

    constructor() {
        this.name = "Untitled Canvas";
        this.latestStrokeID = 0;
        this.strokes = [];
        this.numUsers = 0;
    }

    // Returns the name of the canvas
    getName(): string {
        return this.name;
    }

    // Returns a new stroke ID (one larger than the previous ID)
    getID(): number {
        return this.latestStrokeID;
    }

    // Returns all the strokes in this room
    getStrokes(): Stroke[] {
        return this.strokes;
    }

    // Returns the total number of users in the room
    getUsers(): number {
        return this.numUsers;
    }

    getSpecificUser(id) {
        for(var i = 0; i < this.userInfo.length; i++) {
            if (this.userInfo[i].socketID == id) {
                return this.userInfo[i];
            }
        }
    }

    getLiveStrokes() {
        return this.liveStrokes;
    }

    getUserInfo() {
        return this.userInfo;
    }

    getRecentPixel() {
        var pictureSize = {
            pictureHeight: this.bottom - this.top,
            pictureWidth: this.right - this.left,
            focusX: this.right - (this.right - this.left)/2,
            focusY: this.bottom - (this.bottom - this.top)/2
        }
        return pictureSize;
    }
    // Change the canvas name
    rename(name: string): void {
        this.name = name;
    }

    // Increment the strokeID (after giving an ID out) so that it will be unique
    incrementID(): void {
        this.latestStrokeID++;
    }

    // move the live stroke of the user to the new array
    add(id: string): void {
        this.strokes.push(this.liveStrokes[id]);
    }

    // Remove all strokes
    clear(): void {
        this.latestStrokeID = 0;
        this.strokes = [];
        for (var key in this.liveStrokes) {
            this.liveStrokes[key].pos = [];
        }
        this.top = 0;
        this.right = 0;
        this.left = 0;
        this.bottom = 0;
    }

    // Set draw=true if the stroke should be drawn; otherwise false (for undo/redo)
    setDraw(id: number, draw: boolean): boolean {
        if (this.strokes[id] !== undefined) {
            this.strokes[id].draw = draw;
            return true;
        }
        else {
            return false;
        }
    }

    // Add user to the room
    addUser(id: string): void {
        this.numUsers++;
        var userInfo = {
            socketID: id,
            userName: "AnonymousUser" + this.numUsers.toString(),
            userColor: "black"
        }
        this.userInfo.push(userInfo);
    }

    // Remove the user from the room
    removeUser(id: string): void {
        this.numUsers--;
        for(var i = this.userInfo.length - 1; i >= 0; i--) {
            if (this.userInfo[i].socketID == id) {
                this.userInfo.splice(i, 1);
                return
            }
        }
    }

    // Return true if room contains id's livestroke
    containsLiveStroke(id: string): boolean {
        if (id in this.liveStrokes) {
            return true;
        }
        return false;
    }

    //adds a new live stroke to the room based on socket.id
    addLiveStroke(id: string, stroke: Stroke): void {
        this.liveStrokes[id] = stroke;
        var xvalue = stroke.pos[0].x;
        var yvalue = stroke.pos[0].y;
        if (this.top != 0 && this.left != 0) {
            if (yvalue < this.top) {
                this.top = yvalue
            }
            else if (yvalue > this.bottom) {
                this.bottom = yvalue
            }
            if (xvalue > this.right) {
                this.right = xvalue
            }
            else if (xvalue < this.left) {
                this.left = xvalue
            }
        }
        else {
            this.top = yvalue
            this.bottom = yvalue
            this.right = xvalue
            this.left = xvalue
        }
    }

    //adds a pixel to the live stroke of the user
    addPixel(id: string, pixel): void {
        this.liveStrokes[id].pos.push(pixel);
        this.recentPixel = pixel;
        var xvalue = pixel.x;
        var yvalue = pixel.y;
        if (this.top != 0 && this.left != 0) {
            if (yvalue < this.top) {
                this.top = yvalue
            }
            else if (yvalue > this.bottom) {
                this.bottom = yvalue
            }
            if (xvalue > this.right) {
                this.right = xvalue
            }
            else if (xvalue < this.left) {
                this.left = xvalue
            }
        }
        else {
            this.top = yvalue
            this.bottom = yvalue
            this.right = xvalue
            this.left = xvalue
        }
    }

    changeColor(id: string, color: string): void {
        for(var i = 0; i < this.userInfo.length; i++) {
            if (this.userInfo[i].socketID == id) {
                this.userInfo[i].userColor = color;
                return
            }
        }
    }
    changeName(id: string, name: string): void {
        for(var i = 0; i < this.userInfo.length; i++) {
            if (this.userInfo[i].socketID == id) {
                this.userInfo[i].userName = name;
                return
            }
        }
    }
}
