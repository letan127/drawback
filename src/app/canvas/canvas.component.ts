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
            strokes.push(message.stroke);
            context.clearRect(0, 0, canvasWidth, canvasHeight);
            context.lineJoin = "round";
            this.draw();
        })

        // When the server sends a clear event, clear the canvas
        this.drawService.getClear().subscribe(() => {
            context.clearRect(0, 0, canvasWidth, canvasHeight);
            strokes = [];
        })
    }

    ngAfterViewInit() {
        // Set callback functions for canvas mouse events
        canvas = <HTMLCanvasElement>document.getElementById("canvas");
        this.resize();
        window.addEventListener("resize", this.resize.bind(this), false);
        canvas.addEventListener("mousedown",  this.mouseDown.bind(this), false);
        canvas.addEventListener("mousemove", this.mouseMove.bind(this), false);
        canvas.addEventListener("mouseleave", this.mouseLeave.bind(this), false);
        canvas.addEventListener("mouseup",  this.mouseUp.bind(this), false);
        context = canvas.getContext("2d");

        /* When user clicks a tool, that tool's icon will become active */
        // Get all the tools from the toolbar
        var tools = document.getElementsByClassName("tool-button");

        // Set callback functions for each tool; tool becomes active when clicked
        for (var i = 0; i < tools.length; i++) {
            tools[i].addEventListener("click", function() {
                var actives = document.getElementsByClassName("active");

                // Always keep either the pen or eraser active but switch other tools' actives
                if (this.id === "pen" || this.id === "eraser")
                    actives[0].className = actives[0].className.replace(" active", "");
                else if (actives.length > 1 &&
                        (actives[0].id === "pen" || actives[0].id === "eraser"))
                    actives[1].className = actives[1].className.replace(" active", "");

                this.className += " active";
            });
        }
    }

    // When the window is resized, reset the canvas size and redraw it
    resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        canvasWidth = canvas.width;
        canvasHeight = canvas.height;

        if (strokes.length > 0)
            this.draw();
    }
    /* When the user clicks on the button, toggle between hiding and showing the dropdown content */
    showColors() {
        document.getElementById("colors").classList.toggle("show");
    }

    showSizes() {
        document.getElementById("sizes").classList.toggle("show");
    }

    // Clears the canvas and redraws every stroke in our list of strokes
    draw() {
        // Clear the canvas
        context.clearRect(0, 0, canvasWidth, canvasHeight);
        // Set the pen type
        context.lineJoin = "round";


        // Draw each stroke/path from our list of pixel data
        for (var i = 0; i < strokes.length; i++) {
            context.strokeStyle = strokes[i].color;
            context.lineWidth = strokes[i].size;
            context.globalCompositeOperation = strokes[i].mode;

            // Draw the first pixel in the stroke
            context.beginPath();
            context.moveTo(strokes[i].pos[0].x-1, strokes[i].pos[0].y);
            context.lineTo(strokes[i].pos[0].x, strokes[i].pos[0].y);
            context.closePath();
            context.stroke();

            // Draw the rest of the pixels in the stroke
            for (var j = 1; j < strokes[i].pos.length; j++) {
                // Create a smooth path from the previous pixel to the current pixel
                context.beginPath();
                context.moveTo(strokes[i].pos[j-1].x, strokes[i].pos[j-1].y);
                context.lineTo(strokes[i].pos[j].x, strokes[i].pos[j].y);
                context.closePath();
                context.stroke();
            }
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
        // console.log(currentStroke);
        // if(currentStroke == 0) {
        //     return;
        // }
        // currentStroke -= 1;
        // for(var i = paintArray.length - 1; i >= 0; i--) {
        //     if(paintArray[i].stroke == currentStroke) {
        //         paintArray.splice(i,1);
        //     }
        // }
    }

    // Pen tool was clicked; get out of erase mode
    selectPen() {
        mode = "source-over";
    }

    // Erase tool was clicked; enter erase mode
    erase() {
        mode = "destination-out";
    }

    // Change the tool color
    changeColor(event) {
        var color;
        if (event.target.tagName.toLowerCase() === "i")
            color = event.currentTarget.id; // Get parent's ID
        else
            color = event.target.id;

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
    changeSize(event) {
        var size;
        if (event.target.tagName.toLowerCase() === "i")
            size = event.currentTarget.id; // Get parent's ID
        else
            size = event.target.id;

        switch(size) {
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
        // Get the cursor's current position
        x = event.x - canvas.offsetLeft;
        y = event.y - canvas.offsetTop;

        // Add the stroke's pixels and tool settings
        strokes.push(new Stroke(new Array<Position>(), currentPaintColor, currentPenSize, mode));
        // Get the first pixel in the new stroke
        strokes[strokes.length-1].pos.push(new Position(x,y));

        drag = true;
        this.draw();
    }

    // Stop drawing and send this latest stroke to the server
    mouseUp(event: MouseEvent): void {
        drag = false;
        this.drawService.sendStroke(strokes[strokes.length-1], this.id);
    }

    // Continue updating and drawing the current stroke
    mouseMove(event: MouseEvent): void {
        if (drag == true) {
            var x = event.x - canvas.offsetLeft;
            var y = event.y - canvas.offsetTop;

            strokes[strokes.length-1].pos.push(new Position(x,y));
            this.draw();
        }
    }

    // Mouse is outside the canvas
    mouseLeave(event: MouseEvent): void {
        drag = false;
    }
}

// Global canvas data
var canvasHeight;
var canvasWidth;
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
