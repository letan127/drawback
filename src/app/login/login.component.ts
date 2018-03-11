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

  error: any;
  roomID: string;
  url: string;
  constructor(public af: AngularFireAuth,private router: Router,private loginService: LoginService, @Inject(DOCUMENT) private document: Document) {
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

  showShareModal() {
      var modal = document.getElementById("share-modal");
      modal.style.display = "flex";
   }

  closeShareModal() {
      var modal = document.getElementById("share-modal");
      modal.style.display = "none";
  }

  onSubmit(formData) {
    var email = formData.value.email;
    var password = formData.value.password;
    if(formData.valid) {
      this.af.auth.createUserWithEmailAndPassword(email, password).then(
        (success) => {
        console.log(success);
      }).catch(
        (err) => {
        console.log(err);
        this.error = err;
      })
    }
  }

}
