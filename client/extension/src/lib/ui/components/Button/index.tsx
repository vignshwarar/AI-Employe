import React from "react";

import * as S from "./styles";

interface ButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  type?: "button" | "submit" | "reset";
}

const Button = ({ onClick, children, style, disabled }: ButtonProps) => (
  <S.Button style={style} disabled={disabled} onClick={onClick}>
    {children}
  </S.Button>
);

export default Button;
