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
}

var canvasHeight = 500;
var canvasWidth = 1000;
var paint = false;
var canvas: HTMLCanvasElement;
var context;
var mouseDown = false;
var paintArray = new Array<PaintInfo>();
var x;
var y;


window.onload=function() {
  canvas = <HTMLCanvasElement>document.getElementById("jamboard");
  context = canvas.getContext("2d");

  canvas.onmousedown = function(e){
    mouseDown = true;
    paint = true;
    x = e.x - canvas.offsetLeft;
    y = e.y - canvas.offsetTop;
    var paintInfo = new PaintInfo(x, y, false);
    paintArray.push(paintInfo);
    draw()

  }
  canvas.onmouseup = function(e){
    mouseDown = false;
    paint = false;
  }
  canvas.onmouseleave = function(e){
    paint = false;
  }
  canvas.onmousemove = function(e){
    if (mouseDown == true) {
      x = e.x - canvas.offsetLeft;
      y = e.y - canvas.offsetTop;
      var paintInfo = new PaintInfo(x, y, true);
      paintArray.push(paintInfo);
      draw()
    }
  }

}

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
