import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Stroke } from '../stroke';
import { Position } from '../position';
import { DrawService } from '../draw.service';
import { ActivatedRoute} from '@angular/router';
import { DOCUMENT } from '@angular/platform-browser';
import { Inject } from '@angular/core';

@Component({
    selector: 'app-canvas',
    templateUrl: './canvas.component.html',
    styleUrls: ['./canvas.component.css'],
    providers: [DrawService]
})

export class CanvasComponent implements OnInit {
    title = 'app';
    id = '';
    url = '';

    constructor(private drawService: DrawService, private route: ActivatedRoute, @Inject(DOCUMENT) private document: Document) {
    }

    ngOnInit(): void {
        // Get the full URL of this room
        this.url = this.document.location.href;

        // Get the room number/id from the URL
        this.route.params.subscribe(params => {
            this.id = params['id'];
        })

        // Send the room ID to the server
        this.drawService.sendRoom(this.id);

        // When the server sends a stroke, add it to our list of strokes and draw it
        this.drawService.getStroke().subscribe(message => {
            strokes[message.strokeID] = message.stroke;
            this.draw(message.stroke);
        })

        // When the server sends a strokeID, give it to the earliest orphaned stroke
        // and send the stroke to everyone else
        this.drawService.getStrokeID().subscribe(strokeID => {
            if(!orphanedStrokes.length)
                return;
            // Determine which stack to add the strokeID to
            if (!orphanedStrokes[0].draw) {
                undoIDs.unshift(strokeID);
            }
            else
                myIDs.push(strokeID);
            strokes[strokeID] = orphanedStrokes.shift();
            this.drawService.sendStroke(strokes[strokeID], strokeID, this.id);
        })

        // When the server sends a clear event, clear the canvas, and reset values
        this.drawService.getClear().subscribe(() => {
            context.clearRect(0, 0, canvasWidth, canvasHeight);
            strokes = [];
            myIDs = [];
            undoIDs = [];
            orphanedStrokes = [];
            orphanUndoCount = 0;
        })

        // Received another client's undo; don't draw that stroke
        this.drawService.getUndo().subscribe(strokeID => {
            strokes[strokeID].draw = false;
            this.drawAll();
        })

        // Received another client's redo; draw that stroke
        this.drawService.getRedo().subscribe(strokeID => {
            strokes[strokeID].draw = true;
            this.drawAll();
        })

        // This client is a new user; give them the current canvas state to draw
        this.drawService.newUser().subscribe(strokeArray => {
            strokes = strokeArray;
            this.drawAll();
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

        // Set slider display and pen size to the default slider value
        var slider = <HTMLInputElement>document.getElementById("pen-size-slider");
        var display = document.getElementById("pen-slider-value");
        display.innerHTML = slider.value;
        currentPenSize = +slider.value * 4;
    }

    // When the window is resized, reset the canvas size and redraw it
    resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        canvasWidth = canvas.width;
        canvasHeight = canvas.height;

        if (strokes.length > 0)
            this.drawAll();
    }

    copyURL() {
        //TODO: create a popup that has this url
        console.log(this.url);
    }

    /* When the user clicks on the button, toggle between hiding and showing the dropdown content */
    showColors() {
        document.getElementById("colors").classList.toggle("show");
    }

    showSizes() {
        document.getElementById("sizes").classList.toggle("show");
    }

    // Pen tool was clicked; get out of erase mode
    selectPen() {
        console.log('hi');
        draw = true;
        mode = "source-over";
    }

    // Set the pen color to the color of the background
    selectEraser() {
        mode = "destination-out";
    }

    // Draws a single stroke that is passed in as an argument
    draw(stroke) {
        if(!stroke.draw)
            return;

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
                this.draw(strokes[i]);
        }

        // Draw local orphan strokes
        for (var j = 0; j < orphanedStrokes.length; j++) {
            if (orphanedStrokes[j])
                this.draw(orphanedStrokes[j]);
        }
    }

    // Removes everything from the canvas and sends a clear message to the server
    clear() {
        context.clearRect(0, 0, canvasWidth, canvasHeight);
        strokes = [];
        myIDs = [];
        undoIDs = [];
        orphanedStrokes = [];
        orphanUndoCount = 0;
        this.drawService.sendClear(this.id);
    }

    // Undoes the latest stroke
    undo() {
        // If there are orphaned strokes that can be undone, undo them first
        if(orphanedStrokes.length && orphanedStrokes.length - orphanUndoCount > 0) {
            orphanedStrokes[orphanedStrokes.length - orphanUndoCount - 1].draw = false;
            orphanUndoCount++;
        }
        // Undo my strokes
        else {
            if(!myIDs.length)
                return;
            undoIDs.push(myIDs.pop());
            this.drawService.sendUndo(this.id, undoIDs[undoIDs.length - 1]);
            strokes[undoIDs[undoIDs.length - 1]].draw = false;
            this.drawAll();
        }
    }

