import { Stroke } from './stroke';

// Server-side copy of a room's properties
export class Room {
    private latestStrokeID: number;
    private strokes: Stroke[];

    constructor() {
        this.latestStrokeID = 0;
        this.strokes = [];
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
}
