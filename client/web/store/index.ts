import { create } from "zustand";

import { createModalSlice, ModalSlice } from "./modalSlice";
import { createAuthSlice, UserSlice } from "./userSlice";

type Store = ModalSlice & UserSlice;

export const useStore = create<Store>((...args) => ({
  ...createModalSlice(...args),
  ...createAuthSlice(...args),
}));
