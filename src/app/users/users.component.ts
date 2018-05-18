import { Component, OnInit } from '@angular/core';
import { DrawService } from '../draw.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  numUsers: number;
  constructor(private drawService: DrawService) {
    this.numUsers = 0
  }

  ngOnInit() {
    this.drawService.updateUserCount().subscribe(amount => {
        this.numUsers += amount;
        this.updateUserCount();
    })
  }
  updateUserCount(value = 0) {
    this.numUsers += value
    document.getElementById("num-users-text").innerHTML = ""+this.numUsers;
  }



}
