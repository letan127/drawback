import { Position } from './position';

export class Stroke {
    public pos: Position[];
    public color: string;
    public size: number;
    public stroke: number;
    public mode: string;
    constructor(positions: Position[], color: string, size: number, mode:string) {
        this.pos =  positions.slice(0);
        this.color = color;
        this.size = size;
        this.mode = mode;
    }
}
