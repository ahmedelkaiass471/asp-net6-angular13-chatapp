import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface UserRegister {
  userName: string;
  password: string;
}
export interface UserDTO {
  id: string;
  name: string;
  userName: string;
  email: string;
  phoneNumber: string;
}
export interface SignInResponseDTO {
  isAuthSuccessful: boolean;
  errorMessage: string;
  token: string;
  userDTO: UserDTO;
}
export interface ChatUser {
  userId?: string;
  user?: UserDTO;
  chatId?: number;
  chat?: Chat;
}
export interface Message {
  id: number;
  name: string;
  text: string;
  timestamp: string;
  ago: string;
  chatId: number;
  chat: Chat;
  userId: string;
  user: UserDTO;
  isByMe: boolean;
  files?: string[];
}

export interface Chat {
  id: number;
  name: string;
  // type: ChatType;
  messages: Message[];
  users: ChatUser[];
  _hasUnReadedMsg: boolean;
  _unReadedMsgCount: number;
  _unReadedMsgText: string;
}
export interface SendMessageDTO {
  roomId: number;
  message: string;
  toUserId: string;
  files: File[];
}
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  apiURL = 'https://localhost:44314/api';
  constructor(private _http: HttpClient) {}
  login(_dto: UserRegister) {
    return this._http.post<SignInResponseDTO>(
      this.apiURL + '/Account/SignIn',
      _dto
    );
  }
  register(_dto: UserRegister) {
    return this._http.post<SignInResponseDTO>(
      this.apiURL + '/Account/Register',
      _dto
    );
  }
  SaveToken(userToken: SignInResponseDTO) {
    localStorage.setItem('auth', JSON.stringify(userToken));
  }
  LocalUser(): SignInResponseDTO {
    let data = JSON.parse(localStorage.getItem('auth') || '');
    return data as SignInResponseDTO;
  }
}
