import React from "react";

import Logo from "../components/Logo";
import Button from "../components/Button";
import { sendMessage } from "../utils/message";
import { ActionType } from "../utils/types";
import * as S from "../styles/login";

const Login = () => {
  const handleSignIn = () => {
    sendMessage({
      actionType: ActionType.LOGIN,
    });
  };

  return (
    <S.LoginContainer>
      <S.LoginContentWrapper>
        <Logo />
        <h2>Hey, please sign in to get started.</h2>
        <Button onClick={handleSignIn} children="Sign in with Google" />
      </S.LoginContentWrapper>
    </S.LoginContainer>
  );
};

export default Login;
