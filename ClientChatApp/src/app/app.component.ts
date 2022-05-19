import { Component, OnInit } from "@angular/core";
import { ChatHubService } from "./services/chat.hub";
import { BrowserInfoService } from "./services/network.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit {
  constructor(
    private _ChatHubService: ChatHubService,
    private _BrowserInfoService: BrowserInfoService
  ) {}
  ngOnInit(): void {
    this._BrowserInfoService
      .GetNetworkConnectionStatus()
      .subscribe((status) => {
        console.log(status);
      });
  }
  title = "ClientChatApp";
}
