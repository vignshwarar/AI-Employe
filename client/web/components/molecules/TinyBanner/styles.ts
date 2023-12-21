import { motion } from "framer-motion";
import styled from "@emotion/styled";

export const TinyBannerContainer = styled(motion.div)`
  padding: 1px;
  background: linear-gradient(90deg, #ec008c 0%, #fc6767 100%);
  border-radius: 500px;
  cursor: pointer;
  width: fit-content;
  margin: 0 auto 16px auto;

  p {
    color: white;
    padding: 8px 16px;
    background: black;
    border-radius: 500px;
    display: inline-flex;
    align-items: center;
    font-size: 13px;
    width: 100%;

    svg {
      width: 16px;
      height: 16px;
    }
    span {
      margin-left: 6px;
      margin-right: 6px;
      font-weight: 500;
      color: #5a5a5a;
    }
  }
`;
