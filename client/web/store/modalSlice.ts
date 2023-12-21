import { StateCreator } from "zustand";

export type ModalSlice = {
  signInModal: boolean;
  setSignInModal: (value: boolean) => void;
};

export const createModalSlice: StateCreator<ModalSlice> = (set) => ({
  signInModal: false,
  setSignInModal: (value: boolean) => set({ signInModal: value }),
});
