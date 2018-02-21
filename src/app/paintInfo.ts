export class PaintInfo {
    public x: number;
    public y: number;
    public color: string;
    public size: number;
    public drag: boolean;
    public stroke: number;
    constructor(x: number, y: number, drag: boolean, color: string, size: number, stroke: number) {
        this.x = x;
        this.y = y;
        this.drag = drag;
        this.color = color;
        this.size = size;
        this.stroke = stroke;
    }
}
