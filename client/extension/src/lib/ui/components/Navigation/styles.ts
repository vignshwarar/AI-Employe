import styled from "styled-components";
import { colors } from "../../styles/global";

export const NavigationContainer = styled.nav`
  padding: 0 20px;
`;

export const NavigationList = styled.ul`
  display: flex;
  margin: 0;
  padding: 0;
  width: 100%;
  overflow-x: scroll;
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    width: 0;
    height: 0;
  }
`;

export const NavigationItem = styled.li`
  list-style: none;
  margin-right: 8px;
  padding: 2px 8px;
  border-radius: 16px;
  border: 1px solid ${colors.blue};
  background: ${colors.blueBackground};
  font-size: 12px;
  color: ${colors.blue};
  cursor: pointer;
  transition: background 0.2s ease-in-out;
  white-space: nowrap;

  &:hover {
    background: ${colors.blueBackgroundHover};
  }
`;
