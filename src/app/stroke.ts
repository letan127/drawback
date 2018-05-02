import { Position } from './position';

export class Stroke {
    public pos: Position[];
    public color: string;
    public size: number;
    public mode: string;
    public draw: boolean;
    constructor(positions: Position[], color: string, size: number, mode: string, draw: boolean) {
        this.pos =  positions.slice(0);
        this.color = color;
        this.size = size;
        this.mode = mode;
        this.draw = draw;
    }

    deepCopy() {
        var newStroke = new Stroke(new Array<Position>(), this.color, this.size, this.mode, this.draw);
        for(var i = 0; i < this.pos.length; i++) {
            newStroke.pos.push(new Position(this.pos[i].x, this.pos[i].y));
        }
        return newStroke;
    }

}
