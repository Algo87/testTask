import { Popup } from "./Popup/popup";
import "./Popup/style.scss";
import maidBg from "./img/main_bg.png";
import btnImg from "./img/btn_img.svg";
const img = new Array(maidBg, btnImg);

const modal = new Popup("#play", {
  videoId: "MB80ZuIJATI",
  onOpen() {
    console.log("onOpen");
  },
  onClose() {
    console.log("onClose");
  },
  onDestroy() {
    console.log("destroy");
  },
});
// modal.destroy();

registerListener("load", setLazy);
registerListener("load", lazyLoad);
registerListener("scroll", lazyLoad);

var lazy = [];

function setLazy() {
  lazy = document.querySelectorAll("[data-lazy]");
  lazy.forEach((l, i) => {
    l.setAttribute("data-src", img[i]);
  });
  console.log("Found " + lazy.length + " lazy images");
}

function lazyLoad() {
  for (var i = 0; i < lazy.length; i++) {
    let dataLazy = lazy[i].getAttribute("data-lazy");
    if (isInViewport(lazy[i])) {
      if (lazy[i].getAttribute("data-src")) {
        if (dataLazy === "img") {
          lazy[i].src = lazy[i].getAttribute("data-src");
        } else if (dataLazy === "background") {
          lazy[i].style.backgroundImage = `url("${lazy[i].getAttribute(
            "data-src"
          )}")`;
        }
        lazy[i].removeAttribute("data-src");
      }
    }
  }

  cleanLazy();
}

function cleanLazy() {
  lazy = Array.prototype.filter.call(lazy, function (l) {
    return l.getAttribute("data-src");
  });
}

function isInViewport(el) {
  var rect = el.getBoundingClientRect();

  return (
    rect.bottom >= 0 &&
    rect.right >= 0 &&
    rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.left <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

function registerListener(event, func) {
  if (window.addEventListener) {
    window.addEventListener(event, func);
  } else {
    window.attachEvent("on" + event, func);
  }
}
