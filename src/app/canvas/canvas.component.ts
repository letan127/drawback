import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Stroke } from '../stroke';
import { Position } from '../position';
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
    message: Stroke;
    messages = [];
    id = '';

    constructor(private drawService: DrawService, private route: ActivatedRoute) {
    }

    ngOnInit(): void {
        // Get the room number/id from the URL
        this.route.params.subscribe(params => {
            this.id = params['id'];
        })

        // Send the room ID to the server
        this.drawService.sendRoom(this.id);

        // When the server sends a stroke, add it to our list of strokes and redraw everything
        this.drawService.getStroke().subscribe(message => {
            strokes[message.strokeID] = (message.stroke);
            this.drawStroke(message.stroke);
        })

        // When the server sends a strokeID, set curID
        this.drawService.getStrokeID().subscribe(strokeID => {
            curID = strokeID;
        })
        // When the server sends a clear event, clear the canvas
        this.drawService.getClear().subscribe(() => {
            context.clearRect(0, 0, canvasWidth, canvasHeight);
            strokes = [];
        })
    }

    // Set callback functions for mouse events
    ngAfterViewInit() {
        canvas = <HTMLCanvasElement>document.getElementById("jamboard");
        canvas.addEventListener("mousedown",  this.mouseDown.bind(this), false);
        canvas.addEventListener("mousemove", this.mouseMove.bind(this), false);
        canvas.addEventListener("mouseleave", this.mouseLeave.bind(this), false);
        canvas.addEventListener("mouseup",  this.mouseUp.bind(this), false);
        
	canvas.addEventListener("touchstart", function (e) {
            e.preventDefault();
              var touch = e.touches[0];
              var mouseEvent = new MouseEvent("mousedown", {
                clientX: touch.clientX,
                clientY: touch.clientY
              });
              canvas.dispatchEvent(mouseEvent);
            }, false);
        canvas.addEventListener("touchend", function (e) {
            e.preventDefault();
              var mouseEvent = new MouseEvent("mouseup", {});
              canvas.dispatchEvent(mouseEvent);
            }, false);
        canvas.addEventListener("touchcancel",function (e) {
            e.preventDefault();
              var mouseEvent = new MouseEvent("mouseleave", {});
              canvas.dispatchEvent(mouseEvent);


            }, false);
        canvas.addEventListener("touchmove", function (e) {
          e.preventDefault();
              var touch = e.touches[0];
              var mouseEvent = new MouseEvent("mousemove", {
                clientX: touch.clientX,
                clientY: touch.clientY
              });
              canvas.dispatchEvent(mouseEvent);
            }, false);
	
	context = canvas.getContext("2d");
    }

    // Draws a single stroke that is passed in as an argument
    drawStroke(stroke) {
        context.strokeStyle = stroke.color;
        context.lineWidth = stroke.size;
        context.globalCompositeOperation = stroke.mode;
        context.lineJoin = "round";
        // Draw the first pixel in the stroke
        context.beginPath();
        context.moveTo(stroke.pos[0].x-1, stroke.pos[0].y);
        context.lineTo(stroke.pos[0].x, stroke.pos[0].y);
        context.closePath();
        context.stroke();

        // Draw the rest of the pixels in the stroke
        for (var j = 1; j < stroke.pos.length; j++) {
            // Create a smooth path from the previous pixel to the current pixel
            context.beginPath();
            context.moveTo(stroke.pos[j-1].x, stroke.pos[j-1].y);
            context.lineTo(stroke.pos[j].x, stroke.pos[j].y);
            context.closePath();
            context.stroke();
        }
    }

    // Clears the canvas and redraws every stroke in our list of strokes
    drawAll() {
        // Clear the canvas
        context.clearRect(0, 0, canvasWidth, canvasHeight);

        // Draw each stroke/path from our list of pixel data
        for (var i = 0; i < strokes.length; i++) {
            if (strokes[i])
                this.drawStroke(strokes[i]);
        }
    }

    // Removes everything from the canvas and sends a clear message to the server
    clear() {
        context.clearRect(0, 0, canvasWidth, canvasHeight);
        strokes = [];
        this.drawService.sendClear(this.id);
    }

    // Undoes the latest stroke
    undo() {
    }

    // Set the pen color to the color of the background

    erase() {
        // toggle erase
        if (mode === "destination-out")
            mode = "source-over";
        else
            mode = "destination-out";
        console.log(mode);
        //  document.body.style.cursor = 'URL("https://lh5.ggpht.com/2uHihdKWR-bmNcjJTp-T7KN4OlQjy3gt7DYdKx0LYGgoDRCFBRvbyPll_UJAQcfrNQGU=w300"), auto';
    }

    // Change the pen color
    change_color(event) {
        var color = event.target.id;
        switch(color) {
            case "blue":
                currentPaintColor = "blue";
                break;
            case "brown":
                currentPaintColor = "brown";
                break;
            case "red":
                currentPaintColor = "red";
                break;
            case "green":
                currentPaintColor = "green";
                break;
            case "black":
                currentPaintColor = "black";
                break;
            default:
                currentPaintColor = "black";
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
                currentPenSize = 60;
                break;
            default:
                currentPenSize = 8;
        }
    }

    // Start drawing a stroke
    mouseDown(event: MouseEvent): void {
        //this.drawService.reqStrokeID(this.id);
        // Get the cursor's current position
        x = event.x - canvas.offsetLeft;
        y = event.y - canvas.offsetTop;

        // Add the stroke's pixels and tool settings
        curStroke = new Stroke(new Array<Position>(), currentPaintColor, currentPenSize, mode);
        // Get the first pixel in the new stroke
        curStroke.pos.push(new Position(x,y));
        drag = true;
        this.drawStroke(curStroke);
        //TODO: if sendStroke here, will it cause others to see drawing in real time?
    }

    // Stop drawing and send this latest stroke to the server
    mouseUp(event: MouseEvent): void {
        drag = false;
        this.drawService.reqStrokeID(this.id);
        strokes[curID] = curStroke;
        this.drawService.sendStroke(curStroke, curID, this.id);
    }

    // Continue updating and drawing the current stroke
    mouseMove(event: MouseEvent): void {
        if (drag == true) {
            var x = event.x - canvas.offsetLeft;
            var y = event.y - canvas.offsetTop;
            curStroke.pos.push(new Position(x,y));
            this.drawStroke(curStroke);
            //TODO: if sendStroke here, will it cause others to see drawing in real time?
        }
    }

    // Mouse is outside the canvas
    mouseLeave(event: MouseEvent): void {
        drag = false;
    }
}

// Global canvas data
var canvasHeight = 500;
var canvasWidth = 1000;
var canvas: HTMLCanvasElement;
var context; // Contains a reference to the canvas element

// Global stroke data
var strokes = new Array<Stroke>(); // Contains every stroke on the canvas
var drag = false; // True if we should be drawing to the canvas (after a mouse down)
var currentPaintColor = "black";
var currentPenSize = 8;
var currentStroke = 0; // Keeps count of the current stroke number
var x;
var y;
var mode = "source-over"; // Default drawing mode
var curID;
var curStroke;
var userStrokes = new Array<number>();
var undoStrokes = new Array<number>();
var socket;
