import { Component, OnInit, AfterViewInit } from '@angular/core';
import { PaintInfo } from '../paintInfo';
import * as socketIo from 'socket.io-client';
import { DrawService } from '../draw.service';
import * as moment from 'moment';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.css'],
  providers: [DrawService]
})
export class CanvasComponent implements OnInit {
  title = 'app';
  message: PaintInfo;
  messages = [];
  id = '';

  constructor(private drawService: DrawService, private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    // if (this.route.snapshot.params['id'] != '') {
    //   this.drawService.sendRoom(this.route.snapshot.params['id']);
    // }
    this.route.params.subscribe(params => {
      this.id = params['id'];
    })
    this.drawService.sendRoom(this.id);
    this.drawService.getDrawing().subscribe(message => {
      paintArray = paintArray.concat(message.stroke);
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
    })
    this.drawService.clearDrawing().subscribe(message => {
      context.clearRect(0, 0, canvasWidth, canvasHeight);
      paintArray = [];
      currentStroke = 0;
    })
  }
  ngAfterViewInit() {
    canvas = <HTMLCanvasElement>document.getElementById("jamboard");
    canvas.addEventListener("mousedown",  this.mouseDown.bind(this), false);
    canvas.addEventListener("mousemove", this.mouseMove.bind(this), false);
    canvas.addEventListener("mouseleave", this.mouseLeave.bind(this), false);
    canvas.addEventListener("mouseup",  this.mouseUp.bind(this), false);
    context = canvas.getContext("2d");
  }


  public clear() {
    this.drawService.callClear(this.id);
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
  }
  erase() {
    currentPaintColor = "#FFFFFF";
  //  document.body.style.cursor = 'URL("https://lh5.ggpht.com/2uHihdKWR-bmNcjJTp-T7KN4OlQjy3gt7DYdKx0LYGgoDRCFBRvbyPll_UJAQcfrNQGU=w300"), auto';
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

  mouseDown(event: MouseEvent): void {
     x = event.x - canvas.offsetLeft;
     y = event.y - canvas.offsetTop;
     var paintInfo = new PaintInfo(x, y, drag, currentPaintColor, currentPenSize, currentStroke);
     drag = true;
     paint = true;
     paintArray.push(paintInfo);
     strokeArray.push(paintInfo);
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

  mouseUp(event: MouseEvent): void {
    paint = false;
    drag = false
    currentStroke += 1;
    this.drawService.sendDrawing(strokeArray, this.id);
    strokeArray = [];
  }
  mouseMove(event: MouseEvent): void {
    if (paint == true) {
      var x = event.x - canvas.offsetLeft;
      var y = event.y - canvas.offsetTop;
      var paintInfo = new PaintInfo(x, y, drag, currentPaintColor, currentPenSize, currentStroke);
      paintArray.push(paintInfo);
      strokeArray.push(paintInfo);
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
  }

  mouseLeave(event: MouseEvent): void {
      paint = false;
      drag = false;
  }

  //taken from online

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
