import { Component, OnInit } from '@angular/core';
import { LoginService } from '../login.service';
import { AngularFireAuth } from 'angularfire2/auth';
import { Router } from '@angular/router';
import * as firebase from 'firebase/app';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  error: any;
  roomID: string;
  url: string;
  constructor(public af: AngularFireAuth,private router: Router,private loginService: LoginService) {
    this.roomID = this.loginService.getRoomID()
    this.url = '/rooms/' + this.roomID;
    this.af.authState.subscribe(authState => {
      if(authState) {
        this.router.navigateByUrl(this.url);
      }
    });
  }

  ngOnInit() {
  }

  loginFb() {
    this.af.auth.signInWithPopup(new firebase.auth.FacebookAuthProvider())
    .then(
        (success) => {
        this.router.navigate([this.url]);
      }).catch(
        (err) => {
        this.error = err;
      })
  }

  loginGoogle() {
    this.af.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider())
    .then(
        (success) => {
        this.router.navigate([this.url]);
      }).catch(
        (err) => {
        this.error = err;
      })
  }

  Back() {
    this.router.navigate([this.url]);
  }

}
