// ==UserScript==
// @name         Approve Github PR
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://github.com/**
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==

(function () {
  console.log("[GAS] Github Approve Shortcut");

  const approvalRadio = 'form[action*="/reviews"] input[value="approve"]';
  const approvalButton = 'button[form="pull_requests_submit_review"]';
  const approvalComment = 'form[action*="/reviews"] #pull_request_review_body';
  const approvalMessageSelector = "#pull_request_review_body";
  const approvalMessageKey = "github-approve-message";

  let shiftDown = false;
  let controlDown = false;
  let altDown = false;
  let commandDown = false;

  const debug = (message, object = null) => {
    const debugEnabled = localStorage.getItem("github-approve-shortcut-debug");
    if (debugEnabled === "true") {
      object ? console.debug(message, object) : console.debug(message);
    }
  };

  document.addEventListener("keydown", (event) => {
    debug(">>> keydown", { keyCode: event.keyCode });
    // shift === 16
    if (event.keyCode === 16) {
      debug("  shift pressed");
      shiftDown = true;
    }
    // control === 17
    if (event.keyCode === 17) {
      debug("  control pressed");
      controlDown = true;
    }
    // alt === 18
    if (event.keyCode === 18) {
      debug("  alt pressed");
      altDown = true;
    }
    // command === 93
    if (event.keyCode === 93) {
      debug("  command pressed");
      commandDown = true;
    }

    const tDown = event.keyCode === 84;
    const uDown = event.keyCode === 85;

    if (altDown && shiftDown && uDown) {
      debug("  shift+alt+u pressed");
      event.preventDefault();
      event.stopPropagation();
      openReviewDialog("utACK");
    }

    if (altDown && shiftDown && tDown) {
      debug("  shift+alt+t pressed");
      event.preventDefault();
      event.stopPropagation();
      openReviewDialog("tACK");
    }
  });

  document.addEventListener("keyup", (event) => {
    debug(">>> keyUp", { keyCode: event.keyCode });
    // shift === 16
    if (event.keyCode === 16) {
      debug("  shift released");
      shiftDown = false;
    }
    // control === 17
    if (event.keyCode === 17) {
      debug("  control released");
      controlDown = false;
    }
    // alt === 18
    if (event.keyCode === 18) {
      debug("  alt released");
      altDown = false;
    }
    // command === 93
    if (event.keyCode === 93) {
      debug("  command released");
      commandDown = false;
    }
    debug("<<<");
  });

  const openReviewDialog = (message) => {
    debug(">>> openReviewDialog");
    let newLocation = window.location.toString();
    newLocation.includes("/files") ? newLocation : (newLocation += "/files");
    newLocation.includes("#submit-review")
      ? newLocation
      : (newLocation += "#submit-review");

    debug("  ", { newLocation });

    newLocation === window.location.toString()
      ? window.location.reload()
      : window.location.replace(newLocation);
    sessionStorage.setItem(approvalMessageKey, message);
    debug("<<<");
  };

  const onMutation = (mutationList, observer) => {
    debug(">>> onMutation");
    const approvalRadioExists = document.querySelector(approvalRadio) !== null;
    const message = sessionStorage.getItem(approvalMessageKey);
    const triggered = !!message;
    debug("  ", { approvalRadioExists, triggered });

    if (approvalRadioExists && triggered) {
      console.log("[GAS] Approving pull request");
      sessionStorage.removeItem(approvalMessageKey);
      document.querySelector(approvalRadio).click();
      document.querySelector(approvalMessageSelector).value = message;
      document.querySelector(approvalButton).click();
    }
    debug("<<<");
  };

  if (document.getElementById("files_bucket") !== null) {
    debug("Registering MutationObserver");
    new MutationObserver(onMutation).observe(
      document.getElementById("files_bucket"),
      { attributes: true, childList: true, subtree: true }
    );
  }
})();
