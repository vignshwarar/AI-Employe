import styled from "styled-components";

import { colors } from "../styles/global";

export const CreateWorkflowContainer = styled.div`
  height: 80vh;
  display: flex;
  width: 100%;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;

export const CreateWorkflowContentWrapper = styled.div`
  width: 80%;
  h2 {
    font-size: 18px;
    font-weight: 400;
    color: black;
  }
  p {
    color: #444444;
    font-family: Poppins;
    font-size: 14px;
    font-weight: 400;
    margin-bottom: 16px;
  }
`;

export const CreateWorkflowTextarea = styled.textarea`
  width: 100%;
  box-sizing: border-box;
  min-height: 110px;
  border-radius: 12px;
  padding: 10px 12px;
  font-size: 14px;
  border: 2px solid white;
  background: white;
  transition: border 0.2s ease-in-out;

  &:focus {
    outline: none;
    border: 2px solid ${colors.blue};
  }
`;

export const CreateWorkflowTitle = styled.input`
  width: 100%;
  box-sizing: border-box;
  border-radius: 12px;
  padding: 10px 12px;
  font-size: 14px;
  border: 2px solid white;
  background: white;
  transition: border 0.2s ease-in-out;
  margin-bottom: 8px;

  &:focus {
    outline: none;
    border: 2px solid ${colors.blue};
  }
`;

export const BackButton = styled.button`
  display: flex;
  align-items: center;
  border: none;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.05);
  font-size: 10px;
  margin-bottom: 8px;
  cursor: pointer;

  svg {
    margin-right: 4px;
    width: 10px;
    height: 10px;
  }

  &:hover {
    background: rgba(0, 0, 0, 0.1);
  }
`;
