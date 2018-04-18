import { Component, OnInit, AfterViewInit, Input, Output, EventEmitter } from '@angular/core';
import { DOCUMENT } from '@angular/platform-browser';
import { Inject } from '@angular/core';

@Component({
    selector: 'app-invite',
    templateUrl: './invite.component.html',
    styleUrls: ['./invite.component.css']
})
export class InviteComponent implements OnInit {
    modal: HTMLElement;         // Popup element appears when share button clicked
    room: HTMLInputElement;     // Displays the current room's URL
    newRoom: HTMLInputElement;  // Allows users to enter a 5-character room ID
    moveButton: HTMLElement;    // Click to move to a new room
    errorMsg: string;   // Appears if inputted new room ID is invalid
    copyMsg: string;    // Tells user whether they've copied the room URL
    url: string;        // Generic URL of the page without the room ID

    @Input() roomID: string;
    @Output() checkRoom = new EventEmitter<string>();

    constructor(@Inject(DOCUMENT) private document: Document) {
        this.errorMsg = '';
        this.copyMsg = 'Copy URL';
        this.url = this.document.location.href; // Get full URL from this page
    }

    ngOnInit() {
        // Get the generic URL without the room ID
        var idIndex = this.url.indexOf("/rooms");
        this.url = this.url.slice(0, idIndex);
    }

    ngAfterViewInit() {
        this.modal = document.getElementById("share-modal");
        this.room = <HTMLInputElement>document.getElementById("room-url");
        this.newRoom = <HTMLInputElement>document.getElementById("new-room-id");
        this.moveButton = document.createElement("a");

        this.newRoom.addEventListener("keypress", (event) => {
            if (event.keyCode == 13)
                this.submitRoom();
        });
    }

    // Show the share modal and reset the copy button
    showShareModal() {
        // Don't activate the window.click callback which closes the modal
       if (event.stopPropagation) {
           event.stopPropagation();
       }
       else if(window.event) {
           window.event.cancelBubble=true;
      }

        this.copyMsg = "Copy URL";
        this.newRoom.focus();
        this.modal.style.display = "block"; // Show modal
    }

    closeShareModal() {
        this.modal.style.display = "none";
    }

    // Copy the room's URL to clipboard
    copyURL() {
        this.room.select();
        document.execCommand("Copy");
        this.copyMsg = "Copied!";
    }

    // Check for incorrect room IDs
    submitRoom() {
        if (this.newRoom.value.length < 5) {
            this.errorMsg = "ID must have 5 characters. Please try again.";
        }
        else if (this.newRoom.value === this.roomID) {
            this.errorMsg = "Already in this room. Please try again.";
        }
        else {
            // Check if the room exists
            this.checkRoom.emit(this.newRoom.value);
        }
    }

    // Move to the new room
    changeRoom(valid: boolean) {
        if (valid) {
            this.moveButton.setAttribute("href", this.url + "/rooms/" + this.newRoom.value);
            this.moveButton.click();
        }
        else
            this.errorMsg = "This room does not exist. Please try again.";
    }

    // Remove error message for changing rooms when user retypes id
    resetError() {
        this.errorMsg = '';
    }
}
