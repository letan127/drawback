export class Position {
    public x: number;
    public y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    add(position: Position) {
        this.x += position.x;
        this.y += position.y;
    }
}
