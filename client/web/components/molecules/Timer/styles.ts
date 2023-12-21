import { motion } from "framer-motion";

import styled from "@emotion/styled";

export const TimerContainer = styled.div`
  margin-top: 16px;
`;

export const DealEndsSoon = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;

  p {
    font-size: 12px;
    font-weight: 300;
    text-align: center;
    color: white;
    border: 0.8px solid white;
    display: inline-block;
    padding: 2px 12px;
    border-radius: 500px;
    position: relative;
    z-index: 10;
    background: black;
  }
`;

export const ThinLine = styled(motion.div)`
  height: 5px;
  width: 400px;
  position: absolute;
  z-index: -10;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
`;

export const Colon = styled.div`
  display: flex;
  p {
    font-size: 32px;
    font-weight: 300;
    text-align: center;
    color: white;
    margin: 0;
  }
`;

export const Timer = styled.div`
  display: flex;
  color: white;
  margin-top: 8px;
`;

export const TimerItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 16px;
`;

export const TimerItemValue = styled.div`
  font-size: 32px;
  font-weight: 300;
  text-align: center;
  color: white;
`;

export const TimerItemLabel = styled.div`
  font-size: 12px;
  font-weight: 400;
  text-align: center;
  color: #868686;
`;
