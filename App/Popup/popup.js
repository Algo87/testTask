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

const tag = document.createElement("script");
tag.setAttribute("src", "https://www.youtube.com/iframe_api");
document
  .getElementsByTagName("script")[0]
  .insertAdjacentElement("beforebegin", tag);

class Popup {
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

  #checkIframeFocus() {
    return addEventListener("focusout", function () {
      if (document.activeElement === document.getElementById("player")) {
        console.log("sldkjfslkjflskjflksjlfkdjskdfjsldjkf");
      }
      // removeEventListener("blur", listener);
    });
  }
  // TABPRESScONTROL
  tabPressControl(event) {
    console.log(this.player.getIframe());
    
    const popupNodes = this.$popup.querySelectorAll(_focusElements);
    this.#checkIframeFocus();
    const iframe = document.querySelector("#player");
    // var iframeDoc = iframe.contentWindow.document;
    // console.log(iframe);

    // console.log(document.activeElement);
    const firstTabStop = popupNodes[0];
    const lastTabStop = popupNodes[popupNodes.length - 1];
    firstTabStop.focus();

    this.lastFocusedElement = document.activeElement;

    if (event.keyCode === 9) {
      // console.log(lastTabStop === iframe);
      if (event.shiftKey) {
        if (document.activeElement === firstTabStop) {
          event.preventDefault();
          lastTabStop.focus();
        }
      } else {
        console.log(lastTabStop === iframe);
        if (document.activeElement === lastTabStop || lastTabStop === iframe) {
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
    removeEventListener("blur", this.#checkIframeFocus());
  }
}
