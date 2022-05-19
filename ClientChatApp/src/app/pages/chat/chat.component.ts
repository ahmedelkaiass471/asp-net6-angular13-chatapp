import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import {
  AuthService,
  Chat,
  Message,
  SendMessageDTO,
  UserDTO,
} from "src/app/services/auth.service";
import { ChatHubService } from "src/app/services/chat.hub";
import * as moment from "moment";
import "moment/locale/ar";
import { DatePipe } from "@angular/common";

@Component({
  selector: "app-chat",
  templateUrl: "./chat.component.html",
  styleUrls: ["./chat.component.scss"],
  providers: [DatePipe],
})
export class ChatComponent implements OnInit {
  // audio recorder
  _myAudoRecorder: MediaRecorder | null = null;
  _audioChuncks: any[] = [];
  _audioFile: File | null = null;
  recording = false;
  error: any;
  //URL of Blob

  @ViewChild("messagesBox", { static: true })
  messagesBox: ElementRef | null = null;
  frinds: UserDTO[] = [];
  chats: Chat[] = [];
  messages: Message[] = this._ChatHubService.messagesList;
  messagesPageNumber: number = 0;
  mesageForm: FormGroup = new FormGroup({
    message: new FormControl(),
    roomId: new FormControl(null, [Validators.required]),
    toUserId: new FormControl(),
    files: new FormControl(),
  });
  constructor(
    private _ChatHubService: ChatHubService,
    private _authService: AuthService,
    private _router: Router,
    private _datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    if (!this._authService.LocalUser()?.token) {
      this._router.navigate(["/login"]);
    }
    this._ChatHubService.connect();
    this.getFrinds();
    this.getChats();
    this._watchIncommingMessages();
  }
  _watchIncommingMessages() {
    this._ChatHubService.OnNewMessage().subscribe((msg) => {
      let chat = this.chats.filter((x) => x.id == msg.chatId)[0];
      let activeChatId = parseInt(this.mesageForm.get("roomId")?.value || "0");
      if (chat) {
        if (!activeChatId || activeChatId != chat.id) {
          chat._hasUnReadedMsg = true;
          chat._unReadedMsgCount
            ? (chat._unReadedMsgCount += 1)
            : (chat._unReadedMsgCount = 1);
        }
        chat._unReadedMsgText = msg.text;
      } else if (!chat && msg) {
        // console.log(msg.chat);
        this._onHavingNweChat(msg);
      }
      this.scrollToBottom();
    });
  }
  _onHavingNweChat(msg: Message) {
    debugger;
    if (this._authService.LocalUser().userDTO.id != msg.userId) {
      let reciverUser = msg.chat.users.filter(
        (x) => x.userId != this._authService.LocalUser().userDTO.id
      )[0];
      msg.chat._hasUnReadedMsg = true;
      msg.chat._unReadedMsgCount = 1;
      msg.chat._unReadedMsgText = msg.text;
      msg.chat.users = [
        {
          user: reciverUser.user,
        },
      ];
      let _indexOfChat = this.chats.findIndex((x) => x.id == msg.chatId);
      console.log(_indexOfChat);
      if (_indexOfChat <= -1) this.chats.splice(0, 0, msg.chat);
    }
  }
  getFrinds() {
    this._ChatHubService.getFrinds().subscribe((res) => {
      this.frinds = res;
    });
  }
  getChats() {
    this._ChatHubService.getChats().subscribe((res) => {
      this.chats = res;
    });
  }
  onSelectFrind(user: UserDTO) {
    this._ChatHubService.CreatePrivateRoom(user.id).subscribe((res) => {
      if (res) {
        this.chats.splice(0, 0, res);
        this.joinRoom(res.id);
        this.mesageForm.get("toUserId")?.setValue(user.id);
      }
    });
  }
  setReciverUserId(reciverId: any) {
    if (reciverId) this.mesageForm.get("toUserId")?.setValue(reciverId);
  }
  joinRoom(roomId: any) {
    if (roomId) this.mesageForm.get("roomId")?.setValue(roomId);
    this._ChatHubService.joinSignalRRoom(roomId);
    this._ChatHubService
      .getMessages(roomId, this.messagesPageNumber)
      .subscribe((res) => {
        this.messages = this._ChatHubService.messagesList =
          res.messages.reverse();
        this.calcMessagesAgo();
        let currentChat = this.chats.find((x) => x.id == roomId);
        if (currentChat) {
          currentChat._unReadedMsgCount = 0;
          currentChat._hasUnReadedMsg = false;
        }

        if (this.messagesPageNumber == 0)
          setTimeout(() => this.scrollToBottom());
      });
  }
  scrollToBottom(): void {
    try {
      if (this.messagesBox)
        this.messagesBox.nativeElement.scrollTop =
          this.messagesBox?.nativeElement.scrollHeight +10000;
    } catch (err) {}
  }
  sendMessage() {
    console.log(this.mesageForm.value);
    if (this.mesageForm.valid) {
      let dto: SendMessageDTO = this.mesageForm.value;
      this._ChatHubService.sendMessage(dto).subscribe((res) => {
        this.mesageForm.get("message")?.setValue("");
        this.calcMessagesAgo();
        this.scrollToBottom();
      });
    }
  }

