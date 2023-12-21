import styled from "styled-components";

import { colors } from "../../styles/global";

export const MessageContainer = styled.div`
  width: 100%;
  padding: 8px 20px 20px 20px;
  box-sizing: border-box;
`;

export const MessageInputForm = styled.form`
  width: 100%;
  position: relative;
`;

export const MessageInput = styled.input`
  width: 100%;
  box-sizing: border-box;
  padding: 10px 12px;
  font-size: 14px;
  border-radius: 12px;
  border: 2px solid white;
  background: white;
  transition: border 0.2s ease-in-out;

  &:focus {
    outline: none;
    border: 2px solid ${colors.blue};
  }

  &::placeholder {
    color: #bfbfbf;
  }

  &:hover {
    box-shadow: 0px 8px 20px 0px rgba(0, 0, 0, 0.09);
  }
`;

export const SendButton = styled.button`
  position: absolute;
  right: 7px;
  top: 50%;
  transform: translateY(-50%);
  background: ${colors.blue};
  color: white;
  border: none;
  border-radius: 10px;
  width: 32px;
  height: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const MessageWrapper = styled.div`
  width: 100%;
  height: 100%;
  overflow-y: auto;
  padding: 20px 20px 0px 20px;
  box-sizing: border-box;
  height: 80vh;
  display: flex;
  flex-direction: column;
`;

export const MessageList = styled.div`
  margin-top: auto;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  overflow-y: scroll;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* Internet Explorer 10+ */

  &::-webkit-scrollbar {
    width: 0;
    height: 0;
  }
`;

export const Message = styled.div`
  margin-bottom: 8px;
`;

export const Role = styled.div``;

export const MessageContent = styled.p`
  color: #3d3d3d;
  font-size: 15px;
  word-break: break-word;
`;

export const DummyDivToScroll = styled.div`
  height: 2px;
  width: 50%;
  box-sizing: border-box;
`;

export const AI = styled.p`
  margin-bottom: 4px;
  font-weight: 500;
  background: linear-gradient(
    90deg,
    #ff5b81 0%,
    #ff9b63 29.39%,
    #fb4646 67.71%,
    #fb46f8 100%
  );
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 13px;
`;

export const You = styled.p`
  margin-bottom: 2px;
  color: #808080;
  font-weight: 500;
  font-size: 13px;
`;
