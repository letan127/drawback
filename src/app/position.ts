export class Position {
    public x: number;
    public y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    add(x: number, y: number);
    add(pos: Position);
    add(xOrPos: number | Position, y?: number) {
        if (typeof xOrPos === "number") {
            this.x += xOrPos;
            this.y += y;
        }
        else {
            this.x += xOrPos.x;
            this.y += xOrPos.y;
        }
    }
}
