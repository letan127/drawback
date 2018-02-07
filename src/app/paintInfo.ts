export class PaintInfo {
  public x: number;
  public y: number;
  public color: string;
  public size: number;
  public drag: boolean;
  constructor(x: number, y: number, drag: boolean, color: string, size: number) {
    this.x = x;
    this.y = y;
    this.drag = drag;
    this.color = color;
    this.size = size;
  }
}
