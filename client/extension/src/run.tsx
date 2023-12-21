import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import {
  StyleSheetManager,
  createGlobalStyle,
  styled,
} from "styled-components";
import { motion, useAnimationControls } from "framer-motion";

import { executeBlockInjectionAndAssignment } from "./lib/ui/utils/injectBlockId";
import { ActionType } from "./lib/ui/utils/types";

const GlobalStyle = createGlobalStyle`
  body {
    background-color: transparent;
  }
  button, p, div, span, input, textarea, select, option, label, a {
    padding: 0;
    margin: 0;  
    font-family: sans-serif;
  }
`;

const CursorContainer = styled(motion.div)`
  z-index: 9999999;
  display: flex;
  position: fixed;
  pointer-events: none;
`;

const ActionStatus = styled(motion.div)`
  margin-top: 12px;
  margin-left: 0px;
  background: linear-gradient(90deg, #ec008c 0%, #fc6767 100%);
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.2);
  padding: 6px 12px;
  border-radius: 50px;
  font-size: 12px;
  color: white;
  font-family: sans-serif;
  font-weight: 300;
  white-space: nowrap;
  z-index: 9999999;
  position: relative;
  pointer-events: none;
`;

const CircleBubble = styled(motion.div)`
  width: 0px;
  height: 0px;
  display: hidden;
  background: linear-gradient(90deg, #ec008c 0%, #fc6767 100%);
  position: absolute;
  border-radius: 50%;
  top: -15px;
  left: -15px;
  pointer-events: none;
`;

const Progress = styled(motion.div)`
  position: fixed;
  bottom: 10px;
  left: 10px;
  z-index: 9999;
  padding: 10px 16px;
  border: none;
  border-radius: 50px;
  background-color: #abebc6;
  color: black;
  pointer-events: none;
`;

const PointerSVG = ({ startClickingAnimation }: any) => {
  const bubbleControls = useAnimationControls();
  const startSequence = async () => {
    await bubbleControls.start({
      width: 30,
      height: 30,
      scale: 0,
      opacity: 1,
      display: "block",
      transition: { duration: 0.4 },
    });

    await bubbleControls.start({
      scale: 3,
      opacity: 0,
      transition: { duration: 0.4 },
    });
  };

  useEffect(() => {
    if (startClickingAnimation) {
      startSequence();
    }
  }, [startClickingAnimation]);

  return (
    <>
      <CircleBubble animate={bubbleControls} />
      <svg
        width={22}
        height={22}
        viewBox="0 0 25 25"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M1.81639 0.0989798C1.57614 0.00012447 1.31201 -0.0253966 1.05728 0.0256333C0.802558 0.0766632 0.568639 0.20196 0.385012 0.385731C0.201385 0.569501 0.0762693 0.80352 0.0254353 1.05829C-0.0253987 1.31306 0.000324448 1.57717 0.0993623 1.81735L9.30946 24.1851C9.40809 24.4247 9.5753 24.6299 9.7901 24.7749C10.0049 24.9198 10.2577 24.9981 10.5169 25C10.776 25.0018 11.0299 24.9271 11.2467 24.7851C11.4636 24.6432 11.6337 24.4404 11.7357 24.2022L15.2684 15.959C15.4015 15.6486 15.6488 15.4013 15.9591 15.2682L24.2022 11.7355C24.4404 11.6334 24.6432 11.4634 24.7851 11.2465C24.9271 11.0297 25.0018 10.7758 25 10.5166C24.9981 10.2575 24.9198 10.0047 24.7749 9.78987C24.6299 9.57506 24.4247 9.40785 24.1851 9.30921L1.81639 0.0989798Z"
          fill="url(#paint0_linear_89_3)"
        />
        <defs>
          <linearGradient
            id="paint0_linear_89_3"
            x1="0.000770998"
            y1="2.36864"
            x2="19.3423"
            y2="22.1046"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#F6357C" />
            <stop offset={1} stopColor="#FC6767" />
          </linearGradient>
        </defs>
      </svg>
    </>
  );
};

const Status = ({ action }: any) => {
  return (
    <ActionStatus
      initial={{ opacity: 0, width: 0 }}
      animate={{ opacity: 1, width: "auto" }}
    >
      {action}
    </ActionStatus>
  );
};

const WorkflowStatus = () => {
  const [startClickingAnimation, setStartClickingAnimation] = useState(false);
  const axisControl = useAnimationControls();
  const [action, setAction] = useState(null);

  const setCursorCoordinates = async ({ x, y }: any) => {
    await axisControl.start({
      opacity: 1,
      left: x,
      top: y,
    });
    await axisControl.start({ left: x + 50, top: y + 10 });
  };

  const animateCursor = async (payload) => {
    const { x, y, action } = payload;
    setCursorCoordinates({ x, y });
    setAction(
      `${
        action.action_type
      } ${action.search_term_to_find_this_element.toLowerCase()}`
    );
    setStartClickingAnimation(true);
    await setTimeout(() => {
      setStartClickingAnimation(false);
    }, 1000);
  };

  const listenForMessage = () => {
    chrome.runtime.onMessage.addListener(
      // @ts-ignore
      async (message, sender, sendResponse) => {
        console.log("message received", message, sender, sendResponse);
        const { actionType, payload } = message;
        switch (actionType) {
          case ActionType.GET_HTML_WITH_NODE_IDS:
            await executeBlockInjectionAndAssignment();
            // @ts-ignore
            sendResponse({
              actionType: ActionType.GET_HTML_WITH_NODE_IDS,
              payload: document.documentElement.innerHTML,
            });
            break;
          case ActionType.ANIMATE_CURSOR:
            animateCursor(payload);
            break;
          case ActionType.RUN_SCRIPT_STATUS:
            // @ts-ignore
            sendResponse({
              actionType: ActionType.RUN_SCRIPT_ACTIVE,
              payload: ActionType.RUN_SCRIPT_ACTIVE,
            });
          default:
            break;
        }
      }
    );
  };
  useEffect(() => {
    listenForMessage();
  }, []);
  return (
    <>
      <Progress>Running...</Progress>
      <CursorContainer
        id="aie-cursor"
        initial={{ opacity: 0 }}
        animate={axisControl}
        transition={{ duration: 0.4, ease: "easeInOut" }}
      >
        <PointerSVG startClickingAnimation={startClickingAnimation} />
        {action && <Status action={action} />}
      </CursorContainer>
    </>
  );
};

const createRootElement = (() => {
  let rootElement = null;
  return () => {
    if (!rootElement) {
      rootElement = document.createElement("div");
      rootElement.id = "aie-workflow-status";
      document.body.appendChild(rootElement);
      rootElement.attachShadow({ mode: "open" });
    }
    return rootElement;
  };
})();

const renderWorkflowStatus = (() => {
  let hasRendered = false;
  return () => {
    if (hasRendered) return;
    const rootElement = createRootElement();
    const root = ReactDOM.createRoot(rootElement.shadowRoot);
    root.render(
      <StyleSheetManager target={rootElement.shadowRoot}>
        <GlobalStyle />
        <WorkflowStatus />
      </StyleSheetManager>
    );
    hasRendered = true;
  };
})();

if (!document.getElementById("aie-workflow-status")) {
  renderWorkflowStatus();
}
