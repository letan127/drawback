import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { AppComponent } from './app.component';
import { DropDownDirective } from './shared/dropdown.directive';
import { HoverClassDirective } from './shared/hover-class.directive';


@NgModule({
  declarations: [
    AppComponent,
    DropDownDirective,
    HoverClassDirective
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
