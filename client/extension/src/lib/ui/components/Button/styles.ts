import styled from "styled-components";

import { colors } from "../../styles/global";

export const Button = styled.button`
  width: 100%;
  background: ${colors.blue};
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  font-size: 14px;
  cursor: pointer;
  transition: opacity 0.2s ease-in-out;
  display: flex;
  justify-content: center;
  align-items: center;

  svg {
    margin-right: 8px;
    width: 16px;
    height: 16px;
  }

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
