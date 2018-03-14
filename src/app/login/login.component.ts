import { Component, OnInit } from '@angular/core';
import { LoginService } from '../login.service';
import { AngularFireAuth } from 'angularfire2/auth';
import { Router } from '@angular/router';
import { DOCUMENT } from '@angular/platform-browser';
import { Inject } from '@angular/core';
import * as firebase from 'firebase/app';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  email: any;
  password: any;
  error: any;
  signupError: any;
  roomID: string;
  url: string;
  constructor(public af: AngularFireAuth,private router: Router,private loginService: LoginService, @Inject(DOCUMENT) private document: Document) {
    this.roomID = this.loginService.getRoomID()
    this.url = '/rooms/' + this.roomID;
  }

  ngOnInit() {
      
      this.af.authState.subscribe(authState => {
        if(authState) {
          this.router.navigateByUrl(this.url);
        }
      });
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

  showShareModal() {
      var modal = document.getElementById("share-modal");
      modal.style.display = "flex";
   }

  closeShareModal() {
      var modal = document.getElementById("share-modal");
      modal.style.display = "none";
  }

  onSubmit(formData) {
    console.log("log out")
    this.email = formData.value.email;
    this.password = formData.value.password;
    if(formData.valid) {
      this.af.auth.createUserWithEmailAndPassword(this.email, this.password).then(
        (success) => {
        console.log(success);
      }).catch(
        (err) => {
        console.log(err);
        this.signupError = err;
      })
    }
  }

  loginSubmit(formData) {
    console.log("login");
    this.email = formData.value.email;
    this.password = formData.value.password;
    if(formData.valid) {
      this.af.auth.signInWithEmailAndPassword(this.email, this.password).then(
        (success) => {
        console.log(success);
      }).catch(
        (err) => {
        console.log("hello",err);
        this.error = "Account with that username and password does not exist.";
      })
    }
  }

}
