import { Stroke } from './stroke';

// Server-side copy of a room's properties
export class Room {
    private latestStrokeID: number;
    private strokes: Stroke[];
    private colors: {}; // Access user's pen color with their socket id

    constructor() {
        this.latestStrokeID = 0;
        this.strokes = [];
        this.colors = {};
    }

    // Returns a new stroke ID (one larger than the previous ID)
    getID(): number {
        return this.latestStrokeID;
    }

    // Returns all the strokes in this room
    getStrokes(): Stroke[] {
        return this.strokes;
    }

    // Increment the strokeID (after giving an ID out) so that it will be unique
    incrementID(): void {
        this.latestStrokeID++;
    }

    // Add a new stroke
    add(stroke: Stroke): void {
        this.strokes.push(stroke);
    }

    // Remove all strokes
    clear(): void {
        this.latestStrokeID = 0;
        this.strokes = [];
    }

    // Set draw=true if the stroke should be drawn; otherwise false (for undo/redo)
    setDraw(id: number, draw: boolean): void {
        this.strokes[id].draw = draw;
    }

    // Add user and set their pen color to the default black
    addUser(id: string): void {
        this.colors[id] = "black";
    }

    // Remove the user's data from this room
    removeUser(id: string): void {
        delete this.colors[id];
    }

    // Change the user's pen color
    changeColor(id: string, color: string): void {
        this.colors[id] = color;
    }
}
