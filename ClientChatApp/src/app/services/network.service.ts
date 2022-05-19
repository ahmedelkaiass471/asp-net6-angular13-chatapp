import { Injectable } from "@angular/core";
import { Observable, Observer, fromEvent, merge } from 'rxjs';
import { map } from "rxjs/operators";
@Injectable({
  providedIn: "root",
})
export class BrowserInfoService {
  public GetNetworkConnectionStatus() {
    return merge(
        fromEvent(window, 'offline').pipe(map(() => false)),
        fromEvent(window, 'online').pipe(map(() => true)),
        new Observable((sub: Observer<boolean>) => {
          sub.next(navigator.onLine);
          sub.complete();
        }));
  }
}
