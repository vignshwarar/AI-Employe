import normalizeUrl from "normalize-url";

import { fetchClient, queryActiveTab, isChromeUrl } from "./utils";
import { ActionType } from "../ui/utils/types";
import { sendMessage } from "../ui/utils/message";
import ActionExecutor from "./action";
import { getOpenAIKey } from "./setup";

let stopRequested = false;
let currentWorkflowId = null;
let currentWorkflowExecutionId = null;

export const getWorkflows = async () => {
  const response = await fetchClient("/workflows", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  return await response.json();
};

export const startWorkflow = async (payload: {
  workflowId: string;
  tabId?: number;
}) => {
  if (stopRequested) {
    stopRequested = false;
    currentWorkflowId = null;
    currentWorkflowExecutionId = null;
    return;
  }
  const { workflowId, tabId } = payload;
  currentWorkflowId = workflowId;

  let tab;
  if (tabId) {
    console.log(await chrome.tabs.get(tabId));
    tab = await chrome.tabs.get(tabId);
  } else {
    tab = await queryActiveTab();
  }

  attachDebugger(tab.id);

  const { html, screenshot } = await getHtmlWithNodeIdsAndScreenshot(
    tab.id,
    tab.url
  );

  try {
    const response = await getAction({ html, screenshot, url: tab.url });
    if (response.all_tasks_completed) {
      workflowDone();
      return;
    }
    if (response.status && response.status.error) {
      workflowDone(`Error: ${response.status.error}`);
      return;
    }
    const actions = response.action.actions;
    sendResponseToSidePanel(response.action.actions);
    const actionExecutor = new ActionExecutor(tab.id, actions);
    const executedTabId = await actionExecutor.executeActions();

    await new Promise((resolve) => setTimeout(resolve, 1000)); // TODO: need different logic to calculate when to start next request
    startWorkflow({ workflowId, tabId: executedTabId });
  } catch (e) {
    console.log("error", e);
    workflowDone(`Error: ${e.message}`);
  }
};

export const workflowDone = async (message?: string) => {
  detachDebugger();
  currentWorkflowId = null;
  currentWorkflowExecutionId = null;

  sendMessage({
    actionType: ActionType.WORKFLOW_DONE,
  });

  if (message) {
    sendMessage({
      actionType: ActionType.SHOW_MESSAGE_SIDEBAR,
      payload: message,
    });
  }
};

export const stopWorkflow = async () => {
  stopRequested = true;
  detachDebugger();
  sendMessage({
    actionType: ActionType.AI_RESPONSE_FOR_WORKFLOW_ACTION,
    payload: {
      role: "assistant",
      content: "Workflow stopped",
    },
  });
};

export const getAction = async ({ html, screenshot, url }) => {
  const host = new URL(url).host;
  const normalized_host = normalizeUrl(host, {
    stripProtocol: true,
  });
  let openAIKey = await getOpenAIKey();
  let payload = {
    workflow_id: currentWorkflowId,
    workflow_execution_id: currentWorkflowExecutionId,
    url,
    host: normalized_host,
    html,
    screenshot,
    openai_api_key: openAIKey,
  };

  const response = await fetchClient("/execute_workflow", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  currentWorkflowExecutionId = data.workflow_execution_id;
  return data;
};

export const getHtmlWithNodeIdsAndScreenshot = async (tabId, url) => {
  const html = await getHtmlWithNodeIds(tabId, url);
  const actionExecutor = new ActionExecutor(tabId);
  const screenshot = await actionExecutor.captureScreenshot();
  return { html, screenshot };
};

export const getHtmlWithNodeIds = async (tabId, url) => {
  if (isChromeUrl(url)) {
    return null;
  }

  await injectRunScriptIfNeeded(tabId);

  const maxAttempts = 10;
  const interval = 500; // ms
  let attempts = 0;

  const pollForHtmlWithNodeIds = async () => {
    try {
      const response = await chrome.tabs.sendMessage(tabId, {
        actionType: ActionType.GET_HTML_WITH_NODE_IDS,
      });
      return response?.payload || null;
    } catch (e) {
      if (
        e.message ===
        "Could not establish connection. Receiving end does not exist."
      ) {
        if (attempts < maxAttempts) {
          attempts++;
          console.log(`Retrying... attempt ${attempts}`);
          await new Promise((resolve) => setTimeout(resolve, interval));
          return pollForHtmlWithNodeIds();
        } else {
          console.error(
            "Max attempts reached. Script may not have loaded correctly."
          );
          return null;
        }
      }
      throw e;
    }
  };

  return pollForHtmlWithNodeIds();
};

const injectRunScriptIfNeeded = async (tabId) => {
  try {
    const isScriptInjected = await chrome.tabs.sendMessage(tabId, {
      actionType: ActionType.RUN_SCRIPT_STATUS,
    });
    console.log("isScriptInjected", isScriptInjected);
  } catch (e) {
    console.log("error sending message to client", e);
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ["run.js"],
    });
  }
};

export function attachDebugger(tabId: number) {
  return new Promise<void>(async (resolve, reject) => {
    try {
      const targets = await chrome.debugger.getTargets();
      const isAlreadyAttached = targets.some(
        (target) => target.tabId === tabId && target.attached
      );

      if (isAlreadyAttached) {
        console.log(`Debugger is already attached to tab ${tabId}`);
        resolve();
        return;
      }

      chrome.debugger.attach({ tabId }, "1.2", async () => {
        if (chrome.runtime.lastError) {
          console.log(
            "Failed to attach debugger:",
            chrome.runtime.lastError.message
          );
          reject(chrome.runtime.lastError.message);
        } else {
          console.log("attached to debugger");
          await chrome.debugger.sendCommand({ tabId }, "DOM.enable");
          console.log("DOM enabled");
          await chrome.debugger.sendCommand({ tabId }, "Runtime.enable");
          console.log("Runtime enabled");
          resolve();
        }
      });
    } catch (e) {
      reject(e);
    }
  });
}

export async function detachDebugger() {
  const targets = await chrome.debugger.getTargets();
  const detachPromises = targets
    .filter((target) => target.attached && target.tabId)
    .map((target) => {
      console.log("detaching debugger", target);
      return chrome.debugger.detach({ tabId: target.tabId });
    });

  await Promise.all(detachPromises);
}

export const sendResponseToSidePanel = (payload) => {
  sendMessage({
    actionType: ActionType.AI_RESPONSE_FOR_WORKFLOW_ACTION,
    payload: {
      role: "assistant",
      content: payload,
    },
  });
};
