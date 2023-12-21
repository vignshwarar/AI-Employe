/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

import React, { useEffect } from "react";
import { toast } from "sonner";

import { GlobalStyle } from "./styles/global";
import { Page } from "./store/pageSlice";
import { useStore } from "./store";
import Layout from "./layout";
import Login from "./pages/login";
import CreateWorkflow from "./pages/createWorkflow";
import SetupKey from "./pages/setup";
import Workflows from "./pages/workflows";
import Messages from "./pages/messages";
import { sendMessage } from "./utils/message";
import { ActionType, MessageContent } from "./utils/types";
import { Message } from "./store/messageSlice";

const pageComponents = {
  [Page.Login]: () => <Login />,
  [Page.CreateWorkflow]: () => <CreateWorkflow />,
  [Page.YourWorkflows]: () => <Workflows />,
  [Page.Messages]: () => <Messages />,
  [Page.SetupKey]: () => <SetupKey />,
  [Page.Community]: () => <div>Community shared workflows</div>,
  [Page.Loading]: () => <div>Loading...</div>,
  default: () => <div>Home</div>,
};

export const App = () => {
  const {
    activePage,
    setUser,
    setLoading,
    setActivePage,
    addMessage,
    setShowTyping,
    setCurrentWorkflowDone,
  } = useStore();
  const isLoginPage = activePage === Page.Login;

  const renderInitialPage = async (payload) => {
    if (isLoginPage && payload) {
      const hasOpenAIKey = await sendMessage({
        actionType: ActionType.GET_OPENAI_KEY,
      });

      if (!hasOpenAIKey) {
        setActivePage(Page.SetupKey);
        return;
      }

      setActivePage(Page.YourWorkflows);
    }
  };

  const listenForMessages = () => {
    chrome.runtime.onMessage.addListener(
      // @ts-ignore
      (message: MessageContent, sender, sendResponse) => {
        const { actionType, payload } = message;
        if (actionType == ActionType.AUTH_STATE_CHANGE) {
          setUser(payload);
          setLoading(false);
          renderInitialPage(payload);
          return;
        }

        if (actionType == ActionType.AI_RESPONSE_FOR_COMMON_ACTION) {
          addMessage(payload as Message);
          setShowTyping(false);

          if (payload?.status?.error) {
            toast.success(payload?.status?.error);
          }

          return;
        }

        if (actionType == ActionType.AI_RESPONSE_FOR_WORKFLOW_ACTION) {
          addMessage(payload as Message);
          return;
        }

        if (actionType == ActionType.WORKFLOW_DONE) {
          setShowTyping(false);
          setCurrentWorkflowDone();
          toast.success("Workflow completed successfully 🎉");
          return;
        }

        if (actionType == ActionType.SHOW_MESSAGE_SIDEBAR) {
          toast.success(payload);
          return;
        }
      }
    );
  };

  useEffect(() => {
    listenForMessages();
    sendMessage({
      actionType: ActionType.CLIENT_READY,
    });
  }, []);

  const renderPageComponent = () => {
    const Component = pageComponents[activePage] || pageComponents.default;
    return <Component />;
  };

  return (
    <>
      <GlobalStyle />
      <Layout>{renderPageComponent()}</Layout>
    </>
  );
};
