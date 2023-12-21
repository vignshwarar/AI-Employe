import login, { listenAuthStateChange, handleLogout } from "./login";
import { ActionType, MessageContent } from "../ui/utils/types";
import record, {
  stopRecording,
  recordAction,
  createWorkflow,
  updateWorkflow,
} from "./recorder";
import { getWorkflows, startWorkflow, stopWorkflow } from "./workflows";
import handleNewMessage from "./message";
import { storeOpenAIKey, getOpenAIKey } from "./setup";

export const init = () => {
  chrome.runtime.onMessage.addListener(
    // @ts-ignore
    async (message, sender, sendResponse) => {
      const { actionType, payload } = message as MessageContent;
      console.log("message received", message, sender, sendResponse);
      switch (actionType) {
        case ActionType.CLIENT_READY:
          listenAuthStateChange();
          break;
        case ActionType.START_RECORDING:
          record();
          break;
        case ActionType.STOP_RECORDING:
          stopRecording();
          break;
        case ActionType.NEW_MESSAGE:
          handleNewMessage(payload);
          break;
        case ActionType.LOGIN:
          login();
          break;
        case ActionType.RECORD_ACTION:
          recordAction(payload, sender);
          break;
        case ActionType.LOGOUT:
          handleLogout();
          break;
        case ActionType.INITIATE_WORKFLOW:
          startWorkflow(payload);
          break;
        case ActionType.STOP_WORKFLOW:
          stopWorkflow();
          break;
        default:
          break;
      }
    }
  );

  // sendResponse is not working if it inside the switch statement
  // but it works if it is outside the switch statement, i am doing something wrong
  // TODO: clean this up
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const { actionType, payload } = message as MessageContent;
    if (actionType === ActionType.CREATE_WORKFLOW) {
      createWorkflow(payload).then((payload) => {
        // @ts-ignore
        sendResponse({
          actionType: ActionType.CREATE_WORKFLOW_SUCCESS,
          payload,
        });
      });
      return true;
    }

    if (actionType === ActionType.UPDATE_WORKFLOW) {
      updateWorkflow(payload).then((payload) => {
        // @ts-ignore
        sendResponse({
          actionType: ActionType.UPDATE_WORKFLOW,
          payload,
        });
      });
      return true;
    }

    if (actionType === ActionType.GET_WORKFLOWS) {
      getWorkflows().then((payload) => {
        // @ts-ignore
        sendResponse({
          actionType: ActionType.GET_WORKFLOWS,
          payload,
        });
      });
      return true;
    }

    if (actionType === ActionType.SETUP_OPENAI_KEY) {
      storeOpenAIKey(payload).then((payload) => {
        // @ts-ignore
        sendResponse({
          actionType: ActionType.SETUP_OPENAI_KEY,
          payload,
        });
      });
      return true;
    }

    if (actionType === ActionType.GET_OPENAI_KEY) {
      getOpenAIKey().then((payload) => {
        // @ts-ignore
        sendResponse({
          actionType: ActionType.GET_OPENAI_KEY,
          payload,
        });
      });
      return true;
    }
  });

  chrome.action.onClicked.addListener(function (tab) {
    const queryOptions = { active: true, lastFocusedWindow: true };
    chrome.tabs.query(queryOptions, (tab) => {
      chrome.sidePanel.open({ tabId: tab[0].id });
    });
  });
};
