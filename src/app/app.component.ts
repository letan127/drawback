import { Component } from '@angular/core';
import { PaintInfo } from './paintInfo';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';
  constructor() {
  }
  clear() {
    context.clearRect(0, 0, canvasWidth, canvasHeight);
    paintArray = [];
  }
}

var canvasHeight = 500;
var canvasWidth = 1000;
var paint = false;
var canvas: HTMLCanvasElement;
var context;
var drag = false;
var paintArray = new Array<PaintInfo>();
var x;
var y;


window.onload=function() {
  canvas = <HTMLCanvasElement>document.getElementById("jamboard");
  canvas.addEventListener("mousedown", mouseDown, false);
  canvas.addEventListener("mousemove", mouseMove, false);
  canvas.addEventListener("mouseleave", mouseLeave, false);
  canvas.addEventListener("mouseup", mouseUp, false);
  context = canvas.getContext("2d");

}
function mouseDown(event: MouseEvent): void {
   x = event.x - canvas.offsetLeft;
   y = event.y - canvas.offsetTop;
   var paintInfo = new PaintInfo(x, y, drag);
   drag = true;
   paint = true;
   paintArray.push(paintInfo);
   draw()
}

function mouseUp(event: MouseEvent): void {
  paint = false;
  drag = false
}
function mouseMove(event: MouseEvent): void {
  if (paint == true) {
    var x = event.x - canvas.offsetLeft;
    var y = event.y - canvas.offsetTop;
    var paintInfo = new PaintInfo(x, y, drag);
    paintArray.push(paintInfo);
    draw()
  }
}

function mouseLeave(event: MouseEvent): void {
  paint = false;
}


//taken from online
function draw() {
  context.clearRect(0, 0, canvasWidth, canvasHeight);
  context.strokeStyle = "#df4b26";
  context.lineJoin = "round";
  context.lineWidth = 5;
  for(var i=0; i < paintArray.length; i++) {
    context.beginPath();
    if(paintArray[i].drag && i){
      context.moveTo(paintArray[i-1].x, paintArray[i-1].y);
    }
    else{
      context.moveTo(paintArray[i].x - 1, paintArray[i].y);
    }
  context.lineTo(paintArray[i].x, paintArray[i].y);
  context.closePath();
  context.stroke();
  }
}
