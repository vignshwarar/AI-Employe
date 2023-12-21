import { create } from "zustand";

import { PageSlice, createPageSlice } from "./pageSlice";
import { MessageSlice, createMessageSlice } from "./messageSlice";
import { UserSlice, createUserSlice } from "./userSlice";
import { WorkflowSlice, createWorkflowSlice } from "./workflowSlice";

type Store = PageSlice & MessageSlice & UserSlice & WorkflowSlice;

export const useStore = create<Store>((...args) => ({
  ...createPageSlice(...args),
  ...createMessageSlice(...args),
  ...createUserSlice(...args),
  ...createWorkflowSlice(...args),
}));
