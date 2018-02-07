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
    currentStroke = 0;
  }
  undo() {
    console.log(currentStroke);
    if(currentStroke == 0) {
      return;
    }
    currentStroke -= 1;
    for(var i = paintArray.length - 1; i >= 0; i--) {
      if(paintArray[i].stroke == currentStroke) {
        paintArray.splice(i,1);
      }
    }
    draw();
  }
  change_color(event) {
    var color = event.target.id;
    switch(color) {
      case "blue":
        currentPaintColor = "#130CD5";
        break;
      case "brown":
        currentPaintColor = "#8A5111";
        break;
      case "red":
        currentPaintColor = "#E82218";
        break;
      case "green":
        currentPaintColor = "#18E85D";
        break;
      case "black":
        currentPaintColor = "#030202";
        break;
      default:
        currentPaintColor = "#030202";
    }
  }
  change_pen(event) {
    var color = event.target.id;
    switch(color) {
      case "pen-1":
        currentPenSize = 2;
        break;
      case "pen-2":
        currentPenSize= 8;
        break;
      case "pen-3":
        currentPenSize = 15;
        break;
      case "pen-4":
        currentPenSize = 30;
        break;
      case "pen-5":
        currentPenSize = 80;
        break;
      default:
        currentPenSize = 10;
    }
  }

}

var canvasHeight = 500;
var canvasWidth = 1000;
var paint = false;
var currentPaintColor = "#030202";
var currentPenSize = 5;
var currentStroke = 0;
var canvas: HTMLCanvasElement;
var context;
var drag = false;
var paintArray = new Array<PaintInfo>();
var strokeArray = new Array<PaintInfo>();
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
   var paintInfo = new PaintInfo(x, y, drag, currentPaintColor, currentPenSize, currentStroke);
   drag = true;
   paint = true;
   paintArray.push(paintInfo);
   draw()
}

function mouseUp(event: MouseEvent): void {
  paint = false;
  drag = false
  currentStroke += 1;
}
function mouseMove(event: MouseEvent): void {
  if (paint == true) {
    var x = event.x - canvas.offsetLeft;
    var y = event.y - canvas.offsetTop;
    var paintInfo = new PaintInfo(x, y, drag, currentPaintColor, currentPenSize, currentStroke);
    paintArray.push(paintInfo);
    draw()
  }
}

function mouseLeave(event: MouseEvent): void {
    paint = false;
    drag = false;
}


//taken from online
function draw() {
  context.clearRect(0, 0, canvasWidth, canvasHeight);
  context.lineJoin = "round";
  for(var i=0; i < paintArray.length; i++) {
    context.beginPath();
    if(paintArray[i].drag && i){
      context.strokeStyle = paintArray[i].color;
      context.lineWidth = paintArray[i].size;
      context.moveTo(paintArray[i-1].x, paintArray[i-1].y);
    }
    else{
      context.strokeStyle = paintArray[i].color;
      context.lineWidth = paintArray[i].size;
      context.moveTo(paintArray[i].x - 1, paintArray[i].y);
    }
  context.lineTo(paintArray[i].x, paintArray[i].y);
  context.closePath();
  context.stroke();
  }
}
