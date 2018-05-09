import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { Stroke } from '../stroke';
import { Position } from '../position';
import { ToolsComponent } from '../tools/tools.component';
import { TitleComponent } from '../title/title.component';
import { InviteComponent } from '../invite/invite.component';
import { DrawService } from '../draw.service';
import { ActivatedRoute, Router } from '@angular/router';

import { AngularFireAuth } from 'angularfire2/auth';

import * as io from 'socket.io-client';

@Component({
    selector: 'app-canvas',
    templateUrl: './canvas.component.html',
    styleUrls: ['./canvas.component.css']
})

export class CanvasComponent implements OnInit {
    // Canvas/Room metadata
    id: string;
    numUsers: number;
    loginState: boolean;
    loginButton: string;

    // Reference to the child component nested used in the HTML
    @ViewChild(ToolsComponent) private tool: ToolsComponent;
    @ViewChild(TitleComponent) private title: TitleComponent;
    @ViewChild(InviteComponent) private invitation: InviteComponent;

    // Canvas data
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    canDraw: boolean;       // Changes appear on canvas; only false when panning
    drag: boolean;          // True if we should be drawing to canvas
    scaleValue: number;     // Zoom multiplier
    offset: Position;       // Offset relative to current origin
    drawPosition: Position; // Draw position relative to original origin
    previousPosition: Position;

    // Stroke data
    strokes: Stroke[];          // Every stroke on the canvas
    orphanedStrokes: Stroke[];  // Strokes waiting for an ID from the server      // Current stroke being drawn
    myIDs: number[];            // IDs of strokes drawn by this user
    undoIDs: number[];          // IDs of strokes that were undone and won't be drawn
    orphanUndoCount: number;    // Number of strokes that were undone and need an ID
    liveStrokes = {};
    doneStrokes = {}
    socketID: string;

    // Touch data
    prevFingerPosition: TouchList;  // Positions of the fingers during the previous movement
    prevFingerDistance: number;     // Distance between two fingers during previous movement
    curFingerDistance: number;      // Current distance between two fingers
    touchNotDrawn: boolean;         // True if not drawing with touches (2+ fingers, 1 finger move, or 1 finger tap)

    constructor(private drawService: DrawService, private route: ActivatedRoute, private router: Router, public af: AngularFireAuth) {
        this.id = '';
        this.numUsers = 1;
        this.loginState = true;
        this.loginButton = "Sign Up or Login";

        this.canDraw = true;
        this.previousPosition = new Position(0,0);
        this.offset = new Position(0,0);
        this.scaleValue = 1;
        this.drawPosition = new Position(0,0);

        this.strokes = new Array<Stroke>();
        this.orphanedStrokes = new Array<Stroke>();
        this.myIDs= new Array<number>();
        this.undoIDs = new Array<number>();
        this.drag = false;
        this.orphanUndoCount = 0;

        this.prevFingerDistance = 0;
        this.curFingerDistance = 0;
        this.touchNotDrawn = false;
    }

