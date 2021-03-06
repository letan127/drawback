import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { Router } from '@angular/router';
import { DOCUMENT } from '@angular/platform-browser';
import { Inject } from '@angular/core';
import * as firebase from 'firebase/app';

import { DrawService } from '../draw.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
  //providers: [DrawService]
})
export class LoginComponent implements OnInit {
  error: any;
  signupError: any;
  roomID: string;
  total_url: string;
  url:any;
  idIndex:any;
  //moveButton:any;

  constructor(private drawService: DrawService, public af: AngularFireAuth,private router: Router, @Inject(DOCUMENT) private document: Document) {
    this.total_url = this.document.location.href;
    this.idIndex = this.total_url.indexOf("/login"); //Might need to change if stlye of URL changes
    this.roomID = this.total_url.slice(this.idIndex+7, this.total_url.length);
    this.url = this.total_url.slice(0, this.idIndex);
  }

  ngOnInit() {

      this.drawService.getSocket().disconnect();

      this.af.authState.subscribe(authState => {
        if(authState) {
          this.router.navigateByUrl('/rooms/' + this.roomID);
        }
      });
  }

  loginFb() {
    this.af.auth.signInWithPopup(new firebase.auth.FacebookAuthProvider())
    .then(
        (success) => {
        this.router.navigate(['/rooms/' + this.roomID]);
      }).catch(
        (err) => {
        this.error = err;
      })
  }

  loginGoogle() {
    this.af.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider())
    .then(
        (success) => {
        this.router.navigate(['/rooms/' + this.roomID]);
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
    if(formData.valid) {
      this.af.auth.createUserWithEmailAndPassword(formData.value.email, formData.value.password).then(
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
    if(formData.valid) {
      this.af.auth.signInWithEmailAndPassword(formData.value.email, formData.value.password).then(
        (success) => {
        console.log(success);
      }).catch(
        (err) => {
        console.log(err);
        this.error = "Account with that username and password does not exist.";
      })
    }
  }

  userClicked(){
      this.error = ''
      this.signupError = ''
  }

}
