import { StateCreator } from "zustand";
import { User, UserInfo } from "firebase/auth";

export type UserType = User | null | undefined | UserInfo;
type SetUser = { user: UserType; loading: boolean; error: Error | undefined };

export interface UserSlice {
  user: UserType;
  loading: boolean;
  error: Error | undefined;
  setUser: (user: SetUser) => void;
}

export const createAuthSlice: StateCreator<UserSlice> = (set) => ({
  user: undefined,
  loading: true,
  error: undefined,
  setUser: ({ user, loading, error }: SetUser) => set({ user, loading, error }),
});
