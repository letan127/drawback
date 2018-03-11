import { Stroke } from './stroke';

// Server-side copy of a room's properties
export class Room {
    private name: string;
    private latestStrokeID: number;
    private strokes: Stroke[];
    private numUsers: number;

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

    // Change the canvas name
    rename(name: string): void {
        this.name = name;
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

    // Add user to the room
    addUser(id: string): void {
        this.numUsers++;
    }

    // Remove the user from the room
    removeUser(id: string): void {
        this.numUsers--;
    }
}
