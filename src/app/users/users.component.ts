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
  @Input() socketID: string;
  userInfo = []
  constructor(private drawService: DrawService) {
    this.numUsers = 0
  }

  ngOnInit() {
    this.drawService.updateUsers().subscribe(userInfo => {
        if (userInfo.amount == -1) {
          this.numUsers -= 1;
          for(var i = this.userInfo.length - 1; i >= 0; i--) {
              console.log(userInfo.socketID)
              if (this.userInfo[i].socketID == userInfo.socketID) {
                this.userInfo.splice(i, 1);
              }
          }
          this.updateUserCount();
        }
        else {
          this.numUsers += 1;
          this.userInfo.push(userInfo.userInfo);
          this.updateUserCount();
        }
    })
    this.drawService.users().subscribe(userInfo => {
        this.userInfo = userInfo;
    })
    this.drawService.updateUserColor().subscribe(userDetails => {
        for(var i = 0; i < this.userInfo.length; i++) {
            if (this.userInfo[i].socketID == userDetails.socketID) {
              this.userInfo[i].userColor = userDetails.userColor;
              return
            }
        }
    })
    this.drawService.updateUserName().subscribe(userDetails => {
      for(var i = 0; i < this.userInfo.length; i++) {
          if (this.userInfo[i].socketID == userDetails.id) {
              this.userInfo[i].userName = userDetails.userName;
              return
          }
      }
    })
  }
  updateUserCount(value = 0) {
    this.numUsers += value
    document.getElementById("num-users-text").innerHTML = ""+this.numUsers;
  }
  toggleUsers() {
    document.getElementById("userModal").classList.toggle('show')
  }


}
