import { Component, OnInit, AfterViewInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'app-title',
    templateUrl: './title.component.html',
    styleUrls: ['./title.component.css']
})
export class TitleComponent implements OnInit {
    name: HTMLInputElement;
    subtitle: HTMLElement;
    subtitleText: string

    @Input() roomID: string
    @Output() sendTitle = new EventEmitter<object>();

    constructor() {
        this.subtitleText = "Welcome to your canvas!"
    }

    ngOnInit() {
    }

    ngAfterViewInit() {
        // Click canvas name to highlight all the text
        this.name = <HTMLInputElement>document.getElementById("canvas-name");
        this.subtitle = document.getElementById("title-text");
        this.name.value = "Untitled Canvas";

        this.name.addEventListener("click", this.highlightText.bind(this));
        this.name.addEventListener("keypress", this.submitName.bind(this));

        this.fade();
    }

    highlightText() {
        this.name.select();
    }

    // Press enter to change the canvas' name and notify others in the room
    submitName(event: KeyboardEvent) {
        if (event.keyCode === 13) {
            this.updateSubtitle("Canvas renamed to " + this.name.value + ".");
            this.sendTitle.emit({
                roomID: this.roomID,
                name: this.name.value
            });
        }
    }

    rename(name: string) {
        this.name.value = name;
        this.updateSubtitle("Canvas renamed to " + this.name.value + ".");
    }

    updateSubtitle(text: string) {
        this.subtitleText = text;
        this.name.blur(); // Unfocus
        this.fade();
    }

    // Display the subtitle and then hide it after 3 seconds
    fade() {
        this.subtitle.style.opacity = "1";
        this.subtitle.style.visibility = "visible";
        setTimeout(() => {
            this.subtitle.style.opacity = "0";
            this.subtitle.style.visibility = "hidden";
        }, 6000);
    }
}
