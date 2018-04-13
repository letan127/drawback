import { Component, OnInit, AfterViewInit, EventEmitter, Output, Input } from '@angular/core';

@Component({
    selector: 'app-tools',
    templateUrl: './tools.component.html',
    styleUrls: ['./tools.component.css']
})
export class ToolsComponent implements OnInit {
    mode: string;   // Determines whether pen or eraser is used
    color: string;  // Pen color
    size: number;   // Pen/Eraser size
    @Output() setDraw = new EventEmitter<boolean>(); // Update CanvasComponent's draw
    @Output() callUndo = new EventEmitter();
    @Output() callRedo = new EventEmitter();
    @Output() callClear = new EventEmitter();
    @Output() callZoom = new EventEmitter<number>();
    @Input() scaleValue: number; // Get reference to CanvasComponent's scaleValue

    constructor() {
        this.mode = "source-over";
        this.color = "black";
        this.size = 8;
    }

    ngOnInit() {
    }

    ngAfterViewInit() {
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
        this.size = +slider.value * 4;
        this.fade();
    }

    fade() {
        //make it so text shows first
        document.getElementById('title-text').style.opacity = "1";
        document.getElementById('title-text').style.visibility = "visible";
        setTimeout(function() {
            document.getElementById('title-text').style.opacity = "0";
            document.getElementById('title-text').style.visibility = "hidden";
        }, 3000);
    }

    /* When the user clicks on the button, toggle between hiding and showing the dropdown content */
    showDropdown(tool: string) {
        document.getElementById(tool).classList.toggle("show");
    }

    // Selected pen, eraser, or pan
    // draw=true if pen or eraser are selected
    // mode set to pen (instead of eraser) by default
    selectTool(draw: boolean, mode: string="source-over") {
        this.setDraw.emit(draw);
        this.mode = mode;
    }

    // Change the pen color and notify the server
    changeColor(event) {
        if (event.target.tagName.toLowerCase() === "i")
            var color = event.currentTarget.id; // Get parent's ID
        else
            var color = event.target.id;

        switch(color) {
            case "black":
                this.color = "black";
                break;
            case "red":
                this.color = "red";
                break;
            case "orange":
                this.color = "orange";
                break;
            case "yellow":
                this.color = "yellow";
                break;
            case "green":
                this.color = "green";
                break;
            case "blue":
                this.color = "blue";
                break;
            case "darkMagenta":
                this.color = "darkMagenta";
                break;
            default:
                this.color = "black";
        }
    }

    // Change the pen size and slider display
    changeSize($event) {
        // Need to convert HTMLELement into an InputElement to access value
        var size = +(<HTMLInputElement>event.target).value; // +: string to num
        switch(size) {
            case 1:
                this.size = 2;
                break;
            case 2:
                this.size= 8;
                break;
            case 3:
                this.size = 15;
                break;
            case 4:
                this.size = 30;
                break;
            case 5:
                this.size = 45;
                break;
            case 6:
                this.size = 60;
                break;
            default:
                this.size = 8;
        }
        // Change the slider display
        document.getElementById("pen-slider-value").innerHTML = ""+size; // num to string
    }

    undo() {
        this.callUndo.next();
    }

    redo() {
        this.callRedo.next();
    }

    clear() {
        this.callClear.next();
    }

    zoom(amount: number) {
        if(this.scaleValue * amount > 11 || this.scaleValue * amount < .09) {
            return;
        }
        this.callZoom.emit(amount);
        // Update displayed zoom amount
        document.getElementById("zoom-amount").innerHTML = ""+Math.round(100 * this.scaleValue * amount) + "%";
    }
}
