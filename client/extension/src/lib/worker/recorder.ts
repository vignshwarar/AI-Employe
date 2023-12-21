import normalizeUrl from "normalize-url";

import { ActionType } from "../ui/utils/types";
import { queryActiveTab, isChromeUrl, fetchClient } from "./utils";
import { getOpenAIKey } from "./setup";

let recording = false;
let recordedActions = [];
let activeUrlWhenRecordingStarted = null;
let activeTabIdWhenRecordingStarted = null;

const inputTags = new Set(["input", "textarea", "select"]);
const inputTypes = new Set(["keydown", "input"]);

const injectRecordingScript = async (tabId) => {
  if (!tabId) throw new Error("Tab id not found");

  try {
    const message = await chrome.tabs.sendMessage(tabId, {
      actionType: ActionType.RECORD_SCRIPT_STATUS,
    });
    if (message.payload === ActionType.RECORD_SCRIPT_ACTIVE) {
      console.log("Already injected", tabId);
      return;
    }
  } catch (error) {
    console.log("Injection error:", error);
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ["recorder.js"],
    });
  }
};

const checkTabAndInject = async (tabId) => {
  if (!recording) return;

  const tab = tabId ? await chrome.tabs.get(tabId) : await queryActiveTab();
  if (tab?.status === "complete" && !isChromeUrl(tab.url)) {
    await injectRecordingScript(tab.id);
  }
};

const tabUpdateListener = async (tabId, changeInfo) => {
  if (changeInfo.status === "complete") {
    await checkTabAndInject(tabId);
  }
};

const listenForTabEvents = () => {
  chrome.tabs.onUpdated.addListener(tabUpdateListener);
  chrome.tabs.onActivated.addListener(
    async ({ tabId }) => await checkTabAndInject(tabId)
  );
  chrome.tabs.onCreated.addListener(
    async (tab) => await checkTabAndInject(tab.id)
  );
};

const removeTabEventListeners = () => {
  chrome.tabs.onUpdated.removeListener(tabUpdateListener);
  chrome.tabs.onActivated.removeListener(checkTabAndInject);
  chrome.tabs.onCreated.removeListener(checkTabAndInject);
};

export const startRecording = async () => {
  if (recording) return;
  recording = true;

  const tab = await queryActiveTab();
  if (!isChromeUrl(tab?.url)) {
    activeTabIdWhenRecordingStarted = tab.id;
    activeUrlWhenRecordingStarted = tab.url;
    await injectRecordingScript(tab.id);
  }
  listenForTabEvents();
};

export const stopRecording = () => {
  if (!recording) return;
  recording = false;
  removeTabEventListeners();
};

export const recordAction = async (rawAction, sender) => {
  if (!recording) {
    console.log("Not recording, action will not be recorded");
    return;
  }

  const {
    tab: { id: tabId, url: tabUrl },
  } = sender;
  let action = rawAction;

  /*
    Helping GPT to avoid confusion:
    If the workflow started from an email,
    GPT also mentions the exact URL in the task list,
    but not every task will start from the exact email URL.
    Therefore, setting actionType to null indicates to GPT that I am already on the appropriate email page
    when the workflow started.
  */
  if (
    !recordedActions.length &&
    activeUrlWhenRecordingStarted === tabUrl &&
    activeTabIdWhenRecordingStarted === tabId
  ) {
    action = { ...action, actionType: "null" };
  }

  const isInputAction =
    inputTags.has(action.tag) && inputTypes.has(action.actionType);
  const isScrollAction = action.actionType.startsWith("scroll");
  const existingElementIndex = recordedActions.findIndex(
    (a) =>
      a.uniqueId === action.uniqueId &&
      a.tag === action.tag &&
      a.actionType === action.actionType
  );

  if (
    (isInputAction || action.isDivWithException) &&
    existingElementIndex !== -1
  ) {
    recordedActions[existingElementIndex].value = action.value;
  } else if (
    isScrollAction &&
    recordedActions.length &&
    recordedActions.at(-1).actionType.startsWith("scroll")
  ) {
    recordedActions.at(-1).value = action.value;
  } else {
    recordedActions.push(action);
  }
};

export const clearRecordedActions = (recordedActions) => {
  return recordedActions.map((action) => {
    const { url, outerHtml } = action;
    const normalized_url = normalizeUrl(url, {
      stripProtocol: true,
    });
    const host = new URL(url).host;
    const normalized_host = normalizeUrl(host, {
      stripProtocol: true,
    });
    const cleanedAction = {
      action_type: action.actionType,
      timestamp: action.timestamp,
      url,
      normalized_url,
      host,
      normalized_host,
      value: action.value || null,
      tag: action.tag,
      placeholder: action.placeholder || null,
      inner_text: action.innerText || null,
      block_ids: action.blockIds || null,
    };
    return cleanedAction;
  });
};

export const createWorkflow = async (payload) => {
  const { workflowTitle, workflowObjective } = payload;
  const cleanedActions = clearRecordedActions(recordedActions);
  let openAIKey = await getOpenAIKey();

  const data = {
    title: workflowTitle,
    objective: workflowObjective,
    actions: cleanedActions,
    openai_api_key: openAIKey,
  };

  const response = await fetchClient("/workflow", {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  });
  recordedActions = [];

  return await response.json();
};

export const updateWorkflow = async (payload) => {
  const response = await fetchClient("/update_workflow", {
    method: "POST",
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json",
    },
  });

  return await response.json();
};

export default startRecording;
