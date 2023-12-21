import { motion } from "framer-motion";
import styled from "@emotion/styled";

export const ModalBackground = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100;
  width: 100%;
  height: 100%;
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const ModalContainer = styled(motion.div)`
  width: 400px;
  background-color: black;
  border-radius: 16px;
  border: 1px solid rgb(38, 38, 38);
  padding: 24px;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  @media (max-width: 768px) {
    width: 100%;
    height: 100%;
    border-radius: 0;
  }
`;

export const CloseBtn = styled.button`
  background-color: rgba(255, 255, 255, 0.1);
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  right: 16px;
  top: 16px;
  transition: all 0.2s ease-in-out;

  svg {
    path {
      stroke: rgba(255, 255, 255, 0.5);
    }
  }

  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
`;
