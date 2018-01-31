import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';
  constructor() {
  }
}
var paint = false
var canvas = <HTMLCanvasElement>document.getElementById('jamboard');
canvas.addEventListener("mousedown", mouseDown, false);
canvas.addEventListener("mousemove", mouseMove, false);
canvas.addEventListener("mouseup", mouseUp, false);
canvas.addEventListener("mouseleave", mouseLeave, false);


function mouseDown(event: MouseEvent): void {
  var x: number = event.x; //x and y coordinates of mousepress on window
  var y: number = event.y;
  x -= canvas.offsetLeft;
  y -= canvas.offsetTop;
  paint = true
}
function mouseMove(event: MouseEvent): void {
  if (paint) {

  }
}
function mouseUp(event: MouseEvent): void {
  paint = false;
}

function mouseLeave(event: MouseEvent): void {
  paint = false;
}