  calcMessagesAgo() {
    let date = moment();
    date.locale("ar");
    this.messages.forEach((m) => {
      date = moment(m.timestamp);
      m.ago = date.fromNow();
    });
  }

  onScroll($event: any) {
    let roomId = this.mesageForm.get("roomId")?.value || 0;
    // console.log(($event.srcElement as Element).scrollTop);
    if (($event.srcElement as Element).scrollTop <= 50) {
      this.messagesPageNumber += 1;
      // to do get older messages
      console.log();
      this._ChatHubService
        .getMessages(roomId, this.messagesPageNumber)
        .subscribe((res) => {
          this._ChatHubService.messagesList.splice(
            0,
            0,
            ...res.messages.reverse()
          );
          this.calcMessagesAgo();
          if (res.messages.length > 0)
            ($event.srcElement as Element).scrollTo(0, 50); // ($event.srcElement as Element).scrollTop = 200;
          // this.messagesBox.nativeElement.scrollTop =(this.messagesPageNumber+1) /
        });
    }
  }

  /**
   * Start recording.
   */
  initiateRecording() {
    this.recording = true;
    let mediaConstraints = {
      video: false,
      audio: true,
    };
    navigator.mediaDevices
      .getUserMedia(mediaConstraints)
      .then(this.successCallback.bind(this), this.errorCallback.bind(this));
  }
  /**
   * Will be called automatically.
   */
  successCallback(stream: any) {
    this._myAudoRecorder = new MediaRecorder(stream);
    this._myAudoRecorder?.start();
    this._audioChuncks = [];

    this._myAudoRecorder.addEventListener("dataavailable", (event) => {
      this._audioChuncks.push(event.data);
    });

    this._myAudoRecorder.addEventListener("stop", () => {
      const audioBlob = new Blob(this._audioChuncks);
      this._audioFile = new File([audioBlob], "recorded.wav", {
        lastModified: new Date().getTime(),
        type: "audio/ogg",
      });
      this.mesageForm.get("files")?.setValue([this._audioFile]);
      this.sendMessage();
    });
    // var options = {
    //   mimeType: 'audio/wav',
    //   numberOfAudioChannels: 1,
    //   sampleRate: 16000,
    // };
    // //Start Actuall Recording
    // var StereoAudioRecorder = RecordRTC.StereoAudioRecorder;
    // this.record = new StereoAudioRecorder(stream, options);
    // this.record.record();
  }
  /**
   * Stop recording.
   */
  stopRecording() {
    this.recording = false;
    this._myAudoRecorder?.stop();
    // this.record.stop(this.processRecording.bind(this));
  }

  /**
   * Process Error.
   */
  errorCallback(error: any) {
    this.error = "Can not play audio in your browser";
  }

  sendImage(e: any) {
    console.log(e.target.files[0]);
    this.mesageForm.get("files")?.setValue([e.target.files[0]]);
    this.sendMessage();
  }
}
