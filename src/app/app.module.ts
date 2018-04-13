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
import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { AngularFireAuthModule } from 'angularfire2/auth';

import { DrawService } from './draw.service';
import { ToolsComponent } from './tools/tools.component';
import { InviteComponent } from './invite/invite.component';

export const config = {
  apiKey: "AIzaSyBBIYSjhH5moXzFra9BUH-m_0denvu3HmE",
  authDomain: "peppy-coda-192823.firebaseapp.com",
  databaseURL: "https://peppy-coda-192823.firebaseio.com",
  projectId: "peppy-coda-192823",
  storageBucket: "peppy-coda-192823.appspot.com",
  messagingSenderId: "608993808317"
};

const appRoutes: Routes = [
    {path: 'rooms/:id', component: CanvasComponent},
    {path: 'login/:id', component: LoginComponent}
];


@NgModule({
    declarations: [
        AppComponent,
        DropDownDirective,
        HoverClassDirective,
        CanvasComponent,
        LoginComponent,
        ToolsComponent,
        InviteComponent
    ],
    imports: [
        BrowserModule,
        HttpModule,
        FormsModule,
        RouterModule.forRoot(appRoutes),
        AngularFireModule.initializeApp(config),
        AngularFireDatabaseModule,
        AngularFireAuthModule
    ],
    bootstrap: [AppComponent],
    providers: [DrawService]
})
export class AppModule { }
