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

}
