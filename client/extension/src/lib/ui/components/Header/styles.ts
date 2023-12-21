import styled from "styled-components";

export const Header = styled.header`
  height: 60px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  .IconButton {
    border-radius: 50%;
    width: 25px;
    height: 25px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #fff;
    cursor: pointer;
    border: 1px solid #e0e0e0;
    svg {
      fill: white;
      path {
        fill: #000;
      }
    }
  }

  .DropdownMenuContent {
    background-color: #fff;
    margin-right: 20px;
    margin-top: 4px;
    border-radius: 12px;
    padding: 4px;
    box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.1);
    z-index: 100;
  }

  .DropdownMenuItem {
    padding: 6px;
    cursor: pointer;
    background-color: transparent;
    font-size: 12px;
    border-radius: 8px;

    p {
      font-size: 10px;
      color: #b2b2b2;
    }

    &:hover {
      background-color: #f3f3f3;
      outline: none;
    }

    &:focus {
      background-color: #f3f3f3;
      outline: none;
    }
  }

  .DropdownMenuSeparator {
    background-color: #e0e0e0;
    height: 1px;
    margin: 4px 0;
  }
`;
