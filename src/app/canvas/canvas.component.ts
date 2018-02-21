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
        // Get the room number/id from URL
        this.route.params.subscribe(params => {
            this.id = params['id'];
        })

        // Send the room ID to the server
        this.drawService.sendRoom(this.id);

        // When the server sends a stroke, draw it
        this.drawService.getDrawing().subscribe(message => {
            // Add the stroke to our list of strokes
            paintArray = paintArray.concat(message.stroke);

            // Remove everything from the canvas
            context.clearRect(0, 0, canvasWidth, canvasHeight);

            // Set the pen type
            context.lineJoin = "round";

            // Redraw everything from our list of strokes
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

        // When the server a clear event, clear the canvas
        this.drawService.clearDrawing().subscribe(message => {
            context.clearRect(0, 0, canvasWidth, canvasHeight);
            paintArray = [];
            currentStroke = 0;
        })
    }

    // Set callback functions for mouse events
    ngAfterViewInit() {
        canvas = <HTMLCanvasElement>document.getElementById("jamboard");
        canvas.addEventListener("mousedown",  this.mouseDown.bind(this), false);
        canvas.addEventListener("mousemove", this.mouseMove.bind(this), false);
        canvas.addEventListener("mouseleave", this.mouseLeave.bind(this), false);
        canvas.addEventListener("mouseup",  this.mouseUp.bind(this), false);
        context = canvas.getContext("2d");
    }

    // Removes everything from the canvas
    clear() {
        this.drawService.callClear(this.id);
    }

    // Undoes the latest stroke
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

    // Set the pen color to the color of the background
    erase() {
        currentPaintColor = "#FFFFFF";
        //  document.body.style.cursor = 'URL("https://lh5.ggpht.com/2uHihdKWR-bmNcjJTp-T7KN4OlQjy3gt7DYdKx0LYGgoDRCFBRvbyPll_UJAQcfrNQGU=w300"), auto';
    }

    // Change the pen color
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

    // Change the pen size
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

    // Start drawing a stroke
    mouseDown(event: MouseEvent): void {
        // Get the cursor's current position
        x = event.x - canvas.offsetLeft;
        y = event.y - canvas.offsetTop;

        // Get the current tool and pixel data
        var paintInfo = new PaintInfo(x, y, drag, currentPaintColor, currentPenSize, currentStroke);
        drag = true;
        paint = true;

        // Add the single pixel info to our list of strokes
        paintArray.push(paintInfo);
        strokeArray.push(paintInfo);

        // Clear the canvas and redraw everything
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

    // Stop drawing
    mouseUp(event: MouseEvent): void {
        paint = false;
        drag = false
        currentStroke += 1;
        this.drawService.sendDrawing(strokeArray, this.id);
        strokeArray = [];
    }

    // Continue drawing a stroke
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

    // Mouse is outside the canvas
    mouseLeave(event: MouseEvent): void {
        paint = false;
        drag = false;
    }

//taken from online
}

// Global canvas data
var canvasHeight = 500;
var canvasWidth = 1000;
var canvas: HTMLCanvasElement;
var context; // Contains a reference to the canvas element

// Global pixel/stroke data
var paintArray = new Array<PaintInfo>(); // Array of every pixel and its tool data
var strokeArray = new Array<PaintInfo>(); // Array of all pixel and tool data for one stroke (from mousedown to mouseup)
var paint = false; // True if we should be drawing to the canvas (after a mouse down)
var drag = false; // True if we should be drawing
var currentPaintColor = "#030202";
var currentPenSize = 5;
var currentStroke = 0; // Keeps count of the current stroke number
var x;
var y;