    // Redoes the latest undone stroke
    redo() {
        // If strokes with IDS can't be redone, check if orphaned strokes can
        if(!undoIDs.length && orphanUndoCount) {
            orphanedStrokes[orphanedStrokes.length - orphanUndoCount].draw = true;
            orphanUndoCount--;
        }
        else {
            // Check if strokes with IDs can be undone
            if(!undoIDs.length)
                return;
            var redoStroke = undoIDs.pop();
            myIDs.push(redoStroke);
            this.drawService.sendRedo(this.id, redoStroke);
            strokes[redoStroke].draw = true;
            this.draw(strokes[redoStroke]);
        }
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

    // Change the pen size and slider display
    changeSize($event) {
        // Need to convert HTMLELement into an InputElement to access value
        var size = +(<HTMLInputElement>event.target).value; // +: string to num
        switch(size) {
            case 1:
                currentPenSize = 2;
                break;
            case 2:
                currentPenSize= 8;
                break;
            case 3:
                currentPenSize = 15;
                break;
            case 4:
                currentPenSize = 30;
                break;
            case 5:
                currentPenSize = 45;
                break;
            case 6:
                currentPenSize = 60;
                break;
            default:
                currentPenSize = 8;
        }
        // Change the slider display
        document.getElementById("pen-slider-value").innerHTML = ""+size; // num to string
    }

    // Start drawing a stroke
    mouseDown(event: MouseEvent): void {
        //if draw
        if(draw) {
            console.log("In mouse down, should be drawing");
            // Discard stored undos
            orphanedStrokes.splice(orphanedStrokes.length - orphanUndoCount, orphanUndoCount);
            if(undoIDs.length) {
                //TODO: remove the stroke from stroke array?
                undoIDs = [];
            }

            // Get the cursor's current position
            x = event.x - canvas.offsetLeft;
            y = event.y - canvas.offsetTop;

            // Add the stroke's pixels and tool settings
            curStroke = new Stroke(new Array<Position>(), currentPaintColor, currentPenSize, mode, true);
            // Get the first pixel in the new stroke
            curStroke.pos.push(new Position(x,y));
            drag = true;
            this.draw(curStroke);
        }
        //if panning
        else {
            console.log('In mouse down, should be panning');
            originalPosition.x = event.x - canvas.offsetLeft;
            originalPosition.y = event.y - canvas.offsetTop;
            drag = true;
        }
    }

    // Stop drawing, request a strokeID, and buffer this latest stroke until we get an ID
    mouseUp(event: MouseEvent): void {
        drag = false;
        originalPosition.x = 0;
        originalPosition.y = 0;
        this.drawService.reqStrokeID(this.id);
        // Highly unlikely to get an ID immediately, so just send the stroke to a buffer
        orphanedStrokes.push(curStroke);
    }

    // Continue updating and drawing the current stroke
    mouseMove(event: MouseEvent): void {
        if (drag == true && draw) {
            console.log("mouse should be drawing and moving");
            var x = event.x - canvas.offsetLeft;
            var y = event.y - canvas.offsetTop;
            curStroke.pos.push(new Position(x,y));
            this.draw(curStroke);
            //TODO: if sendStroke here, will it cause others to see drawing in real time?
        }
        else if (drag && !draw) {
                console.log("I'm in mouse move");
                var offsetX = event.x - canvas.offsetLeft;
                var offsetY = event.y - canvas.offsetTop;
                var totalOffsetX = originalPosition.x - offsetX;
                var totalOffsetY = originalPosition.y - offsetY;
                context.translate(totalOffsetX, totalOffsetY);
                this.drawAll();
        }
        // else {
        //     console.log("I'm in mouse move");
        //     var offsetX = event.x - canvas.offsetLeft;
        //     var offsetY = event.y - canvas.offsetTop;
        //     var totalOffsetX = originalPosition.x - offsetX;
        //     var totalOffsetY = originalPosition.y - offsetY;
        //     context.translate(totalOffsetX, totalOffsetY);
        //     this.drawAll();
        // }
    }

    // Mouse is outside the canvas
    mouseLeave(event: MouseEvent): void {
        drag = false;
    }
    zoomIn() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.scale(2,2);
        this.drawAll();
    }
    zoomOut() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.scale(0.5,0.5);
        this.drawAll();
    }
    setPan() {
        draw = false;
    }
}

// Global canvas data
var canvas: HTMLCanvasElement;
var context; // Contains a reference to the canvas element
var canvasHeight;
var canvasWidth;
var currentPaintColor = "black";
var currentPenSize = 8;
var x;
var y;
var mode = "source-over"; // Default drawing mode set to pen (instead of eraser)
var draw = true;
var originalPosition: Position = new Position(0,0);
var movedPosition: Position = new Position(0,0);;

// Global stroke data
var strokes = new Array<Stroke>();      // Contains every stroke on the canvas
var orphanedStrokes = new Array<Stroke>(); // Contains every stroke that needs an ID from the server
var myIDs= new Array<number>();    // IDs of strokes drawn by user
var undoIDs = new Array<number>();  // Contains every stroke that was undid and won't be drawn
var drag = false; // True if we should be drawing to the canvas (after a mouse down)
var curStroke; // The current stroke being drawn
var orphanUndoCount = 0; //a count to figure out how many undos in the orphanedStrokes we've done
