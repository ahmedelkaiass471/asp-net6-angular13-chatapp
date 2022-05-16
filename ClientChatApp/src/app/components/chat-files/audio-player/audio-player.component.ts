import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-audio-player',
  templateUrl: './audio-player.component.html',
  styleUrls: ['./audio-player.component.scss'],
})
export class AudioPlayerComponent implements OnInit {
  @Input('relativeFilePath')
  relativeFilePath: string | null = null;
  @ViewChild('timeLine')
  timeLine: ElementRef | null = null;

  public audio = new Audio();
  audioLength: any;

  constructor() {}
  ngOnInit(): void {
this.audio.src = `https://localhost:44314/${this.relativeFilePath}`;
    this.audio.addEventListener(
      'loadedmetadata',
      () => {
        // this.audioLength = this.getTimeCodeFromNum(this.audio.duration);
        this.audio.volume = 0.85;
        console.log( this.audioLength= this.audio.buffered.length
          )

      },
      false
    );
    this.audio.addEventListener('play', (e) => {
      console.log(e);
    });

  }
  getTimeCodeFromNum(num: any) {
    let seconds = parseInt(num);
    let minutes = seconds / 60;
    seconds -= minutes * 60;
    const hours = minutes / 60;
    minutes -= hours * 60;

    if (hours === 0) return `${minutes}:${String(seconds % 60).padStart(2)}`;
    return `${String(hours).padStart(2)}:${minutes}:${String(
      seconds % 60
    ).padStart(2)}`;
  }
  onTimeLineClick() {
    // const timeline = this.timeLine?.nativeElement; //  audioPlayer.querySelector(".timeline");
    // timeline.addEventListener(
    //   'click',
    //   (e: any) => {
    //     const timelineWidth = window.getComputedStyle(timeline).width;
    //     const timeToSeek =
    //       (e.offsetX / parseInt(timelineWidth)) * this.audio.duration;
    //     this.audio.currentTime = timeToSeek;
    //   },
    //   false
    // );
  }

  //click volume slider to change volume
  // const volumeSlider = audioPlayer.querySelector(".controls .volume-slider");
  // volumeSlider.addEventListener('click', e => {
  //   const sliderWidth = window.getComputedStyle(volumeSlider).width;
  //   const newVolume = e.offsetX / parseInt(sliderWidth);
  //   audio.volume = newVolume;
  //   audioPlayer.querySelector(".controls .volume-percentage").style.width = newVolume * 100 + '%';
  // }, false)

  // //check audio percentage and update time accordingly
  // setInterval(() => {
  //   const progressBar = audioPlayer.querySelector(".progress");
  //   progressBar.style.width = audio.currentTime / audio.duration * 100 + "%";
  //   audioPlayer.querySelector(".time .current").textContent = getTimeCodeFromNum(
  //     audio.currentTime
  //   );
  // }, 500);

  // //toggle between playing and pausing on button click
  // const playBtn = audioPlayer.querySelector(".controls .toggle-play");
  // playBtn.addEventListener(
  //   "click",
  //   () => {
  //     if (audio.paused) {
  //       playBtn.classList.remove("play");
  //       playBtn.classList.add("pause");
  //       audio.play();
  //     } else {
  //       playBtn.classList.remove("pause");
  //       playBtn.classList.add("play");
  //       audio.pause();
  //     }
  //   },
  //   false
  // );

  // audioPlayer.querySelector(".volume-button").addEventListener("click", () => {
  //   const volumeEl = audioPlayer.querySelector(".volume-container .volume");
  //   audio.muted = !audio.muted;
  //   if (audio.muted) {
  //     volumeEl.classList.remove("icono-volumeMedium");
  //     volumeEl.classList.add("icono-volumeMute");
  //   } else {
  //     volumeEl.classList.add("icono-volumeMedium");
  //     volumeEl.classList.remove("icono-volumeMute");
  //   }
  // });

  //
}
