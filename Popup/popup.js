"use strict";

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

class Popup {
  constructor(selector, options) {
    this.init(selector, options);
  }

  init(selector, options) {
    this.open = this.open.bind(this);
    this.close = this.close.bind(this);
    this.closeListener = this.closeListener.bind(this);
    this.tabPressControl = this.tabPressControl.bind(this);
    this.getTemplate = this.getTemplate.bind(this);
    this.calcWidthHeight = this.calcWidthHeight.bind(this);
    this.startPlayer = this.startPlayer.bind(this);
    this.changeSizePopup = this.changeSizePopup.bind(this);
    this.onResize = this.onResize.bind(this);

    this.options = options;
    this.type = this.options.type || "text";
    this.screenHeight = window.innerHeight;
    this.screenWidth = window.innerWidth;

    this.$play = document.querySelector(selector);
    this.$popupTextInner = options.textTemplate || "Default text";
    this.$popup = this.getTemplate();

    this.#createTagScriptForYoutybePay();
    this.#setup();
    this.onResize();
    this.opened = false;
    this.lastFocusedElement;
    this.player;

    const popupNodes = this.$popup.querySelectorAll(_focusElements);
    this.firstTabStop = popupNodes[0];
    this.lastTabStop = popupNodes[popupNodes.length - 1];
  }

  #createTagScriptForYoutybePay() {
    const tag = document.createElement("script");
    tag.setAttribute("src", "https://www.youtube.com/iframe_api");
    document
      .getElementsByTagName("script")[0]
      .insertAdjacentElement("beforebegin", tag);
  }

  getTemplate() {
    let { popupWidth, popupHeight } = this.calcWidthHeight();

    const popup = document.createElement("div");
    popup.className = "popup";
    popup.innerHTML = `
      <div class="popup__bg"></div>
      <div class="popup__inner">
        ${
          this.type === "video"
            ? `
            <input style="width:1px; height:1px; opacity:0; padding: 0; margin: 0;" type="checkbox" role="note" />
              <div
                class="popup__video-container"
                data-container
                style="width: ${popupWidth}px; height: ${popupHeight}px"
              >
                <div id="player"></div>
              </div>
            `
            : `<div class="popup__text-container">${this.$popupTextInner}</div>`
        }
        <button class="popup__close-btn" data-close="true"></button>
      </div>
    `;

    return popup;
  }

  calcWidthHeight(w, h) {
    let screenWidth = w || window.innerWidth;
    let screenHeight = h || window.innerHeight;

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
  }

  onResize() {
    window.onresize = (e) => {
      let w = window.innerWidth;
      let h = window.innerHeight;
      this.changeSizePopup(w, h);
    };
  }

  changeSizePopup(screenWidth, screenHeight) {
    let { popupWidth, popupHeight } = this.calcWidthHeight(
      screenWidth,
      screenHeight
    );
    let popupInner = this.$popup.querySelector("[data-container]");
    popupInner.style.height = `${popupHeight}px`;
    popupInner.style.width = `${popupWidth}px`;
  }

  startPlayer(videoId) {
    window.YT.ready(() => {
      this.player = new YT.Player("player", {
        height: "100%",
        width: "100%",
        videoId: videoId,
      });
    });
  }

  #render() {
    document.body.appendChild(this.$popup);
  }

  #setup() {
    this.$play.addEventListener("click", this.open);
    this.$popup.addEventListener("click", this.closeListener);
    this.$popup.addEventListener("keydown", this.closeListener);
    this.$popup.addEventListener("keydown", this.tabPressControl);
  }

  tabPressControl(event) {
    if (event.keyCode === 9) {
      if (event.shiftKey) {
        if (document.activeElement === this.firstTabStop) {
          event.preventDefault();
          this.lastTabStop.focus();
        }
      } else {
        if (document.activeElement === this.lastTabStop) {
          event.preventDefault();
          this.firstTabStop.focus();
        }
      }
    }
  }

  closeListener(event) {
    if (
      (event.type === "click" && event.target.dataset.close) ||
      (event.type === "keydown" && this.opened && event.keyCode === 27)
    ) {
      this.close();
    }
  }

  open(event) {
    if (
      (event.type === "click" && !this.opened) ||
      (event.type === "keydown" && event.keyCode === "13" && !this.opened)
    ) {
      this.lastFocusedElement = document.activeElement;
      this.firstTabStop.focus();
      this.#render();
      this.$popup.classList.add("open");
      this.type === "video" && this.startPlayer(this.options.videoId);
      typeof this.options.onOpen === "function" && this.options.onOpen();
      this.opened = true;
    }
  }

  close() {
    this.lastFocusedElement && this.lastFocusedElement.focus();
    typeof this.options.onClose === "function" && this.options.onClose();
    this.$popup.classList.remove("open");
    this.player && this.player.destroy();
    this.opened = false;
  }

  destroy() {
    typeof this.options.onDestroy === "function" && this.options.onDestroy();
    this.$popup.removeEventListener("click", this.closeListener);
    this.$popup.removeEventListener("keydown", this.tabPressControl);
    this.$play.removeEventListener("click", this.open);
  }
}
