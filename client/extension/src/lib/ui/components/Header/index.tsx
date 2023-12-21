import React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { HamburgerMenuIcon } from "@radix-ui/react-icons";

import { sendMessage } from "../../utils/message";
import { ActionType } from "../../utils/types";
import { useStore } from "../../store";
import { Page } from "../../store/pageSlice";

import Logo from "../Logo";
import * as S from "./styles";

const Header = () => {
  return (
    <S.Header>
      <Logo />
      <Dropdown />
    </S.Header>
  );
};

const Dropdown = () => {
  const { user, setActivePage } = useStore();

  if (!user) {
    return null;
  }

  const handleSignOut = () => {
    sendMessage({
      actionType: ActionType.LOGOUT,
    });
    setActivePage(Page.Login);
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="IconButton">
          <HamburgerMenuIcon />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Content className="DropdownMenuContent">
        <DropdownMenu.Item className="DropdownMenuItem">
          {user?.displayName}
          <p>{user?.email}</p>
        </DropdownMenu.Item>
        <DropdownMenu.Item
          onSelect={() => setActivePage(Page.SetupKey)}
          className="DropdownMenuItem"
        >
          Set OpenAI API Key
        </DropdownMenu.Item>
        <DropdownMenu.Item
          onSelect={handleSignOut}
          className="DropdownMenuItem"
        >
          Logout
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
};

export default Header;
