export class PaintInfo {
  public x: number;
  public y: number;
  public color: string;
  public size: number;
  public drag: boolean;
  constructor(x: number, y: number, drag: boolean) {
    this.x = x;
    this.y = y;
    this.drag = drag;
  }
}
