const { default: fetch } = require("node-fetch");

const video = document.querySelector("video");
const playBtn = document.getElementById("play");
const playBtnImg = playBtn.querySelector(".fa-play");
const muteBtn = document.getElementById("mute");
const muteBtnImg = muteBtn.querySelector(".fa-volume-up");
const volumeRange = document.getElementById("volume");
const currentTime = document.getElementById("currentTime");
const totalTime = document.getElementById("totalTime");
const timeline = document.getElementById("timeline");

const videoContainer = document.querySelector(".videoContainer");
const videoControls = document.getElementById("videoControls");
const fullScreenBtn = document.getElementById("fullScreen");
const fullScreenBtnImg = fullScreenBtn.querySelector(".fa-expand");

let globalVolume = 0.5;
video.volume = globalVolume;

const handleClickPlay = (event) => {
  if (video.paused) {
    video.play();
    playBtnImg.classList.remove("fa-play");
    playBtnImg.classList.add("fa-pause");
  } else {
    video.pause();
    playBtnImg.classList.add("fa-play");
    playBtnImg.classList.remove("fa-pause");
  }
};

const handleClickMute = (event) => {
  if (video.muted) {
    video.muted = false;
    globalVolume = globalVolume == 0 ? 0.5 : globalVolume;
    volumeRange.value = globalVolume;
    video.volume = globalVolume;
    muteBtnImg.classList.add("fa-volume-up");
    muteBtnImg.classList.remove("fa-volume-mute");
  } else {
    video.muted = true;
    volumeRange.value = 0;
    muteBtnImg.classList.add("fa-volume-mute");
    muteBtnImg.classList.remove("fa-volume-up");
  }
};

const handleVolumeChange = (event) => {
  globalVolume = event.target.value;
  video.volume = globalVolume;

  if (video.volume == 0) {
    video.muted = true;
    muteBtnImg.classList.add("fa-volume-mute");
    muteBtnImg.classList.remove("fa-volume-up");
  } else {
    video.muted = false;
    muteBtnImg.classList.add("fa-volume-up");
    muteBtnImg.classList.remove("fa-volume-mute");
  }
};

const handleLoadedMetaData = () => {
  timeline.max = Math.floor(video.duration);

  let duration = Math.floor(video.duration);
  const seconds = Math.floor(duration % 60);
  duration /= 60;
  const minutes = Math.floor(duration % 60);
  duration /= 60;
  const hours = duration;

  if (minutes >= 10) {
    if (seconds >= 10) {
      totalTime.innerText = `${minutes}:${seconds}`;
    } else {
      totalTime.innerText = `${minutes}:0${seconds}`;
    }
  } else {
    if (seconds >= 10) {
      totalTime.innerText = `${minutes}:${seconds}`;
    } else {
      totalTime.innerText = `${minutes}:0${seconds}`;
    }
  }
};

const handleTimeUpdate = () => {
  timeline.value = video.currentTime;

  let curTime = Math.floor(video.currentTime);
  const seconds = Math.floor(curTime % 60);
  curTime /= 60;
  const minutes = Math.floor(curTime % 60);
  curTime /= 60;
  const hours = curTime;

  if (minutes >= 10) {
    if (seconds >= 10) {
      currentTime.innerText = `${minutes}:${seconds}`;
    } else {
      currentTime.innerText = `${minutes}:0${seconds}`;
    }
  } else {
    if (seconds >= 10) {
      currentTime.innerText = `${minutes}:${seconds}`;
    } else {
      currentTime.innerText = `${minutes}:0${seconds}`;
    }
  }
};

const handleTimelineInput = (event) => {
  video.currentTime = event.target.value;
};

const handleClickFullScreen = () => {
  const isFullScreen = document.fullscreenElement;
  if (isFullScreen) {
    document.exitFullscreen();
    fullScreenBtnImg.classList = "fas fa-expand";
  } else {
    videoContainer.requestFullscreen();
    fullScreenBtnImg.classList = "fas fa-compress";
  }
};

let leaveTimeout = null;
let moveTimeout = null;

const hideControls = () => videoControls.classList.remove("active");

const handleMouseMove = () => {
  if (leaveTimeout) {
    clearTimeout(leaveTimeout);
    leaveTimeout = null;
  }
  if (moveTimeout) {
    clearTimeout(moveTimeout);
    moveTimeout = null;
  }
  videoControls.classList.add("active");
  moveTimeout = setTimeout(hideControls, 1500);
};
const handleMouseLeave = () => {
  leaveTimeout = setTimeout(hideControls, 1500);
};

let isCommentFocused = false;

const handleKeyDown = (event) => {
  if (!isCommentFocused) {
    if (event.which == 32) {
      event.preventDefault();
      handleClickPlay();
    }
  }
};

const handleEnded = () => {
  const { id } = videoContainer.dataset;
  fetch(`/api/videos/${id}/view`, { method: "post" });
};

const body = document.querySelector("body");
const comment = document.querySelector(".video__add-comment");

comment.addEventListener("click", () => {
  isCommentFocused = true;
});
playBtn.addEventListener("click", handleClickPlay);
video.addEventListener("click", handleClickPlay);
muteBtn.addEventListener("click", handleClickMute);
volumeRange.addEventListener("input", handleVolumeChange);
video.addEventListener("timeupdate", handleTimeUpdate);
timeline.addEventListener("input", handleTimelineInput);
fullScreenBtn.addEventListener("click", handleClickFullScreen);
videoContainer.addEventListener("mousemove", handleMouseMove);
videoContainer.addEventListener("mouseleave", handleMouseLeave);
body.addEventListener("keydown", handleKeyDown);
videoContainer.addEventListener("click", () => {
  isCommentFocused = false;
});
video.addEventListener("loadedmetadata", handleLoadedMetaData);
video.addEventListener("ended", handleEnded);
