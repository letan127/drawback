import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { HttpModule } from '@angular/http';
import { AppComponent } from './app.component';
import { DropDownDirective } from './shared/dropdown.directive';
import { HoverClassDirective } from './shared/hover-class.directive';
import { CanvasComponent } from './canvas/canvas.component';
import { LoginComponent } from './login/login.component';
import { Routes, RouterModule } from '@angular/router';


const appRoutes: Routes = [
    {path: 'rooms/:id', component: CanvasComponent},
    {path: 'login', component: LoginComponent}
];


@NgModule({
    declarations: [
        AppComponent,
        DropDownDirective,
        HoverClassDirective,
        CanvasComponent,
        LoginComponent
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
