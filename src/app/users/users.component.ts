import { Component, OnInit, AfterViewInit, Input, Output, EventEmitter } from '@angular/core';
import { DrawService } from '../draw.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  numUsers: number;
  @Input() roomID: string;
  userInfo = {}
  constructor(private drawService: DrawService) {
    this.numUsers = 0
  }

  ngOnInit() {
    this.drawService.updateUserCount().subscribe(amount => {
        this.numUsers += amount;
        this.updateUserCount();
    })
    this.drawService.userInformation().subscribe(userInfo => {
        this.userInfo = userInfo;
    })
    this.drawService.updateUserColor().subscribe(userDetails => {
      console.log(this.userInfo)
      this.userInfo[userDetails.socketID].userColor = userDetails.userColor;
    })
    this.drawService.updateUserName().subscribe(userDetails => {
      this.userInfo[userDetails.socketID].userName = userDetails.userName;
    })
  }
  updateUserCount(value = 0) {
    this.numUsers += value
    document.getElementById("num-users-text").innerHTML = ""+this.numUsers;
  }



}
