export const storeOpenAIKey = async (key) => {
  await chrome.storage.local.set({ openAIKey: key });
};

export const getOpenAIKey = async () => {
  const result = await chrome.storage.local.get(["openAIKey"]);
  return result.openAIKey || null;
};
