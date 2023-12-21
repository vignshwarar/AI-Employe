import Link from "next/link";

import * as S from "./styles";

export default function Logo() {
  return (
    <S.LogoLink href="/">
      <img src="/logo.png" alt="AIEmployee" />
      <p>AI Employe</p>
    </S.LogoLink>
  );
}
