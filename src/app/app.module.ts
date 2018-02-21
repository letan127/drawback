import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { HttpModule } from '@angular/http';
import { AppComponent } from './app.component';
import { DropDownDirective } from './shared/dropdown.directive';
import { HoverClassDirective } from './shared/hover-class.directive';
import { CanvasComponent } from './canvas/canvas.component';
import { Routes, RouterModule } from '@angular/router';


const appRoutes: Routes = [
    {path: '', redirectTo: '/draw/rooms/1', pathMatch: 'full'},
    {path: 'draw/rooms/:id', component: CanvasComponent},
];


@NgModule({
    declarations: [
        AppComponent,
        DropDownDirective,
        HoverClassDirective,
        CanvasComponent
    ],
    imports: [
        BrowserModule,
        HttpModule,
        FormsModule,
        RouterModule.forRoot(appRoutes)
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
