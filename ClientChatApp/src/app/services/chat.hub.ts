import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as signalR from '@microsoft/signalr';
import {
  AuthService,
  Chat,
  Message,
  SendMessageDTO,
  UserDTO,
} from './auth.service';
import * as moment from 'moment';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChatHubService {
  private _onNewMessage: Subject<Message> = new Subject<Message>();
  apiURL = 'https://localhost:44314';
  hubConnection: any = {};
  messagesList: Message[] = [];
  constructor(private _http: HttpClient, private _authService: AuthService) {}
  connect() {
    let token: string = this._authService.LocalUser().token;
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${this.apiURL}/chatHub`, {
        accessTokenFactory: () => {
          return token;
        },
      })
      .build();
    this.hubConnection
      .start()
      .then(() => {
        // let fileName = this._companyService.getNotificationInfo()?.fileName;
        console.log('connection started ');
        this.onRecieveMessage();
        this.watchUserNewUnReadedMessage();
      })
      .catch((err: any) =>
        console.log('Error while starting connection: ' + err)
      );
  }
  sendMessage(dto: SendMessageDTO) {
    var _formData = new FormData();
    _formData.append('RoomId', dto.roomId.toString());
    _formData.append('Message', dto.message?.toString());
    _formData.append('ToUserId', dto.toUserId?.toString());
    dto.files?.forEach((file) => {
      _formData.append('Files', file);
    });

    return this._http.post(`${this.apiURL}/api/Chat/SendMessage`, _formData, {
      headers: new HttpHeaders().set(
        'Authorization',
        'Bearer ' + this._authService.LocalUser()?.token
      ),
    });
  }
  getFrinds() {
    return this._http.get<UserDTO[]>(`${this.apiURL}/api/Chat/GetOthers`, {
      headers: new HttpHeaders().set(
        'Authorization',
        'Bearer ' + this._authService.LocalUser()?.token
      ),
    });
  }

  joinRoom() {
    return this._http.get(`${this.apiURL}/api/Chat/JoinRoom`, {
      headers: new HttpHeaders().set(
        'Authorization',
        'Bearer ' + this._authService.LocalUser()?.token
      ),
    });
  }
  CreatePrivateRoom(userId: string) {
    return this._http.get<Chat>(
      `${this.apiURL}/api/Chat/CreatePrivateRoom?userId=${userId}`,
      {
        headers: new HttpHeaders().set(
          'Authorization',
          'Bearer ' + this._authService.LocalUser()?.token
        ),
      }
    );
  }
  leaveRoom() {}
  getMessages(roomId: number, pageNumber: number = 0) {
    return this._http.get<Chat>(
      `${this.apiURL}/api/Chat/ChatMessages/${roomId}/${pageNumber}`,
      {
        headers: new HttpHeaders().set(
          'Authorization',
          'Bearer ' + this._authService.LocalUser()?.token
        ),
      }
    );
  }
  getChats() {
    return this._http.get<any[]>(`${this.apiURL}/api/Chat/Get`, {
      headers: new HttpHeaders().set(
        'Authorization',
        'Bearer ' + this._authService.LocalUser()?.token
      ),
    });
  }
  onRecieveMessage() {
    let eventToFire = 'RecieveMessage';
    this.hubConnection.on(eventToFire, (data: Message) => {
      data.isByMe = this._authService.LocalUser().userDTO.id == data.userId;
      let date = moment();
      date = moment(new Date(data.timestamp));
      data.ago = date.fromNow();
      this.messagesList.push(data);
      this._onNewMessage.next(data);
    });
  }
  watchUserNewUnReadedMessage() {
    let eventToFire = 'notifyMessage';
    this.hubConnection.on(eventToFire, (data: Message) => {
      this._onNewMessage.next(data);
    });
  }
  OnNewMessage() {
    return this._onNewMessage.asObservable();
  }
  joinSignalRRoom(roomId: number) {
    this.hubConnection.invoke('JoinRoom', roomId.toString());
  }
}
