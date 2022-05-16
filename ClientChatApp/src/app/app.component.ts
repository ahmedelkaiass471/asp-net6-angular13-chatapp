import { Component, OnInit } from '@angular/core';
import { ChatHubService } from './services/chat.hub';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(private _ChatHubService: ChatHubService) {}
  ngOnInit(): void {
  }
  title = 'ClientChatApp';
}
