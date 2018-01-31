import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';
  constructor() {
  }
}
function mouseDown(event: MouseEvent): void {

}

window.onload = () => {
  var canvas = <HTMLCanvasElement>document.getElementById('jamboard');
  canvas.addEventListener("mousedown", mouseDown, false);
}
