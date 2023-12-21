import { getUserToken } from "./login";

export const setLocalStorage = async (key, value) => {
  await chrome.storage.local.set({ [key]: value });
};

export const getLocalStorage = async (key) => {
  const result = await chrome.storage.local.get([key]);
  return result[key];
};

export const queryActiveTab = async () => {
  const queryOptions = { active: true, lastFocusedWindow: true };
  const [tab] = await chrome.tabs.query(queryOptions);
  return tab;
};

export const isChromeUrl = (url) => url && url.startsWith("chrome://");

export const fetchClient = async (path, options) => {
  const token = await getUserToken();
  const baseUrl = process.env.BACKEND_URL;
  const url = `${baseUrl}${path}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });
  return response;
};
