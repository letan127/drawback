import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { HttpModule } from '@angular/http';
import { AppComponent } from './app.component';
import { DropDownDirective } from './shared/dropdown.directive';
import { HoverClassDirective } from './shared/hover-class.directive';
import { CanvasComponent } from './canvas/canvas.component';



@NgModule({
  declarations: [
    AppComponent,
    DropDownDirective,
    HoverClassDirective,
    CanvasComponent
  ],
  imports: [
    BrowserModule, HttpModule, FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent, CanvasComponent]
})
export class AppModule { }
