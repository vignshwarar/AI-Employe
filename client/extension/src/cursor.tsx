import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import {
  StyleSheetManager,
  createGlobalStyle,
  styled,
} from "styled-components";
import { motion, useAnimationControls } from "framer-motion";

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
`;

const Cursor = () => {
  const [startClickingAnimation, setStartClickingAnimation] = useState(false);
  const axisControl = useAnimationControls();
  const [action, setAction] = useState(null);

  const setCursorCoordinates = async ({ top, left }: any) => {
    await axisControl.start({
      opacity: 1,
      top,
      left,
    });
    await axisControl.start({ left: left + 50, top: left + 10 });
  };

  const animateCursor = async (payload) => {
    const nodeId = payload.node_id;
    const element = document.querySelector(`[aie-id="${nodeId}"]`);
    console.log("element", element);
    if (!element) {
      console.log("element not found");
      return;
    }

    const { top, left, width, height } = element.getBoundingClientRect();

    const centerTop = left + width / 2;
    const centerLeft = top + height / 2;

    await setCursorCoordinates({ top: centerTop, left: centerLeft });
  };

  const listenMessages = () => {
    // @ts-ignore
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      const { actionType, payload } = message;
      switch (actionType) {
        case ActionType.ANIMATE_CURSOR:
          console.log("animate cursor", payload);
          animateCursor(payload);
          break;
        default:
          break;
      }
    });
  };

  useEffect(() => {
    listenMessages();
  }, []);

  return (
    <CursorContainer
      initial={{ x: 0, y: 0, opacity: 0 }}
      animate={axisControl}
      transition={{ duration: 0.4, ease: "easeInOut" }}
    >
      <PointerSVG startClickingAnimation={startClickingAnimation} />
      {action && <Status action={action} />}
    </CursorContainer>
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
        viewBox="0 0 29 29"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g filter="url(#filter0_d_89_3)">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M2.81639 1.09898C2.57614 1.00012 2.31201 0.974603 2.05728 1.02563C1.80256 1.07666 1.56864 1.20196 1.38501 1.38573C1.20138 1.5695 1.07627 1.80352 1.02544 2.05829C0.974601 2.31306 1.00032 2.57717 1.09936 2.81735L10.3095 25.1851C10.4081 25.4247 10.5753 25.6299 10.7901 25.7749C11.0049 25.9198 11.2577 25.9981 11.5169 26C11.776 26.0018 12.0299 25.9271 12.2467 25.7851C12.4636 25.6432 12.6337 25.4404 12.7357 25.2022L16.2684 16.959C16.4015 16.6486 16.6488 16.4013 16.9591 16.2682L25.2022 12.7355C25.4404 12.6334 25.6432 12.4634 25.7851 12.2465C25.9271 12.0297 26.0018 11.7758 26 11.5166C25.9981 11.2575 25.9198 11.0047 25.7749 10.7899C25.6299 10.5751 25.4247 10.4079 25.1851 10.3092L2.81639 1.09898Z"
            fill="url(#paint0_linear_89_3)"
          />
        </g>
        <defs>
          <filter
            id="filter0_d_89_3"
            x="0.3"
            y="0.3"
            width="28.4"
            height="28.4"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity={0} result="BackgroundImageFix" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dx={1} dy={1} />
            <feGaussianBlur stdDeviation="0.85" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0.820817 0 0 0 0 0.820817 0 0 0 0 0.820817 0 0 0 1 0"
            />
            <feBlend
              mode="normal"
              in2="BackgroundImageFix"
              result="effect1_dropShadow_89_3"
            />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect1_dropShadow_89_3"
              result="shape"
            />
          </filter>
          <linearGradient
            id="paint0_linear_89_3"
            x1="1.00077"
            y1="3.36864"
            x2="20.3423"
            y2="23.1046"
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

const createRootElement = () => {
  const rootElement = document.createElement("div");
  rootElement.id = "aie-cursor";
  document.body.appendChild(rootElement);
  return rootElement;
};

const renderCursor = () => {
  createRootElement();
  const rootElement =
    document.getElementById("aie-cursor") || createRootElement();
  rootElement.attachShadow({ mode: "open" });
  const root = ReactDOM.createRoot(rootElement.shadowRoot);
  root.render(
    <StyleSheetManager target={rootElement.shadowRoot as any}>
      <GlobalStyle />
      <Cursor />
    </StyleSheetManager>
  );
};

if (!document.getElementById("aie-cursor")) {
  renderCursor();
}
