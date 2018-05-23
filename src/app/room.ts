import { Stroke } from './stroke';

// Server-side copy of a room's properties
export class Room {
    private name: string;
    private latestStrokeID: number;
    private strokes: Stroke[];
    private numUsers: number;
    private liveStrokes = {};
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

    getLiveStrokes() {
        return this.liveStrokes;
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
    }

    // Set draw=true if the stroke should be drawn; otherwise false (for undo/redo)
    setDraw(id: number, draw: boolean): void {
        this.strokes[id].draw = draw;
    }

    // Add user to the room
    addUser(id: string): void {
        this.numUsers++;
    }

    // Remove the user from the room
    removeUser(id: string): void {
        this.numUsers--;
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
    }

    //adds a pixel to the live stroke of the user
    addPixel(id: string, pixel): void {
        this.liveStrokes[id].pos.push(pixel);
    }
}
