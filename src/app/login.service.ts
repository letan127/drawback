export class LoginService {

  private roomID:string;

  constructor(){
    this.roomID = '';
  }

  setRoomID(roomID: string) {
    this.roomID = roomID
  }

  getRoomID():string{
    return this.roomID
  }

}
