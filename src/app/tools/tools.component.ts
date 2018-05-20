import { Component, OnInit, AfterViewInit, EventEmitter, Output, Input } from '@angular/core';
import { environment } from '../../environments/environment';
import { DrawService } from '../draw.service';

@Component({
    selector: 'app-tools',
    templateUrl: './tools.component.html',
    styleUrls: ['./tools.component.css']
})

export class ToolsComponent implements OnInit {
    mode: string;   // Determines whether pen or eraser is used
    color: string;  // Pen color
    size: number;   // Pen/Eraser size
    allColors: string[]; // List of all available colors
    curActives: HTMLElement[];
    @Input() roomID: string
    @Output() setDraw = new EventEmitter<boolean>(); // Update CanvasComponent's draw
    @Output() callUndo = new EventEmitter();
    @Output() callRedo = new EventEmitter();
    @Output() callClear = new EventEmitter();
    @Output() callZoom = new EventEmitter<number>();
    @Input() scaleValue: number; // Get reference to CanvasComponent's scaleValue
    constructor(private drawService: DrawService) {
        this.mode = environment.PEN_MODE;
        this.color = "black";
        this.size = 8;
        this.allColors = ['black', 'red', 'orange', 'yellow', 'green', 'blue', 'darkMagenta'];
    }

    ngOnInit() {
    }

    ngAfterViewInit() {
        this.curActives = new Array<HTMLElement>(document.getElementById("pen"));

        // Set slider display and pen size to the default slider value
        var slider = <HTMLInputElement>document.getElementById("pen-size-slider");
        var display = document.getElementById("pen-slider-value");
        display.innerHTML = slider.value;
        this.size = +slider.value * 4;
    }

    // When the user clicks on a dropdown button, toggle its contents and highlight
    toggleDropdown(event, tool: string) {
         // Don't activate the window.click callback which closes the dropdown
        if (event.stopPropagation) {
            event.stopPropagation();
        }
        else if(window.event) {
            window.event.cancelBubble=true;
       }

       // Don't close menu if the background of the menu was clicked
       if (event.target.classList.contains("dropdown-menu") ||
           (event.target.classList.contains("slider-value"))) {
           return;
       }

       // Show/hide the tool's dropdown and highlight/unhighlight its button
        var classes = document.getElementById(tool).classList;
        classes.toggle("show");
        classes.toggle("active");

        // Close the other dropdown menu if it is open
        if (tool === "colors")
            var otherTool = "sizes";
        else
            var otherTool = "colors";

        classes = document.getElementById(otherTool).classList;
        if (classes[classes.length-1] === "show" || classes[classes.length-1] === "active") {
            classes.toggle("show");
            classes.toggle("active");
        }
    }

    // Select and highlight pen, eraser, or pan
    // - draw=true if pen or eraser are selected
    // - mode set to pen (instead of eraser) by default
    selectTool(draw: boolean, mode: string=this.mode) {
        this.setDraw.emit(draw);
        this.mode = mode;

        // Switch the highlight on the button from the old tool to the new tool
        if (draw && mode === environment.PEN_MODE) {
            var tool = "pen"
        }
        else if (draw && mode === environment.ERASER_MODE) {
            var tool = "eraser"
        }
        else if (!draw) {
            var tool = "pan"
        }
        this.curActives[0].classList.toggle("active");
        this.curActives[0] = document.getElementById(tool);
        this.curActives[0].classList.toggle("active");
    }

    // Change the pen color and automatically select the pen tool
    changeColor(color: string) {
        this.color = color;
        this.drawService.changeColor(this.roomID, color);
        this.selectTool(true, environment.PEN_MODE);
    }

    // Change the pen size and slider display and automatically select current drawing tool
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
        this.selectTool(true, this.mode);
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
        if(this.scaleValue * amount > 11 || this.scaleValue * amount < .09)
            return;

        this.callZoom.emit(amount);
        // Update displayed zoom amount
        document.getElementById("zoom-amount").innerHTML = ""+Math.round(100 * this.scaleValue * amount) + "%";
    }
}
