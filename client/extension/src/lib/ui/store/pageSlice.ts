import { StateCreator } from "zustand";

export enum Page {
  Login = "Login",
  CreateWorkflow = "CreateWorkflow",
  YourWorkflows = "YourWorkflows",
  Messages = "Messages",
  Community = "Community",
  Loading = "Loading",
  SetupKey = "SetupKey",
}

export type PageSlice = {
  activePage: Page;
  setActivePage: (page: Page) => void;
  blurContent: boolean;
  setBlurContent: (blur: boolean) => void;
};

export const createPageSlice: StateCreator<PageSlice> = (set) => ({
  activePage: Page.Login,
  setActivePage: (page: Page) => set({ activePage: page }),
  blurContent: false,
  setBlurContent: (blur: boolean) => set({ blurContent: blur }),
});
