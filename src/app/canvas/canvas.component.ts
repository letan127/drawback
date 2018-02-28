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
            if(orphanUndoCount >= orphanedStrokes.length)
                orphanUndoCount = orphanedStrokes.length;
            // Determine which stack to add the strokeID to
            if (!orphanedStrokes[0].draw) {
                undoStrokes.unshift(strokeID);
            }
            else
                myStrokes.push(strokeID);
            strokes[strokeID] = orphanedStrokes.shift();
            this.drawService.sendStroke(strokes[strokeID], strokeID, this.id);
        })

        // When the server sends a clear event, clear the canvas, and reset values
        this.drawService.getClear().subscribe(() => {
            context.clearRect(0, 0, canvasWidth, canvasHeight);
            strokes = [];
            myStrokes = [];
            undoStrokes = [];
            orphanedStrokes = [];
            orphanUndoCount = 0;
        })

        this.drawService.getUndo().subscribe(strokeID => {
            strokes[strokeID].draw = false;
            this.drawAll();
        })

        this.drawService.getRedo().subscribe(strokeID => {
            strokes[strokeID].draw = true;
            this.drawAll();
        })

        this.drawService.newUser().subscribe(strokeArray => {
            strokes = strokeArray;
            this.drawAll();
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
    }

    // Removes everything from the canvas and sends a clear message to the server
    clear() {
        context.clearRect(0, 0, canvasWidth, canvasHeight);
        strokes = [];
        myStrokes = [];
        undoStrokes = [];
        orphanedStrokes = [];
        orphanUndoCount = 0;
        this.drawService.sendClear(this.id);
    }

    // Undoes the latest stroke
    undo() {
        // If there are orphaned strokes that can be undone, undo them first
        // if(orphanedStrokes.length && orphanUndoIndex > -1) {
        //     // If the orphanUndoIndex is set, just decrement it
        //     if(orphanUndoIndex)
        //         orphanUndoIndex--;
        //     else
        //         // This is the first time undoing, so set the orphanUndoIndex index
        //         orphanUndoIndex = orphanedStrokes.length - 1;
        //     orphanedStrokes[orphanUndoIndex].draw = false;
        // }
        if(orphanedStrokes.length && orphanedStrokes.length - orphanUndoCount > 0) {
            orphanedStrokes[orphanedStrokes.length - orphanUndoCount - 1].draw = false;
            orphanUndoCount++;
        }
        // Undo my strokes
        else {
            if(!myStrokes.length)
                return;
            undoStrokes.push(myStrokes.pop());
            this.drawService.sendUndo(this.id, undoStrokes[undoStrokes.length - 1]);
            strokes[undoStrokes[undoStrokes.length - 1]].draw = false;
            this.drawAll();
        }
    }

    // Redoes the latest undone stroke
    redo() {
        // If strokes with IDS can't be redone, check if orphaned strokes can
        if(!undoStrokes.length && orphanUndoCount) {
            orphanedStrokes[orphanedStrokes.length - orphanUndoCount].draw = true;
            orphanUndoCount--;
        }
        else {
            // Check if strokes with IDs can be undone
            if(!undoStrokes.length)
                return;
            var redoStroke = undoStrokes.pop();
            myStrokes.push(redoStroke);
            this.drawService.sendRedo(this.id, redoStroke);
            strokes[redoStroke].draw = true;
            this.draw(strokes[redoStroke]);
        }
    }

    // Set the pen color to the color of the background
    erase() {
        // toggle erase
        if (mode === "destination-out")
            mode = "source-over";
        else
            mode = "destination-out";
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
        // Discard stored undos
        orphanedStrokes.splice(orphanedStrokes.length - orphanUndoCount, orphanUndoCount);
        if(undoStrokes.length) {
            //TODO: remove the stroke from stroke array?
            undoStrokes = [];
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
        //TODO: if sendStroke here, will it cause others to see drawing in real time?
    }

    // Stop drawing, request a strokeID, and buffer this latest stroke until we get an ID
    mouseUp(event: MouseEvent): void {
        drag = false;
        this.drawService.reqStrokeID(this.id);
        // Highly unlikely to get an ID immediately, so just send the stroke to a buffer
        orphanedStrokes.push(curStroke);
    }

    // Continue updating and drawing the current stroke
    mouseMove(event: MouseEvent): void {
        if (drag == true) {
            var x = event.x - canvas.offsetLeft;
            var y = event.y - canvas.offsetTop;
            curStroke.pos.push(new Position(x,y));
            this.draw(curStroke);
            //TODO: if sendStroke here, will it cause others to see drawing in real time?
        }
    }

    // Mouse is outside the canvas
    mouseLeave(event: MouseEvent): void {
        drag = false;
    }
}

// Global canvas data
var canvas: HTMLCanvasElement;
var context; // Contains a reference to the canvas element
var canvasHeight = 500;
var canvasWidth = 1000;
var currentPaintColor = "black";
var currentPenSize = 8;
var x;
var y;
var mode = "source-over"; // Default drawing mode set to pen (instead of eraser)

// Global stroke data
var strokes = new Array<Stroke>();      // Contains every stroke on the canvas
var orphanedStrokes = new Array<Stroke>(); // Contains every stroke that needs an ID from the server
var myStrokes = new Array<number>();    // IDs of strokes drawn by user
var undoStrokes = new Array<number>();  // Contains every stroke that was undid and won't be drawn
var drag = false; // True if we should be drawing to the canvas (after a mouse down)
var curStroke; // The current stroke being drawn
var orphanUndoCount = 0;
