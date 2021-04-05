"use strict";
const getTemplate = () => {
  let { popupWidth, popupHeight } = calcWidthHeight();

  const popup = document.createElement("div");
  popup.className = "popup";
  popup.innerHTML = `
    <div class="popup__bg"></div>
    <div class="popup__inner">
    <button class="popup__close-btn" data-close="true"></button>
        <div class="popup__video-container" data-container style = "width: ${popupWidth}px; height: ${popupHeight}px" >
          <div id="player"></div> 
        </div>
       
    </div>
`;
  return popup;
};

const calcWidthHeight = (screenWidthResize, screenHeightResize) => {
  let screenWidth = screenWidthResize || window.innerWidth;
  let screenHeight = screenHeightResize || window.innerHeight;

  let popupWidth = screenWidth * 0.8;
  let popupHeight = (screenWidth * 0.8 * 9) / 16;

  if (popupHeight > screenHeight * 0.8) {
    popupHeight = screenHeight * 0.8;
    popupWidth = (screenHeight * 0.8 * 16) / 9;
  }

  return {
    popupHeight,
    popupWidth,
  };
};

const _focusElements = [
  "a[href]",
  "area[href]",
  'input:not([disabled]):not([type="hidden"]):not([aria-hidden])',
  "select:not([disabled]):not([aria-hidden])",
  "textarea:not([disabled]):not([aria-hidden])",
  "button:not([disabled]):not([aria-hidden])",
  "iframe",
  "object",
  "embed",
  "[contenteditable]",
  '[tabindex]:not([tabindex^="-"])',
];

export class Popup {
  constructor(selector, options) {
    this.init(selector, options);
  }

  init(selector, options) {
    this.screenHeight = window.innerHeight;
    this.screenWidth = window.innerWidth;
    this.options = options;
    this.$play = document.querySelector(selector);
    this.$popup = getTemplate();

    this.open = this.open.bind(this);
    this.close = this.close.bind(this);
    this.closeListener = this.closeListener.bind(this);
    this.tabPressControl = this.tabPressControl.bind(this);

    this.#setup();
    this.#onResize();

    this.opened = false;
    this.lastFocusedElement = document.activeElement;
    console.log(this.lastFocusedElement);
  }

  #onResize() {
    window.onresize = (e) => {
      this.screenWidth = window.innerWidth;
      this.screenHeight = window.innerHeight;
      this.#changeSizePopup();
    };
  }

  #changeSizePopup() {
    let { popupWidth, popupHeight } = calcWidthHeight(
      this.screenWidth,
      this.screenHeight
    );
    let popupInner = this.$popup.querySelector("[data-container]");
    popupInner.style.height = `${popupHeight}px`;
    popupInner.style.width = `${popupWidth}px`;
  }

  #render() {
    document.body.appendChild(this.$popup);
  }

  #setup() {
    this.$play.addEventListener("click", this.open);
    this.$popup.addEventListener("click", this.closeListener);
    this.$popup.addEventListener("keydown", this.closeListener);
    document.addEventListener("keydown", this.closeListener);
  }
  // ПЕРЕОПРЕДЕЛЬТЕ НА КЛАСС
  #startPlayer(options) {
    window.YT.ready(() => {
      console.log("ready");
      this.player = new YT.Player("player", {
        height: "100%",
        width: "100%",
        videoId: options.videoId,
        origin: "http://localhost:1234",
        events: {
          // onReady: (event) => {
          //   event.target.playVideo();
          // },
          // onStateChange: onPlayerStateChange,
        },
      });
      // console.log("this.player", this.player);
    });
  }
  // TABPRESScONTROL
  tabPressControl(event) {
    const popupNodes = this.$popup.querySelectorAll(_focusElements);

    const iframe = document.querySelector("#player");
    var iframeDoc = iframe.contentWindow.document;
    console.log(iframeDoc);

    // if (iframeDoc.readyState == "complete") {
    //   console.log(iframeDoc);
    // }
    // iframe.onload = function () {
    //   var iframeDoc2 = iframe.contentWindow.document;
    //   console.log(iframeDoc2);
    // };

    // console.log(iframe);
    // iframe.onload = function () {
    //   var iframeDoc2 = iframe.contentWindow.document;
    //   console.log(iframeDoc2.querySelectorAll(_focusElements));
    // };

    const firstTabStop = popupNodes[0];
    const lastTabStop = popupNodes[popupNodes.length - 1];
    firstTabStop.focus();

    this.lastFocusedElement = document.activeElement;
    if (event.keyCode === 9) {
      if (event.shiftKey) {
        if (document.activeElement === firstTabStop) {
          event.preventDefault();
          lastTabStop.focus();
        }
      } else {
        if (document.activeElement === lastTabStop) {
          event.preventDefault();
          firstTabStop.focus();
        }
      }
    }
  }

  closeListener(event) {
    // console.log(event.type, "event.type");
    // console.log(this.opened, "this.opened");
    // console.log(event.keyCode, "event.keyCode");

    if (
      (event.type === "click" && event.target.dataset.close) ||
      (event.type === "keydown" &&
        event.target.dataset.close &&
        this.opened === true &&
        event.keyCode === 13) ||
      (event.type === "keydown" && this.opened === true && event.keyCode === 27)
    ) {
      this.lastFocusedElement.focus();
      this.close();
    }
  }

  open() {
    this.opened = true;

    typeof this.options.onOpen === "function" && this.options.onOpen();
    this.#render();
    this.$popup.classList.add("open");
    this.#startPlayer(this.options);
    this.$popup.addEventListener("keydown", this.tabPressControl);
  }

  close() {
    this.opened = false;

    typeof this.options.onClose === "function" && this.options.onClose();
    this.$popup.classList.remove("open");
    console.log(this.player);
    // this.player && this.player.stopVideo();
    this.player && this.player.destroy();
  }

  destroy() {
    typeof this.options.onDestroy === "function" && this.options.onDestroy();
    this.$popup.removeEventListener("click", this.closeListener);
    this.$popup.removeEventListener("keydown", this.tabPressControl);
  }
}