    ngOnInit(): void {
        this.drawService.setSocket(io('http://localhost:4000'));
        this.af.authState.subscribe(authState => {
            if(!authState) {
                this.loginButton = "Sign Up or Login"
                this.loginState = true;
            }
            else{
                this.loginButton = "Logout";
                this.loginState = false;
            }
        });

        // Get the room number/id from the URL
        this.route.params.subscribe(params => {
            this.id = params['id'];
        })

        // Send the room ID to the server
        this.drawService.sendRoom(this.id);

        // This client is a new user; give them the current canvas state to draw
        this.drawService.initUser().subscribe(init => {
            this.title.rename(init.name);
            this.numUsers = init.numUsers;
            this.strokes = init.strokes;
            this.liveStrokes = init.liveStrokes;
            this.socketID = init.socketID;
            this.focus(init.pictureSize);
            this.liveStrokes[this.socketID] = new Stroke(new Array<Position>(), this.tool.color, this.tool.size/this.scaleValue, this.tool.mode, true);
            this.updateUserCount();
            this.drawAll();
        })

        // New user entered a room, so increment our user count
        this.drawService.updateUserCount().subscribe(amount => {
            this.numUsers += amount;
            this.updateUserCount();
        })

        // Update canvas title
        this.drawService.getTitle().subscribe(title => {
            this.title.rename(title);
        })

        // When the server sends a stroke, add it to our list of strokes and draw it
        this.drawService.getStroke().subscribe(message => {
            this.strokes[message.strokeID] = this.liveStrokes[message.userID];
            this.liveStrokes[message.userID].liveStroke = false;
        })

        // When the server sends a strokeID, give it to the earliest orphaned stroke
        // and send the stroke to everyone else
        this.drawService.getStrokeID().subscribe(strokeID => {
            if(!this.orphanedStrokes.length)
                return;
            // Determine which stack to add the strokeID to
            if (!this.orphanedStrokes[0].draw) {
                this.undoIDs.unshift(strokeID);
            }
            else
                this.myIDs.push(strokeID);
            this.strokes[strokeID] = this.orphanedStrokes.shift();
            this.drawService.sendStroke(strokeID, this.id);
        })

        // When the server sends a clear event, clear the canvas, and reset values
        this.drawService.getClear().subscribe(() => {
            this.context.clearRect(-this.canvas.width*25, -this.canvas.height*25, this.canvas.width*100, this.canvas.height*100);
            this.strokes = [];
            this.myIDs = [];
            this.undoIDs = [];
            this.orphanedStrokes = [];
            this.orphanUndoCount = 0;
            for(var key in this.liveStrokes) {
                this.liveStrokes[key].pos = [];
            }
            this.title.updateSubtitle("Canvas has been cleared.");
        })

        // Received another client's undo; don't draw that stroke
        this.drawService.getUndo().subscribe(strokeID => {
            this.strokes[strokeID].draw = false;
            this.drawAll();
        })

        // Received another client's redo; draw that stroke
        this.drawService.getRedo().subscribe(strokeID => {
            this.strokes[strokeID].draw = true;
            this.drawAll();
        })

        // Move to the requested room if it exists; otherwise show an error message
        this.drawService.getRoomCheck().subscribe(hasRoom => {
            this.invitation.changeRoom(hasRoom);
        })

        this.drawService.getNewLiveStroke().subscribe(strokeAndID => {
            this.liveStrokes[strokeAndID.id] = strokeAndID.stroke;
            if(!strokeAndID.stroke.draw)
                return;

            // Draw the first pixel in the stroke
            this.prepareCanvas(strokeAndID.stroke);
            this.drawFirstPoint(strokeAndID.stroke.pos[0]);
        })
        this.drawService.getNewPixel().subscribe(pixelAndID => {
            //get the pixel and add it to the liveStroke of the other user
            this.drawPixel(pixelAndID.pixel,pixelAndID.id)

        })
    }

    ngAfterViewInit() {
        // Set callback functions for canvas mouse events
        this.canvas = <HTMLCanvasElement>document.getElementById("canvas");
        this.context = this.canvas.getContext("2d");
        window.addEventListener("resize", this.resize.bind(this), false);
        window.addEventListener("click", this.closeMenus.bind(this));
        window.addEventListener("keypress", this.closeMenus.bind(this));

        // Canvas mouse events
        this.canvas.addEventListener("mousedown",  this.mouseDown.bind(this), false);
        this.canvas.addEventListener("mousemove", this.mouseMove.bind(this), false);
        this.canvas.addEventListener("mouseleave", this.mouseLeave.bind(this), false);
        this.canvas.addEventListener("mouseup",  this.mouseUp.bind(this), false);
        this.canvas.addEventListener("wheel",  this.mouseWheel.bind(this), false);

        // Mobile events
        this.canvas.addEventListener("touchstart", this.touchstart.bind(this), false);
        this.canvas.addEventListener("touchmove", this.touchmove.bind(this), false);
        this.canvas.addEventListener("touchend", this.touchend.bind(this), false);
        this.canvas.addEventListener("touchcancel", this.touchcancel.bind(this), false);

        this.resize();

        // Set the displayed user count
        this.updateUserCount();
    }

