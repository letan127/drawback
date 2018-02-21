import { Position } from './position';

export class PaintInfo {
    public pos: Position;
    public color: string;
    public size: number;
    public drag: boolean;
    public stroke: number;
    constructor(x: number, y: number, drag: boolean, color: string, size: number, stroke: number) {
        this.pos = new Position(x, y);
        this.drag = drag;
        this.color = color;
        this.size = size;
        this.stroke = stroke;
    }
}
