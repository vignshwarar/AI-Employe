import React from "react";
import { Toaster } from "sonner";

import { Page } from "../store/pageSlice";
import Header from "../components/Header";
import Navigation from "../components/Navigation";
import MessageInput from "../components/Message/input";
import { useStore } from "../store";

import * as S from "./styles";

interface LayoutProps {
  children?: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { blurContent, activePage, loading } = useStore();
  const isMessagesPage = activePage === Page.Messages;
  const isLoginPage = activePage === Page.Login;

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Toaster position="top-center" />
      <Header />
      {!isLoginPage && <Navigation />}
      <S.LayoutWrapper
        style={{
          opacity: blurContent && !isMessagesPage ? 0.3 : 1,
        }}
      >
        {children}
      </S.LayoutWrapper>
      {!isLoginPage && <MessageInput />}
    </>
  );
};

export default Layout;
