import { User } from "@firebase/auth";
import { StateCreator } from "zustand";

export type UserSlice = {
  loading: boolean;
  user: User | null;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
};

export const createUserSlice: StateCreator<UserSlice> = (set) => ({
  loading: true,
  user: null,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
});