    // When the window is resized, reset the canvas size and redraw it
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.canvas.width = this.canvas.width;
        this.canvas.height = this.canvas.height;
        this.context.setTransform(this.scaleValue, 0, 0, this.scaleValue, -(this.scaleValue - 1) * this.canvas.width/2, -(this.scaleValue - 1) * this.canvas.height/2);
        this.context.translate(this.offset.x, this.offset.y)
        this.drawPosition.x = -(this.scaleValue - 1) * (this.canvas.width/2);
        this.drawPosition.y = -(this.scaleValue - 1) * (this.canvas.height/2);
        this.drawAll()
    }

    focus(pictureSize) {
        //no need to translate if nothing has been drawn
        var scaling = 1
        if (pictureSize.focusX == 0 && pictureSize.focusY == 0) {
            return
        }
        this.offset.add(-pictureSize.focusX + this.canvas.width/2, -pictureSize.focusY + this.canvas.height/2);
        this.context.translate(-pictureSize.focusX + this.canvas.width/2, -pictureSize.focusY + this.canvas.height/2);
        if (pictureSize.pictureWidth > this.canvas.width && pictureSize.pictureHeight > this.canvas.height) {
            while((pictureSize.pictureHeight * scaling  > this.canvas.height || pictureSize.pictureWidth * scaling  > this.canvas.width) && scaling > .03 ) {
                scaling = scaling * .66;
            }
            if (scaling < .03) {
                scaling = .03;
            }
            this.tool.zoom(scaling)
        }
    }

    // Close and unhighlight any open menus when clicking outside of it or pressing escape
    closeMenus(event) {
        // Close dropdown menus
        var openToolMenu = document.getElementsByClassName("show");
        if (openToolMenu.length > 0 || (openToolMenu.length > 0 && event.key == "Escape")) {
            openToolMenu[0].classList.toggle("active");
            openToolMenu[0].classList.toggle("show");
        }

        // Close share modal
        if (event.target.classList.contains("modal") || event.key == "Escape")
            this.invitation.closeShareModal();
    }

    // When a new user enters the room, update the displayed user count
    updateUserCount() {
        document.getElementById("num-users-text").innerHTML = ""+this.numUsers;
    }

    // Show menu for mobile screens
    showMenu() {
        document.getElementById("hamburger-dropdown").classList.toggle("mobile-show");
    }

    // Sets draw to true or false depending on whether pen or pan was clicked
    setDraw(value: boolean) {
        this.canDraw = value;
    }

    // Copy the stroke's settings to the canvas before drawing
    prepareCanvas(stroke: Stroke) {
        this.context.strokeStyle = stroke.color;
        this.context.lineWidth = stroke.size;
        this.context.globalCompositeOperation = stroke.mode;
        this.context.lineJoin = "round";
    }

    // Draw the first point of a stroke
    drawFirstPoint(point: Position) {
        this.context.beginPath();
        this.context.moveTo(point.x-1, point.y);
        this.context.lineTo(point.x, point.y);
        this.context.closePath();
        this.context.stroke();
    }

    // Draw a line connect the previous point and current point
    drawNextPoint(points: Position[], prev) {
        this.context.beginPath();
        this.context.moveTo(points[prev].x, points[prev].y);
        this.context.lineTo(points[prev+1].x, points[prev+1].y);
        this.context.closePath();
        this.context.stroke();
    }

    // Draws a single stroke that is passed in as an argument
    draw(stroke) {
        if(!stroke.draw || stroke.pos.length == 0)
            return;

        // Draw the first pixel in the stroke
        this.prepareCanvas(stroke);
        this.drawFirstPoint(stroke.pos[0]);

        // Draw the rest of the pixels in the stroke
        for (var j = 0; j < stroke.pos.length - 1; j++) {
            this.drawNextPoint(stroke.pos, j);
        }
    }

    // Draw a pixel and add it to the current stroke
    drawPixel(pixel, socketID) {
        this.liveStrokes[socketID].pos.push(pixel);
        this.prepareCanvas(this.liveStrokes[socketID]);

        if (this.liveStrokes[socketID].pos.length < 2) {
            // Canvas was cleared while drawing; start drawing a new stroke
            this.drawFirstPoint(this.liveStrokes[socketID].pos[0]);
        }
        else {
            // Continue drawing the current stroke
            this.drawNextPoint(this.liveStrokes[socketID].pos, this.liveStrokes[socketID].pos.length-2);
        }
    }


    // Clears the canvas and redraws every stroke in our list of strokes
    drawAll() {
        // Clear the canvas and also offscreen
        this.context.clearRect(-this.canvas.width*25, -this.canvas.height*25, this.canvas.width*100, this.canvas.height*100);
        // Draw each stroke/path from our list of pixel data
        for (var i = 0; i < this.strokes.length; i++) {
            if (this.strokes[i])
                this.draw(this.strokes[i]);
        }

        //draw all current liveStrokes
        for (var key in this.liveStrokes) {
            if (this.liveStrokes[key].liveStroke)
                this.draw(this.liveStrokes[key]);
        }

        // Draw local orphan strokes
        for (var j = 0; j < this.orphanedStrokes.length; j++) {
            if (this.orphanedStrokes[j])
                this.draw(this.orphanedStrokes[j]);
        }
    }


    // Removes everything from the canvas and sends a clear message to the server
    clear() {
        this.drawService.sendClear(this.id);
        this.title.updateSubtitle("Canvas has been cleared.");
    }

    // Undoes the latest stroke
    undo() {
        // If there are orphaned strokes that can be undone, undo them first
        if(this.orphanedStrokes.length && this.orphanedStrokes.length - this.orphanUndoCount > 0) {
            this.orphanedStrokes[this.orphanedStrokes.length - this.orphanUndoCount - 1].draw = false;
            this.orphanUndoCount++;
        }
        // Undo my strokes
        else {
            if(!this.myIDs.length)
                return;
            this.undoIDs.push(this.myIDs.pop());
            this.drawService.sendUndo(this.id, this.undoIDs[this.undoIDs.length - 1]);
            this.strokes[this.undoIDs[this.undoIDs.length - 1]].draw = false;
            this.drawAll();
        }
    }

    // Redoes the latest undone stroke
    redo() {
        // If strokes with IDS can't be redone, check if orphaned strokes can
        if(!this.undoIDs.length && this.orphanUndoCount) {
            this.orphanedStrokes[this.orphanedStrokes.length - this.orphanUndoCount].draw = true;
            this.orphanUndoCount--;
        }
        else {
            // Check if strokes with IDs can be undone
            if(!this.undoIDs.length)
                return;
            var redoStroke = this.undoIDs.pop();
            this.myIDs.push(redoStroke);
            this.drawService.sendRedo(this.id, redoStroke);
            this.strokes[redoStroke].draw = true;
            this.drawAll();
        }
    }

    authentication(){
        if(this.loginState){
            this.router.navigate(['../login/' + this.id]);
        }
        else if (!this.loginState){
            this.af.auth.signOut();
            console.log('logged out');
        }
    }

    zoom(amount: number) {
        this.scaleValue *= amount;
        //https://stackoverflow.com/questions/35123274/apply-zoom-in-center-of-the-canvas in order to transform to center
        this.context.setTransform(this.scaleValue, 0, 0, this.scaleValue, -(this.scaleValue - 1) * this.canvas.width/2, -(this.scaleValue - 1) * this.canvas.height/2);
        this.context.translate(this.offset.x, this.offset.y)
        this.drawPosition.x = -(this.scaleValue - 1) * (this.canvas.width/2);
        this.drawPosition.y = -(this.scaleValue - 1) * (this.canvas.height/2);
        this.drawAll();
    }

    // Start drawing a stroke
    mouseDown(event: MouseEvent): void {
        if(this.canDraw) {
            // Discard stored undos
            this.orphanedStrokes.splice(this.orphanedStrokes.length - this.orphanUndoCount, this.orphanUndoCount);
            if(this.undoIDs.length) {
                //TODO: remove the stroke from stroke array?
                this.undoIDs = [];
            }

            // Get the cursor's current position
            var x = ((event.x - this.canvas.offsetLeft - this.drawPosition.x)/this.scaleValue) - this.offset.x;
            var y = ((event.y - this.canvas.offsetTop - this.drawPosition.y)/this.scaleValue) - this.offset.y;
            // Add the stroke's pixels and tool settings
            this.liveStrokes[this.socketID] = new Stroke(new Array<Position>(), this.tool.color, this.tool.size/this.scaleValue, this.tool.mode, true);
            this.drawPixel(new Position(x,y), this.socketID);
            this.drag = true;
            this.drawService.sendNewLiveStroke(this.liveStrokes[this.socketID], this.id);
        }
        else {
            // Panning
            this.previousPosition.x = event.x - this.canvas.offsetLeft;
            this.previousPosition.y = event.y - this.canvas.offsetTop;
            this.drag = true;
        }
    }

    // Stop drawing, request a strokeID, and buffer this latest stroke until we get an ID
    mouseUp(event: MouseEvent): void {
        this.drag = false;
        if (this.canDraw) {
            this.orphanedStrokes.push(this.liveStrokes[this.socketID]);
            this.liveStrokes[this.socketID].liveStroke = false;
            this.drawService.reqStrokeID(this.id);
        }
    }

    // Continue updating and drawing the current stroke
    mouseMove(event: MouseEvent): void {
        if (this.drag && this.canDraw) {
            var x = ((event.x - this.canvas.offsetLeft - this.drawPosition.x)/this.scaleValue) - this.offset.x;
            var y = ((event.y - this.canvas.offsetTop - this.drawPosition.y)/this.scaleValue) - this.offset.y;
            this.drawPixel(new Position(x,y), this.socketID);
            this.drawService.sendPixel(new Position(x,y), this.id);
        }
        else if (this.drag && !this.canDraw) {
            // Translate the this.context by how much is moved
            var currentPosition = new Position(event.x - this.canvas.offsetLeft, event.y - this.canvas.offsetTop);
            var changePosition  = new Position(this.previousPosition.x - currentPosition.x, this.previousPosition.y - currentPosition.y);
            this.previousPosition = currentPosition;
            this.offset.add(changePosition);
            this.context.translate(changePosition.x, changePosition.y);
            this.drawAll();
        }
    }

    // Mouse is outside the canvas
    mouseLeave(event: MouseEvent): void {
        this.drag = false;
        // TODO: Need to check if stroke has been drawn before mouseLeave
        //if (this.canDraw) {
        //    this.drawService.reqStrokeID(this.id);
        //    this.orphanedStrokes.push(this.curStroke);
        //}
    }

    // Scroll to zoom
    mouseWheel(event): void {
        // https://stackoverflow.com/questions/6775168/zooming-with-canvas
        var mousex = event.clientX - this.canvas.offsetLeft;
        var mousey = event.clientY - this.canvas.offsetTop;
        var wheel = event.wheelDelta/120;//n or -n
        var scaleAmount = 1 + wheel/2;
        this.tool.zoom(scaleAmount);
    }

    // Gets the diagonal distance between two fingers
    findDistance(fingers): number {
        var fingerDiffX = fingers[0].clientX - fingers[1].clientX;
        var fingerDiffY = fingers[0].clientY - fingers[1].clientY;
        return Math.hypot(fingerDiffX, fingerDiffY);
    }

    createMouseEvent(type: string, x: number, y: number): MouseEvent {
        return new MouseEvent(type, {
            clientX: x,
            clientY: y
        });
    }

    // Checks whether one or two finger is being used; does not draw the
    // first point until touchmove to prevent drawing when using 2 fingers
    touchstart(event: TouchEvent): void {
        this.prevFingerPosition = event.touches;
        if (this.touchNotDrawn) {
            // Second finger touched the screen
            event.preventDefault();
            var touch = event.touches[0];
            var mouseEvent = this.createMouseEvent("mousedown", touch.clientX, touch.clientY);

            // Use two or more fingers to pan or zoom
            if (event.touches.length > 1) {
                this.canDraw = false;
                this.prevFingerDistance = this.findDistance(event.touches);
            }
            this.canvas.dispatchEvent(mouseEvent);
        }
        else {
            // First time touching the screen; wait to check for second finger
            this.touchNotDrawn = true;
        }
    }

    touchmove(event: TouchEvent): void {
        event.preventDefault();
        var touch = event.touches[0];
        var mouseEvent = this.createMouseEvent("mousemove", touch.clientX, touch.clientY);

        // Draw the first point since user is defintely not using 2 fingers
        if (this.touchNotDrawn && event.touches.length === 1) {
            this.canDraw = true;
            var prevMouseEvent = this.createMouseEvent("mousedown", this.prevFingerPosition[0].clientX, this.prevFingerPosition[0].clientY);
            this.canvas.dispatchEvent(prevMouseEvent);
            this.touchNotDrawn = false; // Ensures first point is only drawn once
        }

        // Actions change depending on the number of fingers:
        // - 1: Draw
        // - 2: Pinch to zoom or pan
        // - 3+: Pan
        if (event.touches.length == 1) {
            // Draw with one finger
            this.canvas.dispatchEvent(mouseEvent);
        }
        else if (event.touches.length == 2) {
            // Get the distances between the current fingers
            this.curFingerDistance = this.findDistance(event.touches);
            var fingerDelta = this.curFingerDistance - this.prevFingerDistance;
            this.prevFingerDistance = this.curFingerDistance;

            // Get the direction that each finger moved
            var deltaX1 = event.touches[0].clientX - this.prevFingerPosition[0].clientX;
            var deltaY1 = event.touches[0].clientY - this.prevFingerPosition[0].clientY;
            var deltaX2 = event.touches[1].clientX - this.prevFingerPosition[1].clientX;
            var deltaY2 = event.touches[1].clientY - this.prevFingerPosition[1].clientY;
            this.prevFingerPosition = event.touches;

            if (deltaX1 * deltaX2 <= 0 || deltaY1 * deltaY2 <= 0) {
                // Detect pinch to zoom when fingers move in opposite directions
                this.tool.zoom(1 + fingerDelta/100);
            }
            else {
                // Pan with two fingers
                this.canvas.dispatchEvent(mouseEvent);
            }
        }
        else {
            // Pan with 3+ fingers
            this.canvas.dispatchEvent(mouseEvent);
        }
    }

    touchend(event: TouchEvent): void {
        event.preventDefault();

        // Draw first point if fingers did not move
        if (this.touchNotDrawn) {
            var prevMouseEvent = this.createMouseEvent("mousedown", this.prevFingerPosition[0].clientX, this.prevFingerPosition[0].clientY);
            this.canvas.dispatchEvent(prevMouseEvent);
        }

        // Get the strokeID if a stroke was made (not zooming/panning)
        var mouseEvent = new MouseEvent("mouseup", {});
        this.canvas.dispatchEvent(mouseEvent);
        this.canDraw = true;
        this.touchNotDrawn = false;
    }

    touchcancel(event: TouchEvent): void {
        event.preventDefault();
        var mouseEvent = new MouseEvent("mouseLeave", {});
        this.canvas.dispatchEvent(mouseEvent);
    }
}
