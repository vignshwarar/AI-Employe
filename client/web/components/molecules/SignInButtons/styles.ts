import styled from "@emotion/styled";
import { motion } from "framer-motion";

export const SignInButtons = styled.div`
  margin-top: 16px;
  display: flex;
  align-items: center;
  flex-direction: column;
`;

export const SignInWithGoogleBackground = styled(motion.div)`
  padding: 1.5px;
  background: white;
  border-radius: 50px;
  display: inline-block;
  margin-bottom: 16px;
`;

export const SignInWithGoogle = styled.button`
  display: flex;
  color: white;
  background: linear-gradient(174deg, #afafaf 0%, rgba(0, 0, 0, 0.8) 6%);

  padding: 16px 24px;
  border-radius: 50px;

  color: #ededed;
  font-size: 16px;
  font-weight: 300;

  span {
    margin-left: 8px;
  }
`;

export const Code = styled.div`
  border-radius: 32px;
  color: #fff;
  padding: 26px;
  background: black;
  width: 100%;
  height: 100%;
  cursor: pointer;

  &:hover {
    span {
      color: #fff;
      transition: all 0.5s ease-in-out;
    }
    h3 {
      color: #fff;
      transition: all 0.5s ease-in-out;
    }
  }
`;
