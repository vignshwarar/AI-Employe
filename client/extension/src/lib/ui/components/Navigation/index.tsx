import React from "react";

import { useStore } from "../../store";
import { Page } from "../../store/pageSlice";
import * as S from "./styles";

const Navigation = () => {
  const { setActivePage, setBlurContent, clearMessages, setEditingWorkflow } =
    useStore();

  const changePage = (page: Page) => {
    setActivePage(page);
    setBlurContent(false);
    clearMessages();
    setEditingWorkflow(null);
  };

  return (
    <S.NavigationContainer>
      <S.NavigationList>
        <S.NavigationItem onClick={() => changePage(Page.CreateWorkflow)}>
          Create workflow
        </S.NavigationItem>
        <S.NavigationItem onClick={() => changePage(Page.YourWorkflows)}>
          Your workflow
        </S.NavigationItem>
        <S.NavigationItem onClick={() => changePage(Page.Community)}>
          Community
        </S.NavigationItem>
      </S.NavigationList>
    </S.NavigationContainer>
  );
};

export default Navigation;
