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
  constructor(public af: AngularFireAuth,private router: Router,private loginService: LoginService) {
    this.af.authState.subscribe(authState => {
      if(authState) {
        this.router.navigateByUrl('/members');
      }
    });
    console.log('login roomID:',this.loginService.getRoomID());
  }

  ngOnInit() {
  }

  loginFb() {
    this.af.auth.signInWithPopup(new firebase.auth.FacebookAuthProvider())
    .then(
        (success) => {
        this.router.navigate(['/members']);
      }).catch(
        (err) => {
        this.error = err;
      })
  }

  loginGoogle() {
    this.af.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider())
    .then(
        (success) => {
        this.router.navigate(['/members']);
      }).catch(
        (err) => {
        this.error = err;
      })
  }

}
