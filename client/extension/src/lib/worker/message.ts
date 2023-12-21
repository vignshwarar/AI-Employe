import { Message } from "../ui/store/messageSlice";
import { sendMessage } from "../ui/utils/message";
import { ActionType } from "../ui/utils/types";
import { getOpenAIKey } from "./setup";
import { queryActiveTab, fetchClient } from "./utils";

const handleNewMessage = async (messages: Message[]) => {
  try {
    const tab = await queryActiveTab();
    const html = await getActivePageHtml(tab.id);
    const screenshot = await getActivePageScreenshot();
    const response = await getAction({
      html,
      screenshot,
      url: tab.url,
      messages,
    });

    const aiMessage = {
      role: "assistant",
      content: response.action.actions,
    };
    sendMessage({
      actionType: ActionType.AI_RESPONSE_FOR_COMMON_ACTION,
      payload: aiMessage,
    });
  } catch (error) {
    console.log({ error });
  }
};

const getActivePageHtml = async (tabId) => {
  try {
    const rawData = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        return document.documentElement.innerHTML;
      },
    });

    if (rawData.length > 0) {
      return rawData[0].result;
    }

    return null;
  } catch (error) {
    console.log({ error });
    return null;
  }
};
export const getActivePageScreenshot = async (): Promise<string> => {
  try {
    const dataUrl = await chrome.tabs.captureVisibleTab();
    return dataUrl;
  } catch (error) {
    console.log({ error });
    return null;
  }
};

export const getPageScreenshotByTabId = async (tabId) => {
  try {
    const dataUrl = await chrome.tabs.captureVisibleTab(tabId);
    return dataUrl;
  } catch (error) {
    console.log({ error });
    return null;
  }
};

const getAction = async ({
  html,
  screenshot,
  url,
  messages,
}: {
  html?: string;
  screenshot?: string;
  url?: string;
  messages?: Message[];
}) => {
  let openAIKey = await getOpenAIKey();
  let host;
  if (url) {
    const urlObj = new URL(url);
    host = urlObj.host;
  }

  let convertMessageContentToString = messages.map((message) => {
    if (typeof message.content === "string") {
      return message;
    }

    return {
      ...message,
      content: JSON.stringify(message.content),
    };
  });

  const payload = {
    html,
    screenshot,
    url,
    host,
    messages: convertMessageContentToString,
    openai_api_key: openAIKey,
  };

  const response = await fetchClient("/execute", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return await response.json();
};

export default handleNewMessage;
