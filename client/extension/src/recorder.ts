import { ActionType } from "./lib/ui/utils/types";
import { sendMessage } from "./lib/ui/utils/message";
import { executeBlockInjectionAndAssignment } from "./lib/ui/utils/injectBlockId";
import { recalculateBlockPositions } from "./lib/ui/utils/injectBlockId";

import { onScrollChange } from "@analytics/scroll-utils";

// @ts-ignore
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("message received", message, sender, sendResponse);
  const { actionType, payload } = message;
  switch (actionType) {
    case ActionType.RECORD_SCRIPT_STATUS:
      // @ts-ignore
      sendResponse({
        actionType: ActionType.RECORD_SCRIPT_STATUS,
        payload: ActionType.RECORD_SCRIPT_ACTIVE,
      });
      break;
    default:
      break;
  }
});

const injectRecordStatus = () => {
  const button = document.createElement("button");
  button.id = "record-aie";
  button.innerHTML = "Recording...";
  button.style.position = "fixed";
  button.style.bottom = "10px";
  button.style.left = "10px";
  button.style.zIndex = "9999";
  button.style.padding = "10px 16px";
  button.style.border = "none";
  button.style.borderRadius = "50px";
  button.style.backgroundColor = "red";
  button.style.color = "white";
  document.body.appendChild(button);
};

const divWithExceptions = ["div[role=button]", "div[contenteditable=true]"];

const eventsToListen = ["click", "dblclick", "input", "focus", "keydown"];

const listenInteractions = () => {
  eventsToListen.forEach((event) => {
    document.addEventListener(event, handleInteraction);
  });

  const scrollChangeHandlers = Array.from({ length: 100 }, (_, i) => ({
    [1 * (i + 1)]: (scrollDepth, maxScroll) => {
      const payload = {
        actionType: `scroll_${scrollDepth.direction}`,
        value: `${scrollDepth.trigger}%`,
        timestamp: new Date().toISOString(),
        url: window.location.href,
      };

      sendMessage({
        actionType: ActionType.RECORD_ACTION,
        payload,
      });
    },
  })).reduce((a, b) => ({ ...a, ...b }), {});

  onScrollChange(scrollChangeHandlers);
};

const handleInteraction = async (event) => {
  recalculateBlockPositions();
  let { target, type } = event;
  const { tagName, id, className } = target;
  const tag = target.tagName.toLowerCase();
  const uniqueId = `${tagName}-${id}-${className}`;
  const isDivWithException = divWithExceptions.some((selector) =>
    target.matches(selector)
  );
  const blockIds = target.getAttribute("aie-block-ids");

  let value;
  if (isDivWithException) {
    value = target.innerText;
  } else {
    value = target.value;
  }

  const payload = {
    tag,
    uniqueId,
    actionType: type,
    timestamp: new Date().toISOString(),
    value,
    url: window.location.href,
    innerText: target.innerText,
    placeholder: target.placeholder,
    blockIds,
  };

  sendMessage({
    actionType: ActionType.RECORD_ACTION,
    payload,
  });
};

const sendInitialVisitActions = () => {
  sendMessage({
    actionType: ActionType.RECORD_ACTION,
    payload: {
      actionType: "visit",
      timestamp: new Date().toISOString(),
      url: window.location.href,
    },
  });
};

const init = () => {
  injectRecordStatus();
  sendInitialVisitActions();
  listenInteractions();
  executeBlockInjectionAndAssignment();
};

const existingButton = document.getElementById("record-aie");
if (!existingButton) {
  init();
}
