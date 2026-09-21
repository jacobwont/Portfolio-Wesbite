/*
 * TThis script was used under the following creative commons license by Jacob Laird, the code has been alerted for use on jacob-laird.com.
 * This work is licensed under the Creative Commons Attribution-NonCommercial 4.0 International License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-nc/4.0/.
 */

function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

window.onload = function () {
  var messagesEl = document.querySelector(".messages");
  var typingSpeed = 30;
  if (!isMobile()) {
    var typingSpeed = 40;
  }
  var loadingText = "<b>•</b><b>•</b><b>•</b>";
  var messageIndex = 0;

  var getCurrentTime = function () {
    var date = new Date();
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var current = hours + minutes * 0.01;
    if (current >= 5 && current < 19) return "Have a nice day 👋";
    if (current >= 19 && current < 22) return "Have a nice evening 👋";
    if (current >= 22 || current < 5) return "Have a good night 👋";
  };

  var messages = [
    "Hi, I'm Jacob",
    "I'm a UX/UI Designer",
    "Scroll down to see my <br/>recent work</a>",
    "Or find out more<br/><a href = 'about.html' > about me</a>",
  ];

  if (!isMobile()) {
    var messages = [
      "Hi, I'm Jacob",
      "I am a Designer and Educator based in Sydney, currently working at <a href='https://www.3plearning.com/' target='_blank'>3P&nbsp;Learning</a> & <a href='https://www.uts.edu.au/' target='_blank'>UTS</a>",
      "Connect with me on <a href='https://www.linkedin.com/in/jacob-laird-777680112/ target='_blank''>Linkedin</a >",
      "or get in <a href='mailto:hello@jacoblaird.com'>contact</a>",
      //getCurrentTime(),
    ];
  }

  var getFontSize = function () {
    return parseInt(
      getComputedStyle(document.body).getPropertyValue("font-size")
    );
  };

  var pxToRem = function (px) {
    return px / getFontSize() + "rem";
  };

  var createBubbleElements = function (message, position) {
    var bubbleEl = document.createElement("div");
    var messageEl = document.createElement("span");
    var loadingEl = document.createElement("span");
    bubbleEl.classList.add("bubble");
    bubbleEl.classList.add("is-loading");
    bubbleEl.classList.add("cornered");
    bubbleEl.classList.add(position === "right" ? "right" : "left");
    messageEl.classList.add("message");
    loadingEl.classList.add("loading");
    messageEl.innerHTML = message;
    loadingEl.innerHTML = loadingText;
    bubbleEl.appendChild(loadingEl);
    bubbleEl.appendChild(messageEl);
    bubbleEl.style.opacity = 0;
    return {
      bubble: bubbleEl,
      message: messageEl,
      loading: loadingEl,
    };
  };

  var getDimentions = function (elements) {
    return (dimensions = {
      loading: {
        w: "2.25rem",
        h: "1.25rem",
      },
      bubble: {
        w: pxToRem(elements.bubble.offsetWidth - 25),
        h: pxToRem(elements.bubble.offsetHeight - 15),
      },
      message: {
        w: pxToRem(elements.message.offsetWidth + 1),
        h: pxToRem(elements.message.offsetHeight),
      },
    });
  };

  var sendMessage = function (message, position) {
    var loadingDuration =
      message.replace(/<(?:.|\n)*?>/gm, "").length * typingSpeed + 500;
    var elements = createBubbleElements(message, position);
    messagesEl.appendChild(elements.bubble);
    messagesEl.appendChild(document.createElement("br"));
    var dimensions = getDimentions(elements);
    elements.bubble.style.width = "3rem";
    elements.bubble.style.height = dimensions.loading.h;
    elements.message.style.width = dimensions.message.w;
    elements.message.style.height = dimensions.message.h;
    elements.bubble.style.opacity = 1;
    var bubbleOffset = elements.bubble.offsetTop + elements.bubble.offsetHeight;
    if (bubbleOffset > messagesEl.offsetHeight) {
      var scrollMessages = anime({
        targets: messagesEl,
        scrollTop: bubbleOffset,
        duration: 750,
      });
    }
    var bubbleSize = anime({
      targets: elements.bubble,
      width: ["0rem", dimensions.loading.w],
      marginTop: ["1.5rem", 0],
      marginLeft: ["-2.5rem", 0],
      duration: 800,
      easing: "easeOutElastic",
    });
    var loadingLoop = anime({
      targets: elements.bubble,
      scale: [1.05, 0.95],
      duration: 1100,
      loop: true,
      direction: "alternate",
      easing: "easeInOutQuad",
    });
    var dotsStart = anime({
      targets: elements.loading,
      translateX: ["-2rem", "0rem"],
      scale: [0.5, 1],
      duration: 400,
      delay: 25,
      easing: "easeOutElastic",
    });
    var dotsPulse = anime({
      targets: elements.bubble.querySelectorAll("b"),
      scale: [1, 1.25],
      opacity: [0.5, 1],
      duration: 300,
      loop: true,
      direction: "alternate",
      delay: function (i) {
        return i * 100 + 50;
      },
    });
    setTimeout(function () {
      loadingLoop.pause();
      dotsPulse.restart({
        opacity: 0,
        scale: 0,
        loop: false,
        direction: "forwards",
        update: function (a) {
          if (
            a.progress >= 65 &&
            elements.bubble.classList.contains("is-loading")
          ) {
            elements.bubble.classList.remove("is-loading");
            anime({
              targets: elements.message,
              opacity: [0, 1],
              duration: 300,
            });
          }
        },
      });
      bubbleSize.restart({
        scale: 1,
        width: [dimensions.loading.w, dimensions.bubble.w],
        height: [dimensions.loading.h, dimensions.bubble.h],
        marginTop: 0,
        marginLeft: 0,
        begin: function () {
          if (messageIndex < messages.length)
            elements.bubble.classList.remove("cornered");
        },
      });
    }, loadingDuration - 50);
  };

  var sendMessages = function () {
    var message = messages[messageIndex];
    if (!message) return;
    sendMessage(message);
    ++messageIndex;
    setTimeout(
      sendMessages,
      message.replace(/<(?:.|\n)*?>/gm, "").length * typingSpeed +
        anime.random(900, 1200)
    );
  };

  sendMessages();
};
