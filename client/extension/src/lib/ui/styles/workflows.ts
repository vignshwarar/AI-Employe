import styled, { keyframes } from "styled-components";
import { colors } from "./global";

export const WorkflowContainer = styled.div`
  height: 80vh;
  padding: 20px 20px 0 20px;
  overflow-y: scroll;
`;

export const WorkflowContentWrapper = styled.div`
  width: 100%;
  background: white;
  margin-bottom: 8px;
  border-radius: 12px;
  padding: 10px 12px;
  box-sizing: border-box;
  overflow: hidden;
  height: 180px;
  display: flex;
  flex-direction: column;
  min-height: 150px;
  position: relative;

  h3 {
    font-size: 15px;
    font-weight: 400;
    color: black;
  }
  p {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    font-size: 12px;
    color: #7d7d7d;
    margin-bottom: 8px;
  }

  &:hover .edit {
    display: flex;
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -468px 0;
  }
  100% {
    background-position: 468px 0;
  }
`;

export const WorkflowContentPlaceholder = styled.div`
  height: 150px;
  background: #f6f7f8;
  background: linear-gradient(to right, #e7e7e7 8%, #dddddd 28%, #e7e7e7 33%);
  background-size: 800px 104px;
  position: relative;
  animation: ${shimmer} 1.5s infinite linear;
  border-radius: 12px;
`;

export const WorkflowTitle = styled.h2`
  font-size: 18px;
  font-weight: 400;
  color: black;
  margin-bottom: 8px;
`;

export const WorkflowOptions = styled.div`
  display: flex;
  align-items: center;
`;

export const EditWorkflowButton = styled.button`
  width: 25px;
  height: 25px;
  align-items: center;
  justify-content: center;
  position: absolute;
  right: 10px;
  border-radius: 50%;
  border: none;
  background-color: transparent;
  outline: none;
  cursor: pointer;
  display: none;

  svg {
    path {
      fill: ${colors.strongGrey};
    }
  }

  &:hover {
    background: ${colors.lightGrey};
  }
`;

export const TasksTag = styled.div`
  display: flex;
  background: ${colors.lightGrey};
  align-items: center;
  border-radius: 8px;
  padding: 4px 8px;
  cursor: pointer;
  border: none;
  outline: none;
  width: fit-content;
  font-size: 12px;

  p {
    margin-left: 4px;
    margin-bottom: 0;
    color: ${colors.strongGrey};
  }

  svg {
    path {
      fill: ${colors.strongGrey};
    }
  }

  &:hover {
    opacity: 0.8;
  }
`;
