import { StateCreator } from "zustand";

import { Workflow } from "./workflowSlice";

export interface AIAction {
  action_type: string;
  search_term_to_find_this_element: null;
  value: string;
  node_id: null;
  thought_process?: string;
}

export type Content = AIAction[] | string;

export interface Message {
  role: "user" | "assistant";
  content: Content;
}

export type MessageSlice = {
  messages: Message[];
  addMessage: (message: Message) => void;
  showTyping: boolean;
  setShowTyping: (showTyping: boolean) => void;
  workflow: Workflow | null;
  setWorkflow: (workflow: Workflow) => void;
  clearMessages: () => void;
  setCurrentWorkflowDone: () => void;
};

export const createMessageSlice: StateCreator<MessageSlice> = (set) => ({
  messages: [],
  addMessage: (message: Message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  showTyping: false,
  setShowTyping: (showTyping: boolean) => set({ showTyping }),
  workflow: null,
  setWorkflow: (workflow: Workflow) => set({ workflow }),
  clearMessages: () => set({ messages: [] }),
  setCurrentWorkflowDone: () =>
    set((state) => ({
      workflow: {
        ...state.workflow,
        done: true,
      },
    })),
});
