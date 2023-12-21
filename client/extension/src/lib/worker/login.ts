import {
  getAuth,
  signInWithCustomToken,
  onAuthStateChanged,
} from "@firebase/auth";

import firebaseClient from "../ui/firebaseClient";
import { sendMessage } from "../ui/utils/message";
import { ActionType } from "../ui/utils/types";

export const auth = getAuth(firebaseClient);

export const getUserToken = async () => {
  return auth.currentUser.getIdToken();
};

const handleLogin = async () => {
  await chrome.tabs.create({
    url: `${process.env.FRONTEND_URL}/?signInFromExtension=true`,
  });
  listenForUpdates();
};

export const handleLogout = async () => {
  await auth.signOut();
};

const isRelevantTab = (tab) =>
  tab.status === "complete" &&
  tab.url &&
  new URL(tab.url).origin === process.env.FRONTEND_URL;

const removeEventListeners = () => {
  chrome.tabs.onUpdated.removeListener(handleTabUpdatedEvent);
  chrome.tabs.onCreated.removeListener(handleTabCreatedEvent);
};

const getTokenAndSignIn = async (tab) => {
  const url = new URL(tab.url);
  const token = url.searchParams.get("extensionToken");
  if (token) {
    await signIn(token);
    try {
      chrome.tabs.remove(tab.id);
      removeEventListeners();
    } catch (error) {
      console.error("Tab already closed.", error);
    }
  }
};

const handleTabUpdatedEvent = async (tabId, changeInfo, tab) => {
  tab = tab || tabId;
  if (isRelevantTab(tab)) {
    await getTokenAndSignIn(tab);
  }
};

const handleTabCreatedEvent = async (tab) => {
  if (isRelevantTab(tab)) {
    await getTokenAndSignIn(tab);
  }
};

const listenForUpdates = () => {
  chrome.tabs.onUpdated.addListener(handleTabUpdatedEvent);
  chrome.tabs.onCreated.addListener(handleTabCreatedEvent);
};

export const listenAuthStateChange = () => {
  onAuthStateChanged(auth, async (user) => {
    sendMessage({ actionType: ActionType.AUTH_STATE_CHANGE, payload: user });
  });
};

const signIn = async (token) => {
  await signInWithCustomToken(auth, token);
};

export default handleLogin;
