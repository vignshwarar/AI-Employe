import { MessageContent } from "./types";

export const sendMessage = async (messageContent: MessageContent) => {
  return await chrome.runtime.sendMessage(messageContent);
};